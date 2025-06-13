<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    // Lấy danh sách sản phẩm trong giỏ hàng
    public function index(Request $request)
    {
        $user = $request->user();
        $cartItems = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();
        return response()->json([
            'status' => true,
            'data' => $cartItems
        ]);
    }

    // Thêm sản phẩm vào giỏ hàng
    public function add(Request $request)
    {   try {
        $user = $request->user();
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer',
        ]);
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();
        if ($cartItem) {
            $cartItem->quantity += $request->quantity;
            if ($cartItem->quantity <= 0) {
                $cartItem->delete();
                return response()->json([
                    'status' => true,
                    'message' => 'Removed from cart',
                ]);
            } else {
                $cartItem->save();
            }
        } else {
            if ($request->quantity > 0) {
                $cartItem = CartItem::create([
                    'user_id' => $user->id,
                    'product_id' => $request->product_id,
                    'quantity' => $request->quantity,
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid quantity',
                ], 400);
            }
        }
        return response()->json([
            'status' => true,
            'data' => $cartItem
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'status' => false,
            'message' => $th->getMessage(),
            'error' => $th->getTrace()
        ], 500);
    }
        
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public function remove(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();
        if ($cartItem) {
            $cartItem->delete();
        }
        return response()->json([
            'status' => true,
            'message' => 'Removed from cart'
        ]);
    }
} 