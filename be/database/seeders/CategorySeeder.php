<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Gaming Laptops',
            ],
            [
                'name' => 'Business Laptops',
            ],
            [
                'name' => 'Student Laptops',
            ],
            [
                'name' => 'Ultrabooks',
            ],
            [
                'name' => '2-in-1 Laptops',
            ],
            // 3 danh mục mới thêm cho file generate_laptops_more.py
            [
                'name' => 'MacBooks',
            ],
            [
                'name' => 'Workstation Laptops',
            ],
            [
                'name' => 'Budget Laptops',
            ]
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(
                ['name' => $category['name']],
                [
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }
}
