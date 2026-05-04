<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * DECIMAL(10,2) chỉ chứa tối đa ~99.999.999,99 — giá VND thực tế (điện thoại xa xỉ, v.v.) dễ vượt.
 * Mở rộng để hỗ trợ hàng nghìn tỷ VND (đủ cho thương mại thông thường).
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE products MODIFY price DECIMAL(15, 2) NOT NULL');
        DB::statement('ALTER TABLE order_items MODIFY price DECIMAL(15, 2) NOT NULL');
        DB::statement('ALTER TABLE orders MODIFY total_price DECIMAL(15, 2) NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE products MODIFY price DECIMAL(10, 2) NOT NULL');
        DB::statement('ALTER TABLE order_items MODIFY price DECIMAL(10, 2) NOT NULL');
        DB::statement('ALTER TABLE orders MODIFY total_price DECIMAL(10, 2) NOT NULL');
    }
};
