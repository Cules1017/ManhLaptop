<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentSetting;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MomoController extends Controller
{
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
            'payment_method' => 'required|in:momo',
            'note' => 'nullable|string',
            'coupon_code' => 'nullable|string',
        ]);

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
            $order->payment_method = 'momo';
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

            CartItem::where('user_id', $user->id)->delete();

            DB::commit();

            $amount = (int) round((float) $order->total_price);
            $productIds = collect($request->items)
                ->pluck('product_id')
                ->filter()
                ->unique()
                ->values();
            $firstProductId = $productIds->first();
            $firstProductName = $firstProductId ? (string) Product::where('id', $firstProductId)->value('name') : '';
            $productCount = (int) $productIds->count();
            $orderInfoRaw = $firstProductName
                ? (
                    $productCount > 1
                        ? ("Thanh toan {$firstProductName} va " . ($productCount - 1) . ' san pham tai Manh Store')
                        : ("Thanh toan {$firstProductName} tai Manh Store")
                )
                : ('Thanh toan don hang ' . $order->id . ' tai Manh Store');
            $orderInfo = Str::ascii($orderInfoRaw);
            $orderInfo = preg_replace('/[^A-Za-z0-9 ]+/', ' ', $orderInfo) ?? '';
            $orderInfo = preg_replace('/\s+/', ' ', trim($orderInfo)) ?? '';
            $orderInfo = mb_substr($orderInfo, 0, 50);
            if ($orderInfo === '') {
                $orderInfo = 'Thanh toan tai Manh Store';
            }

            $endpoint = PaymentSetting::getValue('momo_endpoint', env('MOMO_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/create'));
            $partnerCode = PaymentSetting::getValue('momo_partner_code', env('MOMO_PARTNER_CODE', ''));
            $accessKey = PaymentSetting::getValue('momo_access_key', env('MOMO_ACCESS_KEY', ''));
            $secretKey = PaymentSetting::getValue('momo_secret_key', env('MOMO_SECRET_KEY', ''));
            $redirectUrl = PaymentSetting::getValue('momo_redirect_url', env('MOMO_REDIRECT_URL', 'http://localhost:3001/momo-return'));
            $ipnUrl = PaymentSetting::getValue('momo_ipn_url', env('MOMO_IPN_URL', 'http://127.0.0.1:8000/api/momo/ipn'));
            $requestType = PaymentSetting::getValue('momo_request_type', env('MOMO_REQUEST_TYPE', 'captureWallet'));
            $storeId = PaymentSetting::getValue('momo_store_id', env('MOMO_STORE_ID', 'MomoTestStore'));

            if (!$partnerCode || !$accessKey || !$secretKey) {
                return response()->json([
                    'status' => true,
                    'message' => 'MoMo config missing, fallback to simulator',
                    'data' => [
                        'order_id' => $order->id,
                        'redirect_url' => 'http://localhost:3001/payment-simulator?method=momo&orderId='
                            . urlencode((string) $order->id)
                            . '&amount=' . urlencode((string) $amount)
                            . '&orderInfo=' . urlencode($orderInfo),
                    ],
                ]);
            }

            $requestId = (string) Str::uuid();
            $momoOrderId = 'ORDER_' . $order->id . '_' . now()->format('YmdHis');
            $extraData = base64_encode(json_encode(['order_id' => $order->id]));

            $rawHash = "accessKey={$accessKey}"
                . "&amount={$amount}"
                . "&extraData={$extraData}"
                . "&ipnUrl={$ipnUrl}"
                . "&orderId={$momoOrderId}"
                . "&orderInfo={$orderInfo}"
                . "&partnerCode={$partnerCode}"
                . "&redirectUrl={$redirectUrl}"
                . "&requestId={$requestId}"
                . "&requestType={$requestType}";

            $signature = hash_hmac('sha256', $rawHash, $secretKey);

            $payload = [
                'partnerCode' => $partnerCode,
                'partnerName' => 'Laptop Shop',
                'storeId' => $storeId,
                'requestId' => $requestId,
                'amount' => (string) $amount,
                'orderId' => $momoOrderId,
                'orderInfo' => $orderInfo,
                'redirectUrl' => $redirectUrl,
                'ipnUrl' => $ipnUrl,
                'lang' => 'vi',
                'requestType' => $requestType,
                'autoCapture' => true,
                'extraData' => $extraData,
                'signature' => $signature,
            ];

            $momoResponse = Http::timeout(20)->post($endpoint, $payload);
            if (!$momoResponse->successful()) {
                throw new \RuntimeException('MoMo gateway error: ' . $momoResponse->body());
            }

            $result = $momoResponse->json();
            if ((int) ($result['resultCode'] ?? -1) !== 0) {
                $resultCode = (int) ($result['resultCode'] ?? -1);
                $message = (string) ($result['message'] ?? 'Unknown error');
                throw new \RuntimeException("MoMo create payment failed [{$resultCode}]: {$message}");
            }

            $qrCodeUrl = $result['qrCodeUrl'] ?? null;
            $frontendSimulatorUrl = 'http://localhost:3001/payment-simulator';
            $expiresAt = now()->addMinutes((int) env('MOMO_EXPIRE_MINUTES', 15))->toIso8601String();

            return response()->json([
                'status' => true,
                'message' => 'MoMo QR generated',
                'data' => [
                    'order_id' => $order->id,
                    'qr_code_url' => $qrCodeUrl,
                    'expires_at' => $expiresAt,
                    'redirect_url' => $frontendSimulatorUrl
                        . '?method=momo&orderId=' . urlencode((string) $order->id)
                        . '&amount=' . urlencode((string) $amount)
                        . '&qrCodeUrl=' . urlencode((string) ($qrCodeUrl ?? ''))
                        . '&paymentUrl=' . urlencode((string) ($result['payUrl'] ?? ''))
                        . '&orderInfo=' . urlencode($orderInfo)
                        . '&expiresAt=' . urlencode($expiresAt),
                    'raw_response' => $result,
                ],
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error('MoMo checkout error: ' . $th->getMessage(), ['trace' => $th->getTraceAsString()]);

            return response()->json([
                'status' => false,
                'message' => 'MoMo checkout failed',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function ipn(Request $request)
    {
        $orderId = (string) $request->input('orderId', '');
        $resultCode = (int) $request->input('resultCode', -1);

        // orderId format: ORDER_<local_order_id>_YYYYMMDDHHMMSS
        $parts = explode('_', $orderId);
        $localOrderId = isset($parts[1]) ? (int) $parts[1] : 0;

        if ($localOrderId > 0) {
            $order = Order::find($localOrderId);
            if ($order) {
                $order->status = $resultCode === 0 ? 'pending' : 'cancelled';
                $order->save();
            }
        }

        return response()->json(['resultCode' => 0, 'message' => 'OK']);
    }

}
