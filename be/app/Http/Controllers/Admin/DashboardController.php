<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

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

    /**
     * Dữ liệu gom cho biểu đồ: trạng thái đơn, PTTT, khối lượng đơn 30 ngày.
     */
    public function getAnalytics()
    {
        $statusLabels = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
        $statusCounts = Order::query()
            ->select('status', DB::raw('COUNT(*) as c'))
            ->groupBy('status')
            ->pluck('c', 'status')
            ->all();

        $ordersByStatus = [];
        foreach ($statusLabels as $s) {
            $ordersByStatus[$s] = (int) ($statusCounts[$s] ?? 0);
        }

        $paymentCounts = Order::query()
            ->select('payment_method', DB::raw('COUNT(*) as c'))
            ->groupBy('payment_method')
            ->pluck('c', 'payment_method')
            ->all();

        $start = Carbon::now()->subDays(29)->startOfDay();
        $volumeRows = Order::query()
            ->where('created_at', '>=', $start)
            ->select(
                DB::raw('DATE(created_at) as d'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('d')
            ->orderBy('d')
            ->get()
            ->keyBy('d');

        $orderVolume = [];
        for ($i = 29; $i >= 0; $i--) {
            $d = Carbon::now()->subDays($i)->format('Y-m-d');
            $row = $volumeRows->get($d);
            $orderVolume[] = [
                'date' => $d,
                'orders' => $row ? (int) $row->orders : 0,
            ];
        }

        return response()->json([
            'ordersByStatus' => $ordersByStatus,
            'ordersByPayment' => collect($paymentCounts)
                ->map(fn ($c) => (int) $c)
                ->all(),
            'orderVolume' => $orderVolume,
        ]);
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

    public function exportPdf()
    {
        // Lấy thống kê cơ bản
        $stats = [
            'totalOrders' => Order::count(),
            'totalRevenue' => Order::where('status', 'completed')->sum('total_price'),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
        ];

        // Doanh thu 7 ngày qua
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

        // 5 đơn hàng mới nhất
        $latestOrders = Order::with('user')
            ->select(
                'orders.id',
                'orders.created_at',
                'orders.total_price',
                'orders.status',
                'users.name as customer_name'
            )
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->orderBy('orders.created_at', 'desc')
            ->limit(10)
            ->get();

        $data = [
            'title' => 'Báo cáo Doanh thu',
            'date' => Carbon::now()->format('d/m/Y H:i'),
            'stats' => $stats,
            'revenue' => $revenue,
            'latestOrders' => $latestOrders,
        ];

        $pdf = Pdf::loadView('pdf.revenue', $data);
        return $pdf->download('bao-cao-doanh-thu.pdf');
    }
} 