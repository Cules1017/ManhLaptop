<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 14px;
            color: #333;
            line-height: 1.5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #1e3a8a;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 12px;
            color: #666;
        }
        .summary-box {
            width: 100%;
            margin-bottom: 30px;
        }
        .summary-box table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-box th {
            text-align: left;
            padding: 8px;
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
        }
        .summary-box td {
            padding: 8px;
            border: 1px solid #d1d5db;
            font-weight: bold;
        }
        .section-title {
            font-size: 18px;
            margin-bottom: 10px;
            color: #111827;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .data-table th, .data-table td {
            padding: 10px;
            border: 1px solid #d1d5db;
            text-align: center;
        }
        .data-table th {
            background-color: #1e3a8a;
            color: white;
        }
        .text-right {
            text-align: right !important;
        }
        .text-left {
            text-align: left !important;
        }
        .footer {
            margin-top: 50px;
            text-align: right;
            font-size: 14px;
        }
        .signature {
            margin-top: 60px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>BÁO CÁO DOANH THU CỬA HÀNG</h1>
        <p>Ngày lập báo cáo: {{ $date }}</p>
    </div>

    <div class="summary-box">
        <table>
            <tr>
                <th>Tổng đơn hàng</th>
                <td>{{ number_format($stats['totalOrders']) }}</td>
                <th>Đơn hàng chờ xử lý</th>
                <td>{{ number_format($stats['pendingOrders']) }}</td>
            </tr>
            <tr>
                <th>Tổng doanh thu</th>
                <td style="color: #059669;">{{ number_format($stats['totalRevenue']) }} đ</td>
                <th>Đơn hàng hoàn thành</th>
                <td style="color: #059669;">{{ number_format($stats['completedOrders']) }}</td>
            </tr>
        </table>
    </div>

    <h3 class="section-title">Doanh thu 7 ngày gần nhất (Đơn hoàn thành)</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>STT</th>
                <th>Ngày</th>
                <th>Số lượng đơn</th>
                <th class="text-right">Doanh thu (đ)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($revenue as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ date('d/m/Y', strtotime($item->date)) }}</td>
                    <td>{{ $item->orders }}</td>
                    <td class="text-right">{{ number_format($item->revenue) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">Không có dữ liệu</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h3 class="section-title">10 Đơn hàng mới nhất</h3>
    <table class="data-table">
        <thead>
            <tr>
                <th>Mã ĐH</th>
                <th class="text-left">Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th class="text-right">Tổng tiền (đ)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($latestOrders as $order)
                <tr>
                    <td>#{{ $order->id }}</td>
                    <td class="text-left">{{ $order->customer_name }}</td>
                    <td>{{ date('d/m/Y H:i', strtotime($order->created_at)) }}</td>
                    <td>
                        @if($order->status === 'completed') Hoàn thành
                        @elseif($order->status === 'pending') Chờ xử lý
                        @elseif($order->status === 'processing') Đang xử lý
                        @elseif($order->status === 'shipping') Đang giao
                        @elseif($order->status === 'cancelled') Đã huỷ
                        @else {{ $order->status }}
                        @endif
                    </td>
                    <td class="text-right">{{ number_format($order->total_price) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Người lập biểu</p>
        <p>(Ký và ghi rõ họ tên)</p>
        <div class="signature">Quản trị viên</div>
    </div>

</body>
</html>
