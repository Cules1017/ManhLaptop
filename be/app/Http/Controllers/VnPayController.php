<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderSuccessMail;

class VnPayController extends Controller
{
    private function getClientIp(Request $request): string
    {
        // Prefer X-Forwarded-For when behind a proxy; fallback to REMOTE_ADDR.
        $ip = $request->header('X-Forwarded-For');
        if ($ip) {
            $parts = explode(',', $ip);
            return trim($parts[0]);
        }

        return $request->ip() ?: '127.0.0.1';
    }

    private function buildHashData(array $params): string
    {
        // Chuỗi ký VNPay phải là key=value raw, sort theo key, nối bởi '&'.
        // Không đưa vnp_SecureHash / vnp_SecureHashType vào chuỗi ký.
        unset($params['vnp_SecureHash'], $params['vnp_SecureHashType']);

        ksort($params);

        $pairs = [];
        foreach ($params as $key => $value) {
            if ($value === null) {
                continue;
            }

            $pairs[] = (string) $key . '=' . (string) $value;
        }

        return implode('&', $pairs);
    }

    private function verifySignature(array $inputData, string $secureHash, string $hashSecret): bool
    {
        $hashData = $this->buildHashData($inputData);
        $calculated = hash_hmac('sha512', $hashData, $hashSecret);
        return hash_equals($calculated, (string) $secureHash);
    }

    private function buildPaymentUrl(Order $order, Request $request): array
    {
        $tmnCode = trim((string) env('VNPAY_TMN_CODE'));
        $hashSecret = trim((string) env('VNPAY_HASH_SECRET'));

        $vnpUrl = env('VNPAY_PAYMENT_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        $vnpReturnUrl = env('VNPAY_RETURN_URL', 'http://127.0.0.1:8000/api/vnpay/return');

        // VNPay yêu cầu nhân 100 (khử phần thập phân). Ví dụ 100,000 VND -> 10000000.
        $amount = (int) round(((float) $order->total_price) * 100);
        $amount = max(0, $amount);

        // VNPay sandbox nhạy với timezone.
        $vnpCreateDate = now()->setTimezone('Asia/Ho_Chi_Minh')->format('YmdHis');
        $vnpExpireMinutes = (int) env('VNPAY_EXPIRE_MINUTES', 30);
        $vnpExpireDate = now()
            ->setTimezone('Asia/Ho_Chi_Minh')
            ->addMinutes($vnpExpireMinutes)
            ->format('YmdHis');

        $bankCode = trim((string) env('VNPAY_BANK_CODE', ''));

        $vnpayParams = [
            'vnp_Version' => env('VNPAY_VERSION', '2.1.0'),
            'vnp_Command' => 'pay',
            'vnp_TmnCode' => $tmnCode,
            'vnp_Amount' => (string) $amount,
            'vnp_CreateDate' => $vnpCreateDate,
            'vnp_CurrCode' => 'VND',
            'vnp_IpAddr' => $this->getClientIp($request),
            'vnp_Locale' => env('VNPAY_LOCALE', 'vn'),
            // Keep order info plain ASCII/alphanumeric to avoid parser differences on special chars (e.g. '#').
            'vnp_OrderInfo' => 'Laptop Shop Order ' . $order->id,
            'vnp_OrderType' => env('VNPAY_ORDER_TYPE', 'other'),
            'vnp_ReturnUrl' => $vnpReturnUrl,
            'vnp_TxnRef' => (string) $order->id,
            'vnp_ExpireDate' => $vnpExpireDate,
        ];
        // Per VNPay 2.1.0 spec: vnp_SecureHashType phải KHÔNG gửi sang VNPay.

        // Important: If bank code is empty, omit param entirely.
        // Some VNPay sandbox implementations treat missing vs empty differently for SecureHash.
        if ($bankCode !== '') {
            $vnpayParams['vnp_BankCode'] = $bankCode;
        }

        // 1) Sort key A->Z
        // 2) Tạo hashData raw (không encode)
        // 3) Tạo query URL (có encode) và KHÔNG có '&' cuối
        ksort($vnpayParams);

        $hashData = $this->buildHashData($vnpayParams);

        $queryParts = [];
        foreach ($vnpayParams as $key => $value) {
            $queryParts[] = urlencode((string) $key) . '=' . urlencode((string) $value);
        }
        $query = implode('&', $queryParts);

        $secureHash = hash_hmac('sha512', $hashData, $hashSecret);
        $paymentUrl = $vnpUrl . '?' . $query . '&vnp_SecureHash=' . $secureHash;

        return [
            'payment_url' => $paymentUrl,
            'signed_params' => $vnpayParams,
            'hash_data' => $hashData,
            'secure_hash' => $secureHash,
        ];
    }

    public function checkout(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:vnpay',
            'note' => 'nullable|string',
            'coupon_code' => 'nullable|string',
        ]);

        $mock = filter_var(env('VNPAY_MOCK', 'false'), FILTER_VALIDATE_BOOLEAN);
        $tmnCode = trim((string) env('VNPAY_TMN_CODE'));
        $hashSecret = trim((string) env('VNPAY_HASH_SECRET'));
        if (!$tmnCode || !$hashSecret) {
            // Local/dev convenience: if VNPay credentials are not set, we still allow "test flow".
            $mock = true;
        }

        DB::beginTransaction();
        try {
            $couponId = null;
            $discountAmount = 0;
            $finalTotal = $request->total_price;

            if ($request->coupon_code) {
                $coupon = \App\Models\Coupon::where('code', $request->coupon_code)->lockForUpdate()->first();
                if (!$coupon) {
                    DB::rollBack();
                    return response()->json([
                        'status' => false,
                        'message' => 'Mã giảm giá không tồn tại.'
                    ], 400);
                }
                
                $eligibility = $coupon->checkUserEligibility($user, $request->total_price);
                if (!$eligibility['status']) {
                    DB::rollBack();
                    return response()->json([
                        'status' => false,
                        'message' => $eligibility['message']
                    ], 400);
                }

                $couponId = $coupon->id;
                $discountAmount = $coupon->calculateDiscount($request->total_price);
                $finalTotal = $request->total_price - $discountAmount;
                
                $coupon->used_count += 1;
                $coupon->save();
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total_price' => $finalTotal,
                'coupon_id' => $couponId,
                'discount_amount' => $discountAmount,
            ]);
            $order->payment_method = 'vnpay';
            $order->status = 'pending';
            $order->note = $request->note;
            $order->save();

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                // Trừ số lượng tồn kho
                $product = \App\Models\Product::find($item['product_id']);
                if ($product) {
                    $product->quantity = max(0, $product->quantity - $item['quantity']);
                    $product->save();
                }
            }

            // Create payment request first, then clear cart to prevent duplicate order attempts.
            CartItem::where('user_id', $user->id)->delete();

            if ($mock) {
                // Keep the same initial status as COD checkout so customer UI stays consistent.
                $order->status = 'pending';
                $order->save();

                DB::commit();

                $frontendReturnUrl = env('VNPAY_FRONTEND_RETURN_URL', 'http://localhost:3001/vnpay-return');

                return response()->json([
                    'status' => true,
                    'message' => 'VNPay mock mode',
                    'data' => [
                        'order_id' => $order->id,
                        'redirect_url' => $frontendReturnUrl . '?result=success&orderId=' . $order->id,
                    ],
                ]);
            }

            $payload = $this->buildPaymentUrl($order, $request);

            DB::commit();

            $responseData = [
                'order_id' => $order->id,
                'payment_url' => $payload['payment_url'],
            ];

            if ((bool) config('app.debug')) {
                $responseData['signed_params'] = $payload['signed_params'] ?? [];
                $responseData['hash_data'] = $payload['hash_data'] ?? '';
                $responseData['secure_hash'] = $payload['secure_hash'] ?? '';
                $responseData['vnpay_tmn_code'] = (string) env('VNPAY_TMN_CODE');
                $responseData['vnpay_hash_secret'] = (string) env('VNPAY_HASH_SECRET');
            }

            return response()->json([
                'status' => true,
                'message' => 'Redirect to VNPay',
                'data' => $responseData,
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('VNPay checkout error: ' . $th->getMessage(), ['trace' => $th->getTraceAsString()]);

            return response()->json([
                'status' => false,
                'message' => 'VNPay checkout failed',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function returnUrl(Request $request)
    {
        $input = $request->query();
        $secureHash = $input['vnp_SecureHash'] ?? '';
        $hashSecret = trim((string) env('VNPAY_HASH_SECRET'));

        // Extract vnp_* params excluding SecureHash fields.
        $vnpInputData = $input;
        unset($vnpInputData['vnp_SecureHash']);
        unset($vnpInputData['vnp_SecureHashType']);

        $orderId = (int) ($input['vnp_TxnRef'] ?? 0);
        $responseCode = (string) ($input['vnp_ResponseCode'] ?? '');

        $result = 'fail';

        try {
            if ($hashSecret && $secureHash) {
                // Verify HMAC signature to ensure integrity.
                $vnpOnly = [];
                foreach ($vnpInputData as $k => $v) {
                    if (str_starts_with((string) $k, 'vnp_')) {
                        $vnpOnly[$k] = $v;
                    }
                }

                $ok = $this->verifySignature($vnpOnly, $secureHash, $hashSecret);
                if ($ok && $responseCode === '00') {
                    $result = 'success';
                }
            }

            $order = Order::find($orderId);
            if ($order) {
                $order->status = $result === 'success' ? 'pending' : 'cancelled';
                $order->save();
            }
        } catch (\Throwable $th) {
            Log::error('VNPay returnUrl error: ' . $th->getMessage());
        }

        $frontendReturnUrl = env('VNPAY_FRONTEND_RETURN_URL', 'http://localhost:3001/vnpay-return');
        $redirectUrl = $frontendReturnUrl . '?result=' . urlencode($result) . '&orderId=' . urlencode((string) $orderId);

        return redirect()->away($redirectUrl);
    }

    public function notify(Request $request)
    {
        $input = $request->query();
        $secureHash = $input['vnp_SecureHash'] ?? '';
        $hashSecret = trim((string) env('VNPAY_HASH_SECRET'));

        $vnpInputData = $input;
        unset($vnpInputData['vnp_SecureHash']);
        unset($vnpInputData['vnp_SecureHashType']);

        $orderId = (int) ($input['vnp_TxnRef'] ?? 0);
        $responseCode = (string) ($input['vnp_ResponseCode'] ?? '');

        $result = 'fail';

        try {
            $vnpOnly = [];
            foreach ($vnpInputData as $k => $v) {
                if (str_starts_with((string) $k, 'vnp_')) {
                    $vnpOnly[$k] = $v;
                }
            }

            if ($hashSecret && $secureHash) {
                $ok = $this->verifySignature($vnpOnly, $secureHash, $hashSecret);
                if ($ok && $responseCode === '00') {
                    $result = 'success';
                }
            }

            $order = Order::find($orderId);
            if ($order) {
                $oldStatus = $order->status;
                $newStatus = $result === 'success' ? 'pending' : 'cancelled';
                
                if ($oldStatus !== 'pending' && $newStatus === 'pending') {
                    $order->status = $newStatus;
                    $order->save();
                    
                    // Send Email on successful VNPay payment
                    try {
                        Mail::to($order->user->email)->send(new OrderSuccessMail($order));
                    } catch (\Exception $e) {
                        Log::error('VNPay IPN Mail Error: ' . $e->getMessage());
                    }
                } else {
                    $order->status = $newStatus;
                    $order->save();
                }
            }
        } catch (\Throwable $th) {
            Log::error('VNPay notify error: ' . $th->getMessage());
        }

        // VNPay IPN commonly expects a plain text response.
        return response()->json(['RspCode' => '00', 'Message' => 'OK']);
    }
}

