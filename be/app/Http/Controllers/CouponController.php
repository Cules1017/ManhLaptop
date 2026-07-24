<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CouponController extends Controller
{
    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:0'
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json([
                'status' => false,
                'message' => 'Mã giảm giá không tồn tại.'
            ], 404);
        }

        if (!$coupon->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Mã giảm giá đã bị vô hiệu hóa.'
            ], 400);
        }

        $now = Carbon::now();

        if ($coupon->valid_from && $now->lt($coupon->valid_from)) {
            return response()->json([
                'status' => false,
                'message' => 'Mã giảm giá chưa đến thời gian bắt đầu.'
            ], 400);
        }

        if ($coupon->valid_until && $now->gt($coupon->valid_until)) {
            return response()->json([
                'status' => false,
                'message' => 'Mã giảm giá đã hết hạn.'
            ], 400);
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json([
                'status' => false,
                'message' => 'Mã giảm giá đã hết lượt sử dụng.'
            ], 400);
        }

        if ($request->cart_total < $coupon->min_order_value) {
            return response()->json([
                'status' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này (Tối thiểu: ' . number_format($coupon->min_order_value) . ' đ).'
            ], 400);
        }

        // Tính toán số tiền giảm
        $discountAmount = 0;
        if ($coupon->type === 'fixed') {
            $discountAmount = $coupon->value;
        } else if ($coupon->type === 'percent') {
            $discountAmount = ($request->cart_total * $coupon->value) / 100;
            if ($coupon->max_discount !== null && $discountAmount > $coupon->max_discount) {
                $discountAmount = $coupon->max_discount;
            }
        }

        // Đảm bảo không giảm quá tổng tiền
        if ($discountAmount > $request->cart_total) {
            $discountAmount = $request->cart_total;
        }

        return response()->json([
            'status' => true,
            'message' => 'Áp dụng mã giảm giá thành công.',
            'data' => [
                'coupon' => $coupon,
                'discount_amount' => $discountAmount
            ]
        ]);
    }
}
