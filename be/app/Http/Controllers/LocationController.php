<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class LocationController extends Controller
{
    public function provinces()
    {
        $response = Http::timeout(15)->get('https://provinces.open-api.vn/api/');

        if (!$response->successful()) {
            return response()->json([
                'status' => false,
                'message' => 'Khong tai duoc danh sach tinh/thanh',
            ], 502);
        }

        $data = collect($response->json() ?: [])->map(function ($item) {
            return [
                'code' => $item['code'] ?? null,
                'name' => $item['name'] ?? '',
            ];
        })->filter(fn ($item) => $item['code'] && $item['name'])->values();

        return response()->json([
            'status' => true,
            'data' => $data,
        ]);
    }

    public function districts(int $provinceCode)
    {
        $response = Http::timeout(15)->get("https://provinces.open-api.vn/api/?depth=2");

        if (!$response->successful()) {
            return response()->json([
                'status' => false,
                'message' => 'Khong tai duoc danh sach quan/huyen',
            ], 502);
        }

        $allProvinces = $response->json() ?: [];
        $province = collect($allProvinces)->firstWhere('code', $provinceCode);
        
        $districts = collect($province['districts'] ?? [])->map(function ($item) {
            return [
                'code' => $item['code'] ?? null,
                'name' => $item['name'] ?? '',
            ];
        })->filter(fn ($item) => $item['code'] && $item['name'])->values();

        return response()->json([
            'status' => true,
            'data' => $districts,
        ]);
    }
}
