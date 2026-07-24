<?php

namespace App\Http\Controllers;

use App\Models\LuckyWheelSpin;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LuckyWheelController extends Controller
{
    public function spin(Request $request)
    {
        $user = $request->user();

        // 1. Kiểm tra hôm nay user đã quay bao nhiêu lần
        $spinsToday = LuckyWheelSpin::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->count();

        if ($spinsToday >= 3) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn đã sử dụng hết 3 lượt quay trong ngày hôm nay. Hãy quay lại vào ngày mai nhé!'
            ], 400);
        }

        // 2. Định nghĩa các giải thưởng và tỷ lệ trúng (Trọng số / Probability)
        // Chúng ta thiết kế vòng quay có 6 ô (index từ 0 đến 5)
        $prizes = [
            [
                'index' => 0,
                'name' => 'Chúc bạn may mắn',
                'coupon_code' => null,
                'weight' => 25 // 25% trượt
            ],
            [
                'index' => 1,
                'name' => 'Giảm 20K',
                'coupon_code' => 'LUCKY20K',
                'weight' => 30 // 30% trúng 20k
            ],
            [
                'index' => 2,
                'name' => 'Chúc bạn may mắn',
                'coupon_code' => null,
                'weight' => 25 // 25% trượt
            ],
            [
                'index' => 3,
                'name' => 'Giảm 50K',
                'coupon_code' => 'LUCKY50K',
                'weight' => 15 // 15% trúng 50k
            ],
            [
                'index' => 4,
                'name' => 'Giảm 5%',
                'coupon_code' => 'LUCKY5PT',
                'weight' => 5 // 5% trúng 5%
            ],
            [
                'index' => 5,
                'name' => 'Chúc bạn may mắn',
                'coupon_code' => null,
                'weight' => 0 // Đã có đủ trượt ở trên, ô này có thể set 0 hoặc chia đều tuỳ ý. Sửa lại chút để tổng weight là 100
            ]
        ];

        // Chuẩn hoá lại tỷ lệ cho 6 ô:
        $prizes[0]['weight'] = 20; // Trượt
        $prizes[1]['weight'] = 30; // 20k
        $prizes[2]['weight'] = 20; // Trượt
        $prizes[3]['weight'] = 15; // 50k
        $prizes[4]['weight'] = 5;  // 5%
        $prizes[5]['weight'] = 10; // Trượt
        // Tổng weight: 20 + 30 + 20 + 15 + 5 + 10 = 100

        // 3. Thuật toán quay số (Weighted Random)
        $rand = mt_rand(1, 100);
        $currentWeight = 0;
        $wonPrize = null;

        foreach ($prizes as $prize) {
            $currentWeight += $prize['weight'];
            if ($rand <= $currentWeight) {
                $wonPrize = $prize;
                break;
            }
        }

        // Dự phòng (Failsafe)
        if (!$wonPrize) {
            $wonPrize = $prizes[0];
        }

        // 4. Lưu kết quả vào DB
        LuckyWheelSpin::create([
            'user_id' => $user->id,
            'prize_name' => $wonPrize['name'],
            'coupon_code' => $wonPrize['coupon_code']
        ]);

        return response()->json([
            'status' => true,
            'data' => [
                'index' => $wonPrize['index'],
                'prize_name' => $wonPrize['name'],
                'coupon_code' => $wonPrize['coupon_code'],
                'remaining_spins' => 3 - ($spinsToday + 1)
            ]
        ]);
    }

    public function status(Request $request)
    {
        $user = $request->user();

        // Đếm số lượt đã quay hôm nay
        $spinsToday = LuckyWheelSpin::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->count();

        // Lấy danh sách quà (chỉ lấy những lần trúng có coupon)
        $history = LuckyWheelSpin::where('user_id', $user->id)
            ->whereNotNull('coupon_code')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => [
                'remaining_spins' => max(0, 3 - $spinsToday),
                'history' => $history
            ]
        ]);
    }
}
