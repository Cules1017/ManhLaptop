<?php

namespace App\Http\Controllers;

use App\Models\PaymentSetting;

class PaymentConfigController extends Controller
{
    public function publicConfig()
    {
        return response()->json([
            'status' => true,
            'data' => [
                'vietqr_bank_bin' => PaymentSetting::getValue('vietqr_bank_bin', env('VIETQR_BANK_BIN', '970422')),
                'vietqr_account_no' => PaymentSetting::getValue('vietqr_account_no', env('VIETQR_ACCOUNT_NO', '0123456789')),
                'vietqr_account_name' => PaymentSetting::getValue('vietqr_account_name', env('VIETQR_ACCOUNT_NAME', 'LAPTOP SHOP')),
                'vietqr_template' => PaymentSetting::getValue('vietqr_template', env('VIETQR_TEMPLATE', 'compact2')),
            ],
        ]);
    }
}
