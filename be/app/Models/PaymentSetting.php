<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $fillable = ['setting_key', 'setting_value'];

    public static function getValue(string $key, ?string $default = null): ?string
    {
        $item = static::query()->where('setting_key', $key)->first();
        if (!$item) {
            return $default;
        }

        $value = $item->setting_value;
        return $value === null || $value === '' ? $default : $value;
    }

    public static function setValue(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(
            ['setting_key' => $key],
            ['setting_value' => $value]
        );
    }
}
