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
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Business Laptops',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Student Laptops',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Ultrabooks',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => '2-in-1 Laptops',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }
    }
}
