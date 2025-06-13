<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // API đặt hàng (checkout)
    public function checkout(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:COD,bank_transfer',
            'note' => 'nullable|string',
        ]);
        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id' => $user->id,
                'total_price' => $request->total_price,
                'payment_method' => $request->payment_method,
                'status' => 'pending',
                'note' => $request->note,
            ]);
            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }
            // Xóa cart của user sau khi đặt hàng
            CartItem::where('user_id', $user->id)->delete();
            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Đặt hàng thành công',
                'data' => $order
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Đặt hàng thất bại',
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    // API lấy danh sách đơn hàng của user hiện tại
    public function list(Request $request)
    {
        $user = $request->user();
        $orders = Order::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->with(['items.product'])
            ->get();
        // Bổ sung review cho từng item
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $review = \App\Models\Review::where('user_id', $user->id)
                    ->where('product_id', $item->product_id)
                    ->first();
                $item->review = $review;
            }
        }
        return response()->json([
            'status' => true,
            'data' => $orders
        ]);
    }
} 