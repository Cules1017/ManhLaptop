<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'ASUS ROG Strix G15',
                'description' => 'Gaming laptop with RTX 3060, AMD Ryzen 7, 16GB RAM, 512GB SSD',
                'price' => 1299.99,
                'discount' => 10,
                'quantity' => 15,
                'category_id' => 1,
                'image' => 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Dell XPS 13',
                'description' => 'Ultrabook with Intel Core i7, 16GB RAM, 512GB SSD, InfinityEdge Display',
                'price' => 1199.99,
                'discount' => 5,
                'quantity' => 20,
                'category_id' => 4,
                'image' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Lenovo ThinkPad X1 Carbon',
                'description' => 'Business laptop with Intel Core i7, 16GB RAM, 1TB SSD, Military-grade durability',
                'price' => 1499.99,
                'discount' => null,
                'quantity' => 10,
                'category_id' => 2,
                'image' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'HP Pavilion 15',
                'description' => 'Student laptop with AMD Ryzen 5, 8GB RAM, 256GB SSD, Full HD Display',
                'price' => 699.99,
                'discount' => 15,
                'quantity' => 25,
                'category_id' => 3,
                'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Microsoft Surface Pro 8',
                'description' => '2-in-1 laptop with Intel Core i5, 8GB RAM, 256GB SSD, 13" PixelSense Display',
                'price' => 999.99,
                'discount' => 8,
                'quantity' => 18,
                'category_id' => 5,
                'image' => 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&auto=format&fit=crop',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'MSI GE76 Raider',
                'description' => 'High-end gaming laptop with RTX 3080, Intel Core i9, 32GB RAM, 1TB SSD',
                'price' => 2499.99,
                'discount' => null,
                'quantity' => 8,
                'category_id' => 1,
                'image' => 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'MacBook Pro 14"',
                'description' => 'Professional laptop with M1 Pro chip, 16GB RAM, 512GB SSD, Liquid Retina XDR Display',
                'price' => 1999.99,
                'discount' => null,
                'quantity' => 12,
                'category_id' => 2,
                'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($products as $product) {
            \App\Models\Product::create($product);
        }
    }
}
