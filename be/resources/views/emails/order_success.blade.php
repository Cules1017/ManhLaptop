<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Xác nhận đơn hàng</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .header { background: #1e3a8a; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
        .table th { background: #f9fafb; }
        .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .total-row { font-weight: bold; font-size: 16px; color: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Cảm ơn bạn đã đặt hàng tại ManhStore!</h2>
        </div>
        <div class="content">
            <p>Xin chào <strong>{{ $order->user->name }}</strong>,</p>
            <p>Đơn hàng <strong>#{{ $order->id }}</strong> của bạn đã được ghi nhận thành công.</p>
            
            <h3>Chi tiết đơn hàng:</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                    <tr>
                        <td>{{ $item->product->name ?? 'Sản phẩm' }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>{{ number_format($item->price) }} đ</td>
                        <td>{{ number_format($item->price * $item->quantity) }} đ</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            @if($order->discount_amount > 0)
            <p style="text-align: right;">Giảm giá: <strong>-{{ number_format($order->discount_amount) }} đ</strong></p>
            @endif
            
            <p style="text-align: right;" class="total-row">Tổng thanh toán: {{ number_format($order->total_price) }} đ</p>
            
            <p><strong>Phương thức thanh toán:</strong> 
                @if($order->payment_method == 'COD') Thanh toán khi nhận hàng (COD)
                @elseif($order->payment_method == 'vnpay') Thanh toán qua VNPAY
                @elseif($order->payment_method == 'momo') Thanh toán qua Momo
                @else {{ $order->payment_method }}
                @endif
            </p>
            
            <p>Chúng tôi sẽ sớm liên hệ để giao hàng cho bạn.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} ManhStore. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
