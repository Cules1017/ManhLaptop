<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;

class PaymentConfigController extends Controller
{
    private const KEYS = [
        'vietqr_bank_bin',
        'vietqr_account_no',
        'vietqr_account_name',
        'vietqr_template',
        'momo_endpoint',
        'momo_partner_code',
        'momo_access_key',
        'momo_secret_key',
        'momo_redirect_url',
        'momo_ipn_url',
        'momo_request_type',
    ];

    public function show()
    {
        $data = [];
        foreach (self::KEYS as $key) {
            $data[$key] = PaymentSetting::getValue($key, '');
        }

        return response()->json([
            'status' => true,
            'data' => $data,
        ]);
    }

    public function update(Request $request)
    {
        $payload = $request->validate([
            'vietqr_bank_bin' => 'nullable|string|max:20',
            'vietqr_account_no' => 'nullable|string|max:50',
            'vietqr_account_name' => 'nullable|string|max:120',
            'vietqr_template' => 'nullable|string|max:30',
            'momo_endpoint' => 'nullable|string|max:255',
            'momo_partner_code' => 'nullable|string|max:100',
            'momo_access_key' => 'nullable|string|max:255',
            'momo_secret_key' => 'nullable|string|max:255',
            'momo_redirect_url' => 'nullable|string|max:255',
            'momo_ipn_url' => 'nullable|string|max:255',
            'momo_request_type' => 'nullable|string|max:100',
        ]);

        foreach (self::KEYS as $key) {
            if (array_key_exists($key, $payload)) {
                PaymentSetting::setValue($key, $payload[$key]);
            }
        }

        return $this->show();
    }
}
