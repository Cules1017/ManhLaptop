<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_value',
        'max_discount',
        'usage_limit',
        'used_count',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function checkUserEligibility($user, $cartTotal)
    {
        if (!$this->is_active) {
            return [
                'status' => false,
                'message' => 'Mã giảm giá đã bị vô hiệu hóa.'
            ];
        }

        $now = \Carbon\Carbon::now();

        if ($this->valid_from && $now->lt($this->valid_from)) {
            return [
                'status' => false,
                'message' => 'Mã giảm giá chưa có hiệu lực.'
            ];
        }

        if ($this->valid_until && $now->gt($this->valid_until)) {
            return [
                'status' => false,
                'message' => 'Mã giảm giá đã hết hạn.'
            ];
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return [
                'status' => false,
                'message' => 'Mã giảm giá đã hết lượt sử dụng.'
            ];
        }

        if ($cartTotal < $this->min_order_value) {
            return [
                'status' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này (Tối thiểu: ' . number_format($this->min_order_value) . ' đ).'
            ];
        }

        // Kiểm tra giới hạn sử dụng của người dùng đối với mã này
        $usedCount = \App\Models\Order::where('user_id', $user->id)
            ->where('coupon_id', $this->id)
            ->where('status', '!=', 'cancelled')
            ->count();

        $wheelCoupons = ['LUCKY20K', 'LUCKY50K', 'LUCKY5PT'];
        $isWheelCoupon = in_array($this->code, $wheelCoupons);

        if ($isWheelCoupon) {
            $wonCount = \App\Models\LuckyWheelSpin::where('user_id', $user->id)
                ->where('coupon_code', $this->code)
                ->count();
            if ($wonCount === 0) {
                return [
                    'status' => false,
                    'message' => 'Bạn chưa trúng mã giảm giá này từ vòng quay may mắn.'
                ];
            }
            if ($usedCount >= $wonCount) {
                return [
                    'status' => false,
                    'message' => 'Bạn đã sử dụng hết lượt của mã giảm giá này. Hãy tham gia vòng quay may mắn để nhận thêm lượt.'
                ];
            }
        } else {
            if ($usedCount >= 1) {
                return [
                    'status' => false,
                    'message' => 'Bạn đã sử dụng mã giảm giá này rồi.'
                ];
            }
        }

        return [
            'status' => true,
            'message' => 'Hợp lệ'
        ];
    }

    public function calculateDiscount($cartTotal)
    {
        $discountAmount = 0;
        if ($this->type === 'fixed') {
            $discountAmount = $this->value;
        } else if ($this->type === 'percent') {
            $discountAmount = ($cartTotal * $this->value) / 100;
            if ($this->max_discount !== null && $discountAmount > $this->max_discount) {
                $discountAmount = $this->max_discount;
            }
        }
        if ($discountAmount > $cartTotal) {
            $discountAmount = $cartTotal;
        }
        return $discountAmount;
    }
}
