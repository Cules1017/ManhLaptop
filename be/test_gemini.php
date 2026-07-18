<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use Illuminate\Support\Facades\Http;

$productListStr = "- [ID: 1] [Ảnh: http://127.0.0.1:8000/storage/mock1.jpg] Laptop Gaming Asus ROG (Giá: 25.000.000 VNĐ)\n";
$productListStr .= "- [ID: 2] [Ảnh: http://127.0.0.1:8000/storage/mock2.jpg] Laptop Gaming Acer Nitro 5 (Giá: 20.000.000 VNĐ)\n";

$systemPrompt = "Bạn là trợ lý AI ảo của cửa hàng MANH STORE, chuyên tư vấn laptop. 
Danh sách sản phẩm hiện có:\n{$productListStr}\n
QUY TẮC PHẢN HỒI:
1. LUÔN LUÔN format câu trả lời bằng HTML cơ bản. TUYỆT ĐỐI KHÔNG dùng Markdown (* hoặc **).
2. Khi giới thiệu một sản phẩm, BẮT BUỘC tạo thẻ HTML dạng product-card để hiển thị ảnh đẹp mắt theo đúng cấu trúc sau (thay thế thông tin tương ứng):
   <div class='product-card'>
     <img src='[URL_Ảnh_Sản_Phẩm]' alt='[Tên_Sản_Phẩm]' />
     <div class='product-card-info'>
       <a href='/product/[ID_Sản_Phẩm]' target='_blank'>[Tên_Sản_Phẩm]</a>
       <span class='product-price'>[Giá_Sản_Phẩm]</span>
     </div>
   </div>
3. Trả lời thật ngắn gọn, lịch sự, thân thiện bằng tiếng Việt.
4. NẾU khách hỏi ngoài lề, HOẶC bạn không biết, HOẶC khách đòi gặp nhân viên thật, BẮT BUỘC chỉ in ra ĐÚNG 1 CHUỖI: [TRANSFER_TO_HUMAN]. Không giải thích gì thêm.";

$apiKey = env('GEMINI_API_KEY');
$contents = [
    ['role' => 'user', 'parts' => [['text' => $systemPrompt]]],
    ['role' => 'model', 'parts' => [['text' => 'Đã rõ. Tôi sẽ đóng vai tư vấn viên và tuân thủ các quy tắc.']]],
    ['role' => 'user', 'parts' => [['text' => 'tôi cần máy chơi game']]],
    ['role' => 'model', 'parts' => [['text' => 'Chào bạn, MANH STORE có nhiều mẫu laptop gaming mạnh mẽ để bạn lựa chọn.']]],
    ['role' => 'user', 'parts' => [['text' => 'tôi cần gặp hỗ trợ viên']]]
];

$response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
    'contents' => $contents,
    'generationConfig' => [
        'temperature' => 0.7,
        'maxOutputTokens' => 500,
    ]
]);

echo "API Response:\n";
echo $response->body() . "\n";
