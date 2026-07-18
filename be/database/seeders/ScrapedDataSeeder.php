<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Facades\File;

class ScrapedDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $directory = database_path('data/scraped');
        
        if (!File::exists($directory)) {
            $this->command->warn("Directory $directory does not exist.");
            return;
        }

        $files = File::files($directory);
        $totalImported = 0;

        foreach ($files as $file) {
            if ($file->getExtension() !== 'json') {
                continue;
            }

            $jsonContent = file_get_contents($file->getPathname());
            $products = json_decode($jsonContent, true);

            if (!$products) {
                $this->command->warn("Could not parse JSON from " . $file->getFilename());
                continue;
            }

            foreach ($products as $productData) {
                // Map to category
                $categoryId = $this->determineCategoryId($productData['name']);
                
                // Ensure defaults
                $price = isset($productData['price']) ? (int)$productData['price'] : 20000000;
                $rating = isset($productData['rating']) ? (float)$productData['rating'] : rand(40, 50) / 10;
                $discount = isset($productData['discount']) ? (int)$productData['discount'] : rand(0, 15);
                $quantity = isset($productData['quantity']) ? (int)$productData['quantity'] : rand(10, 50);

                Product::create([
                    'name' => $productData['name'],
                    'description' => $productData['description'] ?? 'Laptop chính hãng',
                    'price' => $price,
                    'discount' => $discount,
                    'quantity' => $quantity,
                    'category_id' => $categoryId,
                    'image' => $productData['image'] ?? null,
                    'rating' => $rating,
                ]);
                $totalImported++;
            }
        }

        $this->command->info("Successfully imported $totalImported scraped laptops!");
    }

    private function determineCategoryId(string $name): int
    {
        $name = strtolower($name);

        $gamingKeywords = ['rog', 'tuf', 'nitro', 'predator', 'alienware', 'omen', 'legion', 'titan', 'stealth', 'cyborg'];
        $twoInOneKeywords = ['2-in-1', 'x360', 'flow', 'spin', 'flip'];
        $ultrabookKeywords = ['xps', 'zenbook', 'macbook air', 'swift', 'envy', 'aero'];
        $businessKeywords = ['thinkpad', 'macbook pro', 'latitude', 'elitebook'];
        $studentKeywords = ['inspiron', 'pavilion', 'ideapad', 'aspire', 'vivobook'];

        foreach ($gamingKeywords as $kw) {
            if (strpos($name, $kw) !== false) return 1; // Gaming Laptops
        }

        foreach ($twoInOneKeywords as $kw) {
            if (strpos($name, $kw) !== false) return 5; // 2-in-1 Laptops
        }

        foreach ($ultrabookKeywords as $kw) {
            if (strpos($name, $kw) !== false) return 4; // Ultrabooks
        }

        foreach ($businessKeywords as $kw) {
            if (strpos($name, $kw) !== false) return 2; // Business Laptops
        }

        foreach ($studentKeywords as $kw) {
            if (strpos($name, $kw) !== false) return 3; // Student Laptops
        }

        return 3; // Default to Student Laptops if not matched
    }
}
