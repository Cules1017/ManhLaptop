<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Product;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array'
        ]);

        $userMessage = $request->input('message');
        $history = $request->input('history', []);

        // Fetch basic product info to provide context
        $products = Product::select('id', 'name', 'price', 'discount', 'image')->take(50)->get();
        $productListStr = "";
        foreach ($products as $p) {
            $finalPrice = $p->price;
            if ($p->discount > 0) {
                $finalPrice = $p->price * (1 - $p->discount / 100);
            }
            $imgUrl = $p->image ? "http://127.0.0.1:8000{$p->image}" : "";
            $productListStr .= "- [ID: {$p->id}] [Ảnh: {$imgUrl}] {$p->name} (Giá: " . number_format($finalPrice, 0, ',', '.') . " VNĐ)\n";
        }

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
3. Trả lời thật ngắn gọn, lịch sự, thân thiện bằng tiếng Việt. KHÔNG ĐƯỢC dùng Markdown block (ví dụ ```html). CHỈ XUẤT RA HTML THUẦN TÚY.
4. NẾU khách hỏi ngoài lề, HOẶC bạn không biết, HOẶC khách đòi gặp nhân viên thật, BẮT BUỘC chỉ in ra ĐÚNG 1 CHUỖI: [TRANSFER_TO_HUMAN]. Không giải thích gì thêm.";

        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['status' => false, 'message' => 'API Key chưa được cấu hình.']);
        }

        // Prepare contents array for Gemini
        $contents = [];
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $systemPrompt]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => 'Đã rõ. Tôi sẽ đóng vai tư vấn viên và tuân thủ các quy tắc.']]
        ];

        // Add history (max 10 recent messages to save tokens)
        $history = array_slice($history, -10);
        foreach ($history as $msg) {
            $role = isset($msg['role']) && $msg['role'] === 'user' ? 'user' : 'model';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg['content'] ?? '']]
            ];
        }

        // Add current message
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]]
        ];

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 2000,
                ]
            ]);
            if ($response->successful()) {
                $data = $response->json();
                \Illuminate\Support\Facades\Log::info('Gemini API Response: ' . json_encode($data));
                $reply = '';
                if (!empty($data['candidates']) && !empty($data['candidates'][0]['content']['parts'])) {
                    $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                } else {
                    return response()->json([
                        'status' => false,
                        'message' => 'Lỗi kết nối AI: Không nhận được phản hồi (Có thể do bộ lọc an toàn).'
                    ]);
                }
                $reply = trim($reply);

                if (strpos($reply, '[TRANSFER_TO_HUMAN]') !== false) {
                    return response()->json([
                        'status' => true,
                        'transfer' => true,
                        'message' => 'Tôi đang kết nối bạn với nhân viên tư vấn. Vui lòng để lại Số điện thoại hoặc gọi Hotline: 1900 xxxx để được hỗ trợ nhanh nhất.'
                    ]);
                }

                return response()->json([
                    'status' => true,
                    'transfer' => false,
                    'message' => $reply
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Lỗi kết nối AI: ' . $response->body()
                ]);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()
            ]);
        }
    }
}
