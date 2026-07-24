<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $coupons = [
            [
                'code' => 'LUCKY20K',
                'type' => 'fixed',
                'value' => 20000,
                'min_order_value' => 0,
                'max_discount' => null,
                'usage_limit' => 10000,
                'valid_from' => Carbon::now(),
                'valid_until' => Carbon::now()->addYear(),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'code' => 'LUCKY50K',
                'type' => 'fixed',
                'value' => 50000,
                'min_order_value' => 0,
                'max_discount' => null,
                'usage_limit' => 10000,
                'valid_from' => Carbon::now(),
                'valid_until' => Carbon::now()->addYear(),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'code' => 'LUCKY5PT',
                'type' => 'percent',
                'value' => 5,
                'min_order_value' => 0,
                'max_discount' => 100000, // Maximum 100k discount
                'usage_limit' => 10000,
                'valid_from' => Carbon::now(),
                'valid_until' => Carbon::now()->addYear(),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        foreach ($coupons as $coupon) {
            DB::table('coupons')->updateOrInsert(
                ['code' => $coupon['code']],
                $coupon
            );
        }
    }
}
