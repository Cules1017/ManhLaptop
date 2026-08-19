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

        $user = $request->user();
        $eligibility = $coupon->checkUserEligibility($user, $request->cart_total);

        if (!$eligibility['status']) {
            return response()->json([
                'status' => false,
                'message' => $eligibility['message']
            ], 400);
        }

        $discountAmount = $coupon->calculateDiscount($request->cart_total);

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
