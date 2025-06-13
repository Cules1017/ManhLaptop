<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // Lấy danh sách đơn hàng
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.product'])->orderBy('created_at', 'desc');

        // Tìm kiếm theo mã đơn hàng
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('id', 'like', "%{$search}%");
        }

        // Lọc theo trạng thái
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    // Xem chi tiết đơn hàng
    public function show($id)
    {
        $order = Order::with(['user', 'items.product'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }

    // Cập nhật trạng thái đơn hàng
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,shipping,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        $order = Order::findOrFail($id);
        
        // Kiểm tra xem có thể cập nhật trạng thái không
        if ($order->status === 'cancelled') {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể cập nhật đơn hàng đã hủy'
            ], 400);
        }

        if ($order->status === 'delivered' && $request->status !== 'cancelled') {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể cập nhật đơn hàng đã giao'
            ], 400);
        }

        $order->status = $request->status;
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật trạng thái đơn hàng thành công',
            'data' => $order
        ]);
    }

    // Hủy đơn hàng
    public function cancel($id)
    {
        $order = Order::findOrFail($id);

        // Kiểm tra xem có thể hủy đơn không
        if ($order->status === 'cancelled') {
            return response()->json([
                'status' => 'error',
                'message' => 'Đơn hàng đã bị hủy trước đó'
            ], 400);
        }

        if ($order->status === 'delivered') {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể hủy đơn hàng đã giao'
            ], 400);
        }

        $order->status = 'cancelled';
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Hủy đơn hàng thành công',
            'data' => $order
        ]);
    }
} 