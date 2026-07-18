<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class UpdateProductImagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $updatedCount = 0;

        foreach ($products as $product) {
            // Provide a perfectly distinct, beautiful image for each laptop using loremflickr
            // The lock parameter ensures the image is stable per product ID
            $product->image = "https://loremflickr.com/800/600/laptop,computer?lock=" . $product->id;
            $product->save();
            $updatedCount++;
        }

        $this->command->info("Successfully updated $updatedCount product images with distinct URLs!");
    }
}
