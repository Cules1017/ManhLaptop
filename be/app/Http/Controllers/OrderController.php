<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderSuccessMail;

class OrderController extends Controller
{
    // API đặt hàng (checkout)
    public function checkout(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:COD,bank_transfer',
            'note' => 'nullable|string',
            'coupon_code' => 'nullable|string'
        ]);
        DB::beginTransaction();
        try {
            $couponId = null;
            $discountAmount = 0;
            $finalTotal = $request->total_price;

            if ($request->coupon_code) {
                $coupon = \App\Models\Coupon::where('code', $request->coupon_code)->lockForUpdate()->first();
                if ($coupon && $coupon->is_active) {
                    $now = \Carbon\Carbon::now();
                    $isValid = true;
                    if ($coupon->valid_from && $now->lt($coupon->valid_from)) $isValid = false;
                    if ($coupon->valid_until && $now->gt($coupon->valid_until)) $isValid = false;
                    if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) $isValid = false;
                    if ($request->total_price < $coupon->min_order_value) $isValid = false;

                    if ($isValid) {
                        $couponId = $coupon->id;
                        if ($coupon->type === 'fixed') {
                            $discountAmount = $coupon->value;
                        } else {
                            $discountAmount = ($request->total_price * $coupon->value) / 100;
                            if ($coupon->max_discount !== null && $discountAmount > $coupon->max_discount) {
                                $discountAmount = $coupon->max_discount;
                            }
                        }
                        if ($discountAmount > $request->total_price) {
                            $discountAmount = $request->total_price;
                        }
                        $finalTotal = $request->total_price - $discountAmount;
                        
                        $coupon->used_count += 1;
                        $coupon->save();
                    }
                }
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total_price' => $finalTotal,
                'coupon_id' => $couponId,
                'discount_amount' => $discountAmount,
            ]);
            $order->payment_method = $request->payment_method;
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
            }
            // Xóa cart của user sau khi đặt hàng
            CartItem::where('user_id', $user->id)->delete();
            DB::commit();

            // Gửi email
            try {
                Mail::to($user->email)->send(new OrderSuccessMail($order));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Lỗi gửi email: ' . $e->getMessage());
            }

            return response()->json([
                'status' => true,
                'message' => 'Đặt hàng thành công',
                'data' => $order
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Đặt hàng thất bại',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    // API lấy danh sách đơn hàng của user hiện tại
    public function list(Request $request)
    {
        $user = $request->user();
        $orders = Order::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->with(['items.product'])
            ->get();
        // Bổ sung review cho từng item
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $review = \App\Models\Review::where('user_id', $user->id)
                    ->where('product_id', $item->product_id)
                    ->first();
                $item->review = $review;
            }
        }
        return response()->json([
            'status' => true,
            'data' => $orders
        ]);
    }
} 