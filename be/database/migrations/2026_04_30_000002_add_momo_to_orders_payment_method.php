<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::statement("ALTER TABLE `orders` MODIFY `payment_method` ENUM('COD','bank_transfer','vnpay','momo') NOT NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE `orders` MODIFY `payment_method` ENUM('COD','bank_transfer','vnpay') NOT NULL");
    }
};
