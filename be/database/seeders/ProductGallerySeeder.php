<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductImage;

class ProductGallerySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xoá toàn bộ gallery cũ nếu có
        ProductImage::truncate();

        // Danh sách các bộ ảnh từ DummyJSON (an toàn, ảnh sản phẩm nền trắng thực tế)
        $galleries = [
            'macbook' => [
                'main' => 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp',
                'subs' => [
                    'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/2.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/3.webp'
                ]
            ],
            'asus' => [
                'main' => 'https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/thumbnail.webp',
                'subs' => [
                    'https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/1.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/2.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/3.webp'
                ]
            ],
            'dell' => [
                'main' => 'https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/thumbnail.webp',
                'subs' => [
                    'https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/1.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/2.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/3.webp'
                ]
            ],
            'lenovo' => [
                'main' => 'https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/thumbnail.webp',
                'subs' => [
                    'https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/1.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/2.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/3.webp'
                ]
            ],
            'hp' => [
                'main' => 'https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/thumbnail.webp',
                'subs' => [
                    'https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/1.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/2.webp',
                    'https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/3.webp'
                ]
            ]
        ];

        $products = Product::all();

        foreach ($products as $product) {
            $name = strtolower($product->name);
            $type = 'asus'; // default
            
            if (strpos($name, 'macbook') !== false) {
                $type = 'macbook';
            } elseif (strpos($name, 'dell') !== false) {
                $type = 'dell';
            } elseif (strpos($name, 'hp') !== false) {
                $type = 'hp';
            } elseif (strpos($name, 'lenovo') !== false || strpos($name, 'thinkpad') !== false) {
                $type = 'lenovo';
            } elseif (strpos($name, 'asus') !== false || strpos($name, 'rog') !== false) {
                $type = 'asus';
            }

            // Gán ảnh chính
            $product->image = $galleries[$type]['main'];
            $product->save();

            // Gán các ảnh phụ
            foreach ($galleries[$type]['subs'] as $subImgUrl) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url'  => $subImgUrl
                ]);
            }
        }
    }
}
