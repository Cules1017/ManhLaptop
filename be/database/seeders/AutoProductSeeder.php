<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\ProductImage;
use Carbon\Carbon;

class AutoProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $jsonPath = database_path('data/generated_laptops_more.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("Tệp JSON không tồn tại: {$jsonPath}");
            $this->command->info("Vui lòng chạy script python để tạo data trước: python database/seeders/generate_laptops.py");
            return;
        }

        $json = File::get($jsonPath);
        $products = json_decode($json, true);

        if (!$products) {
            $this->command->error("Lỗi khi đọc file JSON hoặc tệp rỗng.");
            return;
        }

        $this->command->info("Đang import " . count($products) . " sản phẩm vào cơ sở dữ liệu...");

        foreach ($products as $pData) {
            // Import sản phẩm chính
            $product = Product::create([
                'name' => $pData['name'],
                'description' => $pData['description'],
                'price' => $pData['price'],
                'discount' => $pData['discount'],
                'quantity' => $pData['quantity'],
                'category_id' => $pData['category_id'],
                'image' => $pData['image'] ?: null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);

            // Import gallery images nếu có
            if (!empty($pData['gallery']) && is_array($pData['gallery'])) {
                $galleries = [];
                foreach ($pData['gallery'] as $imgUrl) {
                    $galleries[] = [
                        'product_id' => $product->id,
                        'image_url' => $imgUrl,
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now()
                    ];
                }
                ProductImage::insert($galleries);
            }
        }

        $this->command->info("Import thành công!");
    }
}
