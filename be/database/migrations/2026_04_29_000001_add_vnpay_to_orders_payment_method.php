<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Extend enum for VNPay integration (local sandbox).
        DB::statement("ALTER TABLE `orders` MODIFY `payment_method` ENUM('COD','bank_transfer','vnpay') NOT NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE `orders` MODIFY `payment_method` ENUM('COD','bank_transfer') NOT NULL");
    }
};

