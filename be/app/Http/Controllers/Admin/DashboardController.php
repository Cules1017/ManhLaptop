<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats()
    {
        $stats = [
            'totalOrders' => Order::count(),
            'totalProducts' => Product::count(),
            'totalUsers' => User::where('role', 'user')->count(),
            'totalRevenue' => Order::where('status', 'completed')->sum('total_price'),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'cancelledOrders' => Order::where('status', 'cancelled')->count(),
        ];

        return response()->json($stats);
    }

    public function getRevenue()
    {
        $revenue = Order::where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($revenue);
    }

    public function getLatestOrders()
    {
        $latestOrders = Order::with('user')
            ->select(
                'orders.id',
                'orders.created_at',
                'users.name as customer_name',
                'users.email as customer_email',
                DB::raw('(SELECT COUNT(*) FROM orders o2 WHERE o2.user_id = orders.user_id) as total_orders'),
                DB::raw('(SELECT SUM(total_price) FROM orders o2 WHERE o2.user_id = orders.user_id) as total_spent')
            )
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->orderBy('orders.created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json($latestOrders);
    }
} 