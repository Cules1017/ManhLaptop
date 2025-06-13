<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Lọc theo keyword (tìm trong name, description)
        if ($request->has('search') && $request->search) {
            $keyword = $request->search;
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%$keyword%")
                  ->orWhere('description', 'like', "%$keyword%") ;
            });
        }

        // Lọc theo danh mục
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Lọc sản phẩm mới (trong 30 ngày gần đây)
        if ($request->has('new') && $request->new) {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        // Lọc sản phẩm giảm giá
        if ($request->has('discount') && $request->discount) {
            $query->where('discount', '>', 0);
        }

        // Sắp xếp
        if ($request->has('sort_by')) {
            $field = $request->sort_by;
            $order = $request->sort_order ?? 'ASC';
            
            // Validate field để tránh SQL injection
            $allowedFields = ['price', 'created_at', 'rating'];
            if (in_array($field, $allowedFields)) {
                $query->orderBy($field, $order);
            }
        } else {
            // Mặc định sắp xếp theo rating giảm dần
            $query->orderBy('rating', 'DESC');
        }

        // Phân trang
        $perPage = $request->per_page ?? 12;
        $products = $query->paginate($perPage);

        return response()->json([
            'status' => true,
            'data' => $products
        ]);
    }

    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);
        
        return response()->json([
            'status' => true,
            'data' => $product
        ]);
    }

    public function getCategories()
    {
        $categories = Category::all();
        
        return response()->json([
            'status' => true,
            'data' => $categories
        ]);
    }

    // Tạo sản phẩm mới (chỉ admin)
    public function store(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:200',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:0',
            'discount'    => 'nullable|integer|min:0|max:100',
            'quantity'    => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image'       => 'nullable|string|max:255',
            'image_file'  => 'nullable|file|image|max:2048',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }
        $data = $validator->validated();
        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $path = $file->store('uploads/products', 'public');
            $data['image'] = '/storage/' . $path;
        }
        $product = Product::create($data);
        return response()->json(['status' => true, 'data' => $product]);
    }

    // Cập nhật sản phẩm (chỉ admin)
    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }
        $product = Product::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|required|string|max:200',
            'description' => 'sometimes|required|string',
            'price'       => 'sometimes|required|numeric|min:0',
            'discount'    => 'nullable|integer|min:0|max:100',
            'quantity'    => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'image'       => 'nullable|string|max:255',
            'image_file'  => 'nullable|file|image|max:2048',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }
        $data = $validator->validated();
        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $path = $file->store('uploads/products', 'public');
            $data['image'] = '/storage/' . $path;
        }
        $product->update($data);
        return response()->json(['status' => true, 'data' => $product]);
    }

    // Xoá sản phẩm (chỉ admin)
    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Bạn không có quyền!'], 403);
        }
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['status' => true, 'message' => 'Xoá sản phẩm thành công']);
    }

    // Đánh giá sản phẩm (chỉ khi đơn hàng đã giao)
    public function review(Request $request)
    {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }
        $productId = $request->product_id;
        $rating = $request->rating;
        $comment = $request->comment;
        // Kiểm tra user đã mua và đơn hàng đã giao (completed)
        $hasDeliveredOrder = \App\Models\OrderItem::where('product_id', $productId)
            ->whereHas('order', function($q) use ($user) {
                $q->where('user_id', $user->id)->where('status', 'completed');
            })->exists();
        if (!$hasDeliveredOrder) {
            return response()->json(['status' => false, 'message' => 'Bạn chỉ có thể đánh giá sản phẩm đã nhận hàng.'], 403);
        }
        // Lưu review (nếu đã từng review thì cập nhật)
        $review = \App\Models\Review::create(
            [
                'user_id' => $user->id,
                'product_id' => $productId,
                'rating' => $rating,
                'comment' => $comment,
            ]
        );
        // Tính lại rating trung bình cho product
        $avgRating = \App\Models\Review::where('product_id', $productId)->avg('rating');
        $product = \App\Models\Product::find($productId);
        $product->rating = round($avgRating, 2);
        $product->save();
        return response()->json(['status' => true, 'message' => 'Đánh giá thành công', 'data' => $review]);
    }
} 