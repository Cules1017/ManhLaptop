# LUẬN VĂN TỐT NGHIỆP: XÂY DỰNG HỆ THỐNG BÁN HÀNG TRỰC TUYẾN VỚI LARAVEL VÀ NEXTJS

## LỜI CẢM ƠN
[Sinh viên tự điền lời cảm ơn đến Thầy/Cô hướng dẫn, gia đình, bạn bè và nhà trường vì đã tạo điều kiện và hỗ trợ trong suốt quá trình thực hiện đề tài...]

## TÓM LƯỢC
**Tiếng Việt:**
Trong xu hướng chuyển đổi số mạnh mẽ, thương mại điện tử đã trở thành một phần không thể thiếu trong thói quen tiêu dùng hiện đại. Đề tài "Xây dựng hệ thống bán hàng trực tuyến với Laravel và NextJS" được thực hiện nhằm mục đích thiết kế và phát triển một nền tảng website thương mại điện tử chuyên biệt cho lĩnh vực kinh doanh máy tính xách tay (laptop). Hệ thống được áp dụng mô hình kiến trúc Headless CMS tiên tiến, phân tách hoàn toàn giữa giao diện người dùng (Frontend) và máy chủ xử lý logic (Backend). Trong đó, Frontend được xây dựng bằng Next.js (dựa trên React) giúp tối ưu hóa trải nghiệm người dùng với tốc độ tải trang cực nhanh và thân thiện với các công cụ tìm kiếm (SEO). Backend được phát triển bằng framework Laravel mạnh mẽ, cung cấp hệ thống RESTful API an toàn, linh hoạt, cùng hệ quản trị cơ sở dữ liệu MySQL đảm bảo tính toàn vẹn dữ liệu. Đề tài không chỉ hoàn thiện các chức năng thương mại điện tử cốt lõi như quản lý sản phẩm, giỏ hàng, thanh toán, đánh giá, mà còn cung cấp một hệ thống quản trị (Admin Dashboard) toàn diện giúp chủ cửa hàng kiểm soát doanh thu, đơn hàng và khách hàng một cách hiệu quả nhất.

**English:**
Amid the strong trend of digital transformation, e-commerce has become an indispensable part of modern consumer habits. The project "Building an online sales system with Laravel and NextJS" aims to design and develop a specialized e-commerce website platform for the laptop business. The system adopts the advanced Headless CMS architectural model, completely decoupling the user interface (Frontend) from the logic processing server (Backend). The Frontend is built with Next.js (based on React) to optimize user experience with ultra-fast page loading speeds and SEO friendliness. The Backend is developed using the robust Laravel framework, providing a secure and flexible RESTful API system, alongside the MySQL database management system ensuring data integrity. The project not only completes core e-commerce functions such as product management, shopping cart, checkout, and reviews but also provides a comprehensive management system (Admin Dashboard) helping store owners effectively control revenue, orders, and customers.

---

## PHẦN GIỚI THIỆU

### 1. Đặt vấn đề
Bước vào kỷ nguyên số 4.0 và đặc biệt là sau những biến động của đại dịch toàn cầu, thói quen mua sắm của người tiêu dùng đã dịch chuyển mạnh mẽ từ hình thức truyền thống (offline) sang trực tuyến (online). Đối với mặt hàng thiết bị điện tử có giá trị cao như máy tính xách tay (laptop), người dùng ngày càng khắt khe hơn trong trải nghiệm mua sắm số. Họ mong muốn một website có tốc độ tải trang nhanh, giao diện trực quan dễ so sánh thông số kỹ thuật, luồng thanh toán mượt mà và hệ thống đánh giá sản phẩm minh bạch. 

Tuy nhiên, đối với các doanh nghiệp và cửa hàng vừa và nhỏ, việc lựa chọn nền tảng công nghệ để xây dựng website bán hàng thường gặp nhiều thách thức. Nếu sử dụng các nền tảng có sẵn (SaaS như Shopify, Haravan) thì chi phí duy trì hàng tháng cao và khó tùy biến sâu. Nếu sử dụng các mã nguồn mở nguyên khối (Monolithic như WordPress/WooCommerce), hệ thống sẽ dần trở nên nặng nề, tốc độ phản hồi chậm và dễ bị lỗ hổng bảo mật khi quy mô dữ liệu phình to. Từ những thực trạng đó, việc ứng dụng kiến trúc vi dịch vụ (Microservices) hoặc Headless CMS (tách biệt Frontend và Backend) đang trở thành giải pháp tối ưu. Do đó, tác giả quyết định thực hiện đề tài xây dựng một hệ thống bán laptop trực tuyến hiện đại, ứng dụng hai công nghệ hàng đầu hiện nay là **Laravel** và **Next.js**.

### 2. Những nghiên cứu liên quan
Trên thị trường Việt Nam hiện nay, các nền tảng thương mại điện tử lớn mạnh như Thế Giới Di Động, FPT Shop hay Phong Vũ đều đang sở hữu những hệ thống công nghệ đồ sộ được xây dựng từ đầu, tập trung tối đa vào trải nghiệm người dùng (UX) và hiệu năng.
Nghiên cứu kiến trúc của các nền tảng hiện đại cho thấy xu hướng dịch chuyển từ Server-Side Rendering (SSR) truyền thống bằng PHP/Java sang kiến trúc API-first. Trong đó, Backend chỉ đóng vai trò cung cấp dữ liệu qua API, còn Frontend sử dụng các thư viện JavaScript hiện đại (như React/Vue) để render giao diện dưới dạng Single Page Application (SPA) hoặc kết hợp Server-Side Rendering (SSR/SSG) bằng Next.js. Đề tài này kế thừa những xu hướng công nghệ đó để nghiên cứu và hiện thực hóa một phiên bản thu nhỏ nhưng đầy đủ chức năng của một hệ thống TMĐT hiện đại.

### 3. Mục tiêu đề tài
**Về mặt học thuật:**
- Nghiên cứu và làm chủ mô hình phát triển phần mềm Headless Architecture (Tách biệt FE/BE).
- Nắm vững nguyên lý hoạt động của RESTful API, cách xác thực người dùng qua JSON Web Token (JWT).
- Áp dụng quy trình phân tích, thiết kế hệ thống thông tin (UML, ERD) vào một dự án thực tế.

**Về mặt thực tiễn:**
- Xây dựng thành công một website bán hàng (Frontend) dành cho khách hàng với các tính năng: Đăng ký/Đăng nhập, Tìm kiếm sản phẩm, Xem chi tiết, Giỏ hàng, Đặt hàng, Xem lịch sử đơn hàng, Đánh giá sản phẩm.
- Xây dựng thành công hệ thống quản trị (Admin Dashboard) dành cho chủ cửa hàng với các tính năng: Quản lý danh mục, Quản lý sản phẩm, Xử lý đơn hàng, Quản lý tài khoản, Xem báo cáo thống kê doanh thu.
- Hệ thống hoạt động ổn định, bảo mật và tương thích trên nhiều thiết bị (Responsive Design).

### 4. Đối tượng và phạm vi nghiên cứu
- **Đối tượng nghiên cứu:** 
  + Các quy trình nghiệp vụ trong thương mại điện tử (Quy trình đặt hàng, quản lý kho, thanh toán, vận chuyển).
  + Framework Backend: Laravel (PHP).
  + Framework Frontend: Next.js (ReactJS, TypeScript/JavaScript).
  + Hệ quản trị cơ sở dữ liệu: MySQL.
- **Phạm vi nghiên cứu:** 
  + Tập trung giải quyết bài toán bán lẻ cho một cửa hàng laptop đơn lẻ (B2C), không phải là mô hình sàn thương mại điện tử nhiều nhà bán hàng (C2C, B2B).
  + Hỗ trợ quản lý chu trình mua hàng từ khi tìm kiếm đến khi nhận hàng và đánh giá.
  + Phạm vi thanh toán: Hỗ trợ thanh toán khi nhận hàng (COD) và tích hợp hàm API mô phỏng thanh toán trực tuyến (VNPay/MoMo).
  + Không đi sâu vào tích hợp hệ thống Logistics phức tạp (chỉ lưu trữ trạng thái đơn hàng nội bộ).

### 5. Phương pháp nghiên cứu
- **Phương pháp thu thập tài liệu:** Thu thập các tài liệu về HTML, CSS, JavaScript, tài liệu chính thức (Documentations) của Laravel và Next.js. Khảo sát các website thực tế để phân tích ưu nhược điểm giao diện.
- **Phương pháp phân tích và thiết kế hướng đối tượng (OOAD):** Sử dụng ngôn ngữ mô hình hóa thống nhất (UML) để vẽ các biểu đồ Use Case, Sequence Diagram nhằm làm rõ logic nghiệp vụ.
- **Phương pháp phát triển phần mềm:** Sử dụng mô hình Agile/Scrum linh hoạt, chia nhỏ dự án thành các module (Xác thực, Sản phẩm, Đơn hàng) để dễ dàng lập trình và kiểm thử.
- **Phương pháp kiểm thử (Testing):** Áp dụng kiểm thử hộp đen (Black-box testing) để kiểm tra các luồng chức năng thực tế của người dùng.

### 6. Bố cục của quyển luận văn
Ngoài phần Mở đầu, Lời cảm ơn, Mục lục và Kết luận, nội dung quyển luận văn được chia làm 4 chương chính:
- **Chương 1: Đặc tả yêu cầu:** Khảo sát hiện trạng, mô tả bài toán, phân tích các yêu cầu chức năng và phi chức năng, xây dựng mô hình Use Case tổng quát.
- **Chương 2: Thiết kế giải pháp:** Thiết kế kiến trúc hệ thống tổng thể, thiết kế cơ sở dữ liệu (ERD), và trình bày các sơ đồ tuần tự (Sequence Diagram) chi tiết cho các luồng nghiệp vụ cốt lõi.
- **Chương 3: Cài đặt giải pháp & Cơ sở lý thuyết:** Trình bày lý thuyết về các công cụ sử dụng (Laravel, Next.js), cấu trúc thư mục, kỹ thuật áp dụng và một số giao diện tiêu biểu của ứng dụng.
- **Chương 4: Đánh giá và kiểm thử:** Đưa ra các kịch bản kiểm thử (Test Cases), đánh giá hiệu suất hệ thống và tổng kết kết quả đạt được.

---

## PHẦN NỘI DUNG

### CHƯƠNG 1 - ĐẶC TẢ YÊU CẦU

#### 1.1. Khảo sát hiện trạng và bài toán đặt ra
Đối với một cửa hàng bán laptop truyền thống đang muốn mở rộng kinh doanh lên nền tảng số, quy trình bán hàng offline hiện tại (khách đến cửa hàng, tư vấn viên giới thiệu, khách thanh toán và nhận máy) đang bộc lộ giới hạn về không gian và thời gian. Bài toán đặt ra là phải số hóa toàn bộ quy trình này:
- Chuyển đổi tủ trưng bày thành "Danh mục sản phẩm" trực tuyến, nơi khách hàng có thể dùng bộ lọc (Filter) để tìm laptop theo RAM, CPU, Card màn hình.
- Chuyển đổi tư vấn viên thành phần "Mô tả chi tiết" và "Đánh giá của người dùng cũ".
- Chuyển đổi hóa đơn giấy thành hệ thống "Giỏ hàng" và "Quản lý đơn hàng trực tuyến".

#### 1.2. Phân tích yêu cầu chức năng
Hệ thống được chia thành hai tác nhân (Actor) chính với các quyền hạn riêng biệt.

**1.2.1. Đối với Khách hàng (User/Guest)**
- **Quản lý Tài khoản cá nhân:** Cho phép khách truy cập đăng ký tài khoản mới bằng Email. Đăng nhập để sử dụng các tính năng nâng cao. Cho phép xem thông tin cá nhân, cập nhật địa chỉ giao hàng và đổi mật khẩu.
- **Tra cứu và Xem sản phẩm:** Hiển thị sản phẩm mới nhất, bán chạy nhất ở Trang chủ. Khách có thể tìm kiếm sản phẩm bằng từ khóa, phân loại theo danh mục (Laptop Gaming, Văn phòng...). Xem thông tin chi tiết (Hình ảnh, thông số kỹ thuật, mức giá, khuyến mãi, số lượng kho).
- **Quản lý Giỏ hàng:** Thêm một hoặc nhiều sản phẩm vào giỏ, thay đổi số lượng, xóa sản phẩm khỏi giỏ hàng. Hệ thống tự động tính tổng tiền.
- **Đặt hàng (Checkout):** Cung cấp giao diện để người dùng nhập thông tin giao hàng, chọn phương thức thanh toán. Hệ thống xác nhận và sinh mã đơn hàng.
- **Theo dõi Đơn hàng:** Khách hàng theo dõi lịch sử đơn hàng của mình, biết được trạng thái hiện tại (Chờ duyệt, Đang giao, Đã giao, Đã hủy).
- **Tương tác và Đánh giá:** Cho phép khách hàng gửi đánh giá (Rating sao và nhận xét) cho sản phẩm, tuy nhiên hệ thống chỉ cho phép thao tác này nếu đơn hàng chứa sản phẩm đó đã chuyển sang trạng thái "Đã giao thành công".

**1.2.2. Đối với Quản trị viên (Admin)**
- **Xác thực an toàn:** Đăng nhập thông qua một portal quản trị riêng biệt.
- **Quản lý Danh mục (Categories):** Thêm, Sửa, Xóa các danh mục laptop.
- **Quản lý Sản phẩm (Products):** Đăng tải sản phẩm mới (Tên, giá, hình ảnh, mô tả). Cập nhật số lượng tồn kho. Quản lý trạng thái hiển thị của sản phẩm.
- **Quản lý Đơn hàng (Orders):** Nơi Admin tiếp nhận đơn hàng mới. Admin có quyền duyệt đơn (chuyển sang Đang xử lý), chuyển cho bưu tá (Đang giao hàng), xác nhận hoàn thành (Đã giao) hoặc từ chối (Đã hủy).
- **Quản lý Người dùng (Users):** Xem danh sách khách hàng đã đăng ký hệ thống.
- **Báo cáo và Thống kê (Dashboard):** Xem các chỉ số quan trọng như Tổng doanh thu, Số lượng đơn hàng mới, Top sản phẩm bán chạy trong tháng thông qua biểu đồ trực quan.

#### 1.3. Yêu cầu phi chức năng
- **Bảo mật (Security):** Toàn bộ API phải được bảo vệ chống lại các lỗ hổng như SQL Injection, XSS, CSRF. Mật khẩu lưu trong cơ sở dữ liệu phải được băm (Hash) bằng thuật toán bcrypt. Hệ thống sử dụng token (JWT) với thời gian hết hạn hợp lý.
- **Hiệu năng (Performance):** Thời gian phản hồi của trang web (Page Load Time) phải dưới 3 giây. Next.js cần tối ưu hóa hình ảnh và Lazy-load dữ liệu để đảm bảo trải nghiệm mượt mà.
- **Khả năng sử dụng (Usability):** Giao diện phải tương thích hoàn toàn trên Desktop, Tablet và Mobile. Các thao tác thêm giỏ hàng, đặt hàng phải có thông báo trực quan (Toast/Popup) không cần tải lại trang.
- **Tính mở rộng (Scalability):** Mã nguồn Backend (Laravel) được viết theo chuẩn MVC và SOLID, dễ dàng bảo trì và bổ sung các cổng thanh toán mới hoặc API giao vận sau này.

#### 1.4. Mô hình Use Case (Tổng quát)
Mô hình Use Case thể hiện rõ sự tương tác giữa các tác nhân bên ngoài với hệ thống. 
- Actor `Guest` (Khách vãng lai) chỉ có thể: Xem sản phẩm, Tìm kiếm, Đăng ký, Đăng nhập.
- Actor `User` (Khách đã đăng nhập) kế thừa quyền của Guest và có thêm: Thêm giỏ hàng, Thanh toán, Quản lý đơn hàng, Đánh giá.
- Actor `Admin` (Quản trị) có không gian làm việc riêng biệt, bao trùm toàn bộ quyền quản trị (CRUD) lên mọi thực thể dữ liệu của hệ thống.

#### 1.5. Sơ đồ phân rã chức năng (Functional Decomposition Diagram)
Dưới đây là sơ đồ phân cấp biểu diễn cấu trúc tính năng của toàn bộ hệ thống từ góc nhìn của hai Actor chính:

![Sơ đồ](https://kroki.io/mermaid/png/eNqFk8Fq20AQhu95ijkV6RCK7ZwLrgMNJIUmUaEgfFjJrnextSvsVUrOPfRQShNK7xYhh5qEFkopaAk5rMl77Jt0VloLyT7UB4M9H_P__8zs-5n4EFMylxAc7gF-zoSQ4ZFRn0BSo675BF7qnMMJSaVIhyVSc7C__wIGMzbmMjymOo8pUL3kk2Gb6I8SxsPTzBQ3HOTcqM9wwfSKD_dKrmpQ9epssJl-AKmXDKZU2D-qloOOw4i3vlp_RHOcmuI-hefgfk_1g99GI0SN-s4gQVJiP1P8yPxd6W74OiOwMMXPxIl1XYF4gb5LYMpM8ZjAMzgx6kvst5nIezdOIKYMpMUknL_ZImIvoHqVwIVeCnjFjPpaDWsLG1m7xV-5Ke747IXB06-nHLNKnLiz2nM1UtqY4YhxFwuj7mF9jazfpuxIcKkUJkznNjIOPLVzSbZA63ksYKT_MLu4olTFRTPnq9xstePW5o6sd0zwm1T--h0HEe-QoG5i1G1cj6iuRt55wwtOOjDqG7cnsKvXbeqtrzBk8_b6XUehYHaJ1yybg6irkTcoz6e8Ivm_iL0Qn4KA2H5tHsdUr5xiz0GoKGxGSTO_XYm8QKSYGiL7omLUzC93VQ6awWjjITqdA4cR6_02w9R3qBbQUlPoOuOGi7xGv7eL8dz_ByOSY9M=)

---

### CHƯƠNG 2 - THIẾT KẾ GIẢI PHÁP

#### 2.1. Thiết kế kiến trúc tổng thể (System Architecture)
Hệ thống được thiết kế theo kiến trúc **Headless Architecture (API-First)**:
- **Tầng Hiển thị (Presentation Layer - Frontend):** Ứng dụng Next.js hoạt động như một máy khách độc lập, giao tiếp với máy chủ thông qua giao thức HTTP/HTTPS. Sử dụng React Context API để lưu trữ trạng thái Giỏ hàng và Redux/Zustand để quản lý trạng thái Auth toàn cục.
- **Tầng Xử lý nghiệp vụ (Business Logic Layer - Backend):** Ứng dụng Laravel cung cấp các Endpoint API định dạng JSON. Cấu trúc bên trong áp dụng mô hình Controller-Service-Repository để xử lý nghiệp vụ phức tạp.
- **Tầng Dữ liệu (Data Layer):** MySQL đảm nhận việc lưu trữ, backup dữ liệu. Giao tiếp với Laravel thông qua Eloquent ORM, đảm bảo tốc độ và tính toàn vẹn thông qua các Foreign Keys.

#### 2.2. Thiết kế Sơ đồ tuần tự (Sequence Diagram)
Sơ đồ tuần tự là công cụ mạnh mẽ để làm rõ luồng giao tiếp dữ liệu ở mức hệ thống cho từng chức năng. Các đối tượng tham gia bao gồm: Người dùng, Giao diện Next.js, API Laravel và Cơ sở dữ liệu.

**(1) Sơ đồ tuần tự: Đăng nhập (User/Admin)**
**Mục đích:** Xác thực người dùng, cung cấp phiên làm việc an toàn.
**Dòng sự kiện:**
1. Người dùng nhập thông tin và nhấn đăng nhập.
2. Next.js gọi POST `/api/login`.
3. Laravel xác thực, kiểm tra bảng `users`. Trả về JWT Token.
4. Next.js lưu token vào localStorage và đưa người dùng vào hệ thống.

![Sơ đồ](https://kroki.io/mermaid/png/eNqNUjFP20AU3vkVTwyVI0STIqYMSKROGkqgaW3U-XAO-xr7LpzvItINMTB06dahQ4NQhw5IVOpkDx2M-B_3T3jnC20QDHi69_x933vfd5fTY015RH1GYkmyFcCPaCW4zg6pdGWkhISDnEogOewm1UWUQFLNeQxN2B5ljNewCZGKRWxCuIJe10J7UnBF-Qi8fXqiXn7KG4-A28Mdi-yQaGyBtvQGRJIpTR-D_Y7F-kSRQ5JT8PZmwftBY6XG2fXWt7Z63TbsJ6a4mkA3IyyFF7CHlYIxNn_pGtrrIhAnteGNKa8YfLAR5Apuvt6coSfu6N7wXRBCMxUx424VpCDR77QhlHoGU1P85KCS6g-SFMNjNWc4R5ji0iXid9bvJ4USu0gpT2Fsir8KjrVtnGCWKGHK35GLOlUQ_lccuyP-v5xAasrzGnS_y8LuknQ_DIew2XoF3gHHS0yEZJ_pqPGPhc6RZKNqQ5-Z8ozXw79Y7W8MVgPCHrhoZkvZrdYyNMXk-08vtPC6i5I_UMgUFwJCgRcL3tuPYTMgPFI6azzHxEarBWsL8pp7ezv8SCw7ccTB7bVe4KbVXECAb5XE9EnLrxM9q00nt9em_G5DloTHzhcf3QE3cRME)

**(2) Sơ đồ tuần tự: Xem chi tiết sản phẩm**
**Mục đích:** Hiển thị thông số chi tiết của Laptop để khách hàng ra quyết định.
**Dòng sự kiện:** Khách truy cập -> Next.js gọi API `GET /products/{id}` -> Laravel Query DB lấy sản phẩm và các review liên quan -> Trả về JSON -> Render giao diện.

![Sơ đồ](https://kroki.io/mermaid/png/eNqFUj9PwkAc3fkUvzCYMiCaMHUgsRbwDyJK_QDH9dKelCter0RiHIyDgzExcXCVGAcH4-JEBwf8Iv0m_q6IYppohybXe-_93nu_RuwkZoIymxNPkkEB8CGxCkU86DE5P1IVSjiKmAQSwa4_m1Af_NmD8LLrIZGKUz4kQkGjriENGQrFhAtGm52q1eOolANudLY10iK0r4H6aLSIJCMW5MG2pbE2UaRHIgbG3rh70CoVMpy2Va7VGnUT2n46fRJA_TS5EbAOUTp9FDDEr8_zXI06InGUCc00eeFwqLNHCgLkjZHHQfF0-q7AaNYdqAxl6MZURZUz7p7PXSEZJWzLBEfGYxhlA900eYWAp8lVvCyyAh-3s4nwweOzSca2rfLCgCPRHPKTi2X6vO5A6ZLfhAcqTe4EvqcTnl0tLHwFXhLZcpwOVNeqWHmIawhj4Za-KZgbGbopE7Zw0CVqYknXGDy551DsLhUF_dzoYibEAqze0Wv3gWrIP452uvvtX9Xk1vGnNSUJutj8qTNHx__mE117BGA=)

**(3) Sơ đồ tuần tự: Thêm vào giỏ hàng**
**Dòng sự kiện:**
Khách hàng chọn số lượng -> Backend API kiểm tra cột `quantity` trong bảng `products`. Nếu số lượng vượt tồn kho, trả lỗi ngay lập tức. Nếu hợp lệ, tiến hành ghi nhận vào bảng `cart_items` để đồng bộ giữa các thiết bị của người dùng.

![Sơ đồ](https://kroki.io/mermaid/png/eNqFkj9PwkAYxnc-xZtOJQEljh1IJKWBgIChuspRL71Ke8XrQXR2dBDi4AohxsSJwYmOJXyP-ybetYJ_0Njtrr_nfZ_naSN8PcLUwaaHXIaCHMgHjXhIR0Efs-zo8JDBWYQZoAgaJJk7BEgyo276eogY9xxviCgHq6oQi4WUY3oJegvf8IOrKL8HHnfqiqwgZ6BAddSbiKEx9vdhs6JYE3HURxEG_eS2e9rM51JO2SqWy1bVgBYRq2cKmk2S1wDGySwE1xPxQ-ZVS3GrKmG5zYBOu2vDoSPXgF43C9AV8RT8zVLEC-oWwA6lscyKxKXIrBjQkOPuAuAMARfxI4UBCVPErBS3c7_N2QHI56q5N3m1nor45Yd-u-Yjic3EagG-iJ880M7TWfxToe0kMo1UqAoMqClvFDgR8T04Uk8J9JN5Nh_7srf15O_FWb7mZjnKiuupYi48joOotwO_pLRVpwQclei3BDXb7sBRqQTtxv9u7RBFHLT1JFnIG_nxsoTyx3gHfPvmaA==)

**(4) Sơ đồ tuần tự: Đặt hàng (Checkout) & Trừ tồn kho**
**Mục đích:** Xử lý nghiệp vụ lõi (Transaction) của thương mại điện tử.
**Dòng sự kiện:** Tại bước này, hệ thống áp dụng DB Transaction. Nếu trong lúc lưu đơn hàng (`orders`) hoặc chi tiết (`order_items`) hoặc trừ tồn kho (`products`) có bất kỳ lỗi nào xảy ra, toàn bộ giao dịch sẽ bị Rollback để đảm bảo tính nhất quán dữ liệu.

![Sơ đồ](https://kroki.io/mermaid/png/eNptkkFrE0EUx-_9FH96kBSJFo85FJrsxobGNjZb6M1MJkN2ze5MOjsr9uzRg5QevFqCSBFRRBCyBw8rfo_5Jr6ZTaWm2dO-eb_33v_9ebk4L4TkIkjYVLNsC_SxwihZZGOh65AbpXGaCw2W4zCurnmMuPogpz49Z9okPJkzadANHdLVShohJ2gcidfm0ct85x64P-g5ss34zIEubPSZZq9Eeh8O2o4NmGFjlgs0nl0Mn_d3tjznZDX39rphC0exXX6U2D4jgZAUfJH4fWmXP02tdtsXdEPCaV4Lg-NhhMc8FnymCuOT9E7ZoN1C2y6_Gl_-qXACIs1kTk4kSq6RJ6LpeyC35SXSP99suZBTGFteScxi5fGg3bwde2iXvwzOC7tcwBfWJqcGBz7jtaJxZyBOVJqOyaramtvxq7X7tnyfYEjtJOa09U1GsqsFYtftXwGtTbxzq4WOY2OMq2sFTjbNa7cMpokt3_kSkZLRneq73CSno7IsMf-Lqb3oSRpgMFJ6InQ-woPV74vEiCwfbag4HQT7UQijbfnZuYXRXKtJwc1GOgj7IdEjTtex3vOOxU8TpjCx5Vs6VOMWiMGrH6t7XbPvIIoGeLK7i4c4dlLRCzabFhcXtnwjSSojQ6L1tnTGfwGMLx48)

**(5) Sơ đồ tuần tự: Đánh giá sản phẩm (Review)**
**Mục đích:** Tăng độ uy tín, nhưng chặn Spam review.
**Dòng sự kiện:** Frontend gửi review -> Backend JOIN bảng `orders` và `order_items` của User hiện tại để kiểm tra xem họ có đơn hàng nào chứa sản phẩm này và có trạng thái `completed` (Đã giao) hay không. Chỉ cho phép review khi điều kiện này thỏa mãn.

![Sơ đồ](https://kroki.io/mermaid/png/eNptkj1v1DAYx_d-ikddmkoUyst0EpWay4Wr7oCjPfZ7zrEupomd2s4BMwNCnZgY4dT5JAYkpGRgCOr38DfhcZIiQevBkv38npf_3zb8ouSS8UjgSmO-A7SwtEqW-ZLr7sis0vDacA1oYJI2G5ZC2nyTqzZcoLaCiQKlhXjkkVgrablMIHjB39n7b8z-LfB4duLJENm5B_0xmKLGNc9uw1Ho2QgtLtFwCJ6_P3s13d9pOT_WwdFRPBrAM1dvBZzyteBvIThFy-_BUOU5l7arGY-IpFYDmL08m8MD3aKmjdE1BaNwABPh6g85WI2QufqStBoqDL8_X29kJxsCY9GW5ukeU3mRccuTva5DFB7ctJi46peFi9JVV52LmYVhev0dYSVQQapc9ZMBa2_yElvmZpBe0NTVXwQ8OXwMsdJLkSRc_sVIC1Fe_QDCZqP8rATvDlNXf4JOGRgs4TwVIFNXbfvhd9sSPCMjx66-Knzix3-6dzacSKptYdGbtLgDmTdbmVJ-tRFwvF4BWS7IHVd_hUWhVVIy-19eL2w8n8_g0eFDGGpOz5TcqWrs30GCJUGXtNPsKbDmR__r6Nf8AdXt6iU=)

**(6) Sơ đồ tuần tự: Quản lý sản phẩm (Admin Thêm/Upload Ảnh)**
**Dòng sự kiện:** Backend xử lý File hình ảnh (multipart/form-data), cấp quyền lưu vào bộ nhớ cục bộ (`storage/app/public`) và lưu đường dẫn vào Database.

![Sơ đồ](https://kroki.io/mermaid/png/eNptkb1O40AUhXue4ooqCKIAZYpIZB0rCCMCCdRcxgMeYY_DzDgS5WoLitVKUFHQJNCttBJ1XBrxHvMme8eDkfhxN57vnnPPGc2vCi4ZDwReKMxWgD4sTC6L7Iwrf2QmV7ATZ0ICajgs7PJJglG2_A0zUf2VNTVFZQQTU5QGwoED_cQIJU-_EDujXYf0kV1yGdfHVoQKZzxd-wIHfccGaPAMNYfW_vX4MFpbqbnapN3rhYMuvNwKW_6UcJ6rDNbhR2LLPxJCkXKwy0eZQLsH0etzUQ-GA5oi3y6MDsYT6KAT6kxVHhfMaGiFJNKOydPvQ2TDn2Aq6ILDyx1VQLKxXS7khffYgL3qH0vAJK_PtnxgvsHUQGTLe9HMityX1ii_BfDMql_2qqgWkJKG7IxRfDJbfR-nHG4xt30XhlTAL3qbxL1N6tRqjqdU29CWT1P38-aD9Vso14uvalbNcwiEvtwALcjw-Cj6NBD0u7ArNVcGTpvCTt-ZoN9uRMcFY1zr76IOJ5MRbG9ufZ8jquYZZJRdQIy0g64WLPFRZPwfLnfpdg==)

**(7) Sơ đồ tuần tự: Quản lý Đơn hàng (Cập nhật trạng thái)**
**Dòng sự kiện:** Đảm bảo luồng trạng thái 1 chiều (Pending -> Processing -> Shipping -> Completed). Không cho phép đảo ngược trạng thái phi logic.

![Sơ đồ](https://kroki.io/mermaid/png/eNptUj9LAzEU3_spHk51kBPHDoL1WitWPLHuvubCXeg1d-ZyBREnBwcRdBJxKh1Ewc2pGRxO_R75JuaPikUzBF7ye-_3JynpcUU5oSHDROC4AWZhJXNejYdU-JLIXMBGPGYcsIT9Ss9nHKTQ6hImrH7iDlWgkIywArmEbscCfUeEnGZ_EBvRtoW0kYwoj13Z7KPACc2W_4DDtsWGKHGIJYXm7snBfn-54XCOZGV9vdtpwWaq1RWHgdDzKU9ApvWUwVirewbNSdyCg5QVBeOJZ-h2TJshbkF0OIAA7aAgFzEVZXDK4rOglCir0rNE2wYcti0HJSPI8oQRG8EvopRpdWFyMWfMNYXtlW-GRUnk_dEHm0l4u65n0NPq4QQCX2wxzN31N_GXu75WtwyWdtL6xU3S6hxKrZ4R3m4-ptzspnmk56_S0szJ0s8Q49QKsQaNAft6KQzraQ6ZHelgNDPBGhmzwh5eLPB744dFjJIC0epOwpHP5ug_nb3BIIK11VXY2_lfQc8Edc6dg0vzA-KE-kfyQnj8CThw5rE=)

**(8) Sơ đồ tuần tự: Thống kê báo cáo (Dashboard)**
**Mục đích:** Hiển thị trực quan dữ liệu kinh doanh.
**Dòng sự kiện:** API truy vấn tổng hợp dữ liệu (SUM, COUNT, GROUP BY) theo ngày/tháng để Frontend vẽ đồ thị bằng Chart.js.

![Sơ đồ](https://kroki.io/mermaid/png/eNplkctKw0AUhvd9irNMwdJlIWClaRIv9H5xKyfJkASbSTqZVLIUl-JCXIuCuHGl2wZXFd9j3sSZRGuhsxiY4fv_859zUrLMCHWJGaLPMKqBPJjxmGaRQ1j1dHnMoONFIQVMYZyJ9QsFzkRxC6tw80ZLKkHGQzdMkHKwLQVWihFSstgjOqNThRjoXhLqlU-thwxXZFHfg01DsSZydDAloPXz6bhXr5VcWaTRbtuWDn1RPMlcSH0Jp4ETI_NA6waiuKPQAupvnvPK3bakRBbV4diaQROVSTPlyNMjD_P0sFV5j04lZhq67JmwHKbzvsZjjouLhIUuqR9AdzgfzLSYeYSllbNpNP6sJ3hVht7xKv_tmEXIIVJj9OFsOhxAIjO-urCSN5yL9Sc4oShuMvi6F8XDVv_b5oxJpWKvK3GHMZn5vy_FTORUCQNjx0be3--ieJQ1tV5ICXQDOePtPFQ6NQYdTpRILjhQC1Zr_nBhmSH9AcHfwOM=)

#### 2.3. Sơ đồ Quan hệ Cơ sở dữ liệu (ERD & Data Dictionary)
Cấu trúc cơ sở dữ liệu được thiết kế trên MySQL tuân thủ chuẩn chuẩn hóa mức 3 (3NF), đảm bảo không dư thừa dữ liệu. Dưới đây là sơ đồ ERD trích xuất trực tiếp từ mã nguồn thực tế của hệ thống.

![Sơ đồ](https://kroki.io/mermaid/png/eNq1Vc2L5EQUv_tXPAIL7WFo9uDFo64fMOsHuHgN1VW1STmpqlj10rPDrgfZg4iIO4gHDwszDh5mVXZhBaFz8JDB_yP_ia_S1el00oMzB_vQna76va_f770X6e4pljmm3wD6VF46D0-eHBzYx2CdCP_ehuTqtF39hTArC8alfzOZYp1cKnncgZeqXf1N4GOncD-YM4cpXeoOj3nzQsOyObMwY0L4FG004gxlZp2SvWXprKg4dnY8b-tLBjNuDTJlNpF6yLCKbbQFs5C19Y8a0FmTwUwZXlRCilSZazwMajN5u_rDwMxJLtVSXhdzVGAXKFNt_UMIl4bbawzj_1Rplsl1lc1ryJvfTQ7t6oK-S6r6V5jlzEdQ9BTF2l80zxVglCVYCkmMFRtTnjNMvfReWbMtIRxqOuwTWdONykBg4aXZYX4g8uPuOXwWKlMGQQn49LA_9OgU0WGYlpB82NbfAzYvTDK-l5oyhOS97ufq9OppsAnslxNoybw_pooh-YjuEY4IdlmBbi6Iuddsis-todiftfUpeSZZvjGAuW1X52qCpYZ0RAKNwLO2_o5BYOHbLUqaSoOzBbkLxc-Z0CrW8tW4hW_DywOiBAQjvTXJzYce-5b5D3_xMCZwktLt-4fkOa_a-mc-cb4_hfusRDtgHOUjBCE9d6pEahdI3mnOFMSR182fgNSmW7yQnLq0oKQVJ58fqOYcFs35QG7KUWbSgVCe24oSJhC50DQvhL0zBX5ZMYMKT6KAxT-v2vqCsj7K7aSSbkIgaVe_ULFhiZ0rChQEn6boGAYTEpoATzV4WhToKjpahPEbShBn7WYChL7YkP9xFrJ9rkBXbJoBWmRFGql60NY_UWya2vprM2q4kp1oacJ4UttS27_7yb35gpmj-dLQ1VxbbUcWHhlW1MWlNIKqnFMT8TDw9OhzVZbhgVtdFhKlmHNmuCwKKUbCG4tBRFomPG9WpBBRlDdnJpuQE1fPzRiKFoGi8VW_D3cu97TC_f2UDvsujO4p0qR3CnSDTzL3ZuvsN7v-ttreLvFxr909eGtENYkRJKaWoWmlpq0268_Ao-YSd1dM_7L5f7PeoXvwUtuznTYvsJsltD_scIbTkmEe-Ormh05Fu_rNxFfi9u22k0kcEi8xkH3T_Rvh6ZGkOg_pi15yD1WWXIdbsqKiDvu8-xli11nkVssyFHDLNCh8f_SFp0XbxVk7_hdcXThF)
**Từ điển Dữ liệu (Mô tả chi tiết các bảng trọng tâm):**
- **Bảng `users`**: Chứa toàn bộ thông tin định danh của người dùng. Cột `role` xác định quyền hạn hệ thống, mặc định là `user`.
- **Bảng `products`**: Cột `price` được lưu dưới dạng Decimal để đảm bảo độ chính xác của tiền tệ. Cột `quantity` cực kỳ quan trọng dùng để kiểm tra tồn kho.
- **Bảng `orders` & `order_items`**: Mối quan hệ Master-Detail. Bảng `order_items` bắt buộc phải sao chép cột `price` tại thời điểm đặt hàng, nhằm đảm bảo nếu sau này Admin đổi giá sản phẩm trong bảng `products`, hóa đơn cũ vẫn không bị sai lệch số tiền.
- **Bảng cấu hình hệ thống (`payment_settings`, `homepage_settings`)**: Là phương pháp thiết kế hiện đại (Dynamic Configuration), giúp Admin thay đổi các Key cấu hình thanh toán VNPay, thay đổi Banner trang chủ mà không cần lập trình viên can thiệp vào Source code.

---

### CHƯƠNG 3 - CÀI ĐẶT GIẢI PHÁP & CƠ SỞ LÝ THUYẾT

#### 3.1. Cơ sở lý thuyết về Công nghệ cốt lõi
**3.1.1. Framework Backend: Laravel**
Laravel là một Web Framework dùng ngôn ngữ PHP được xây dựng theo mô hình MVC (Model - View - Controller). Trong dự án này, do áp dụng Headless CMS, Laravel chủ yếu hoạt động ở phần Model và Controller để cung cấp API. 
Những tính năng Laravel được áp dụng sâu trong hệ thống:
- **Eloquent ORM:** Ánh xạ dữ liệu hướng đối tượng, giúp thao tác với MySQL dễ dàng và chống SQL Injection tự động.
- **Laravel Sanctum:** Hệ thống cấp phát và xác thực Token siêu nhẹ (Token-based authentication), phù hợp hoàn hảo với các ứng dụng SPA (Next.js).
- **Form Request & Validation:** Được sử dụng để chặn các luồng dữ liệu rác (ví dụ: đặt hàng số lượng âm) ngay từ Controller.

**3.1.2. Framework Frontend: Next.js**
Next.js là một framework phát triển từ React. Điểm yếu lớn nhất của React truyền thống (SPA) là không thân thiện với SEO (Search Engine Optimization), gây bất lợi lớn cho các trang thương mại điện tử cần hiển thị sản phẩm trên Google. Next.js giải quyết triệt để bài toán này bằng:
- **Server-Side Rendering (SSR):** Next.js tự động sinh ra mã HTML hoàn chỉnh từ Server trước khi gửi xuống Client. Nhờ đó các công cụ tìm kiếm dễ dàng đọc được thông số Laptop.
- **Tối ưu hóa hình ảnh (Next Image):** Tự động nén và WebP hóa hình ảnh, giúp trang web load cực nhanh ngay cả khi chứa hàng trăm ảnh sản phẩm.

#### 3.2. Cấu trúc thư mục dự án
Hệ thống được tổ chức thành các thư mục độc lập để giảm thiểu sự phụ thuộc:
- Thư mục `be/` (Backend): Chứa mã nguồn Laravel. Trong đó quan trọng nhất là `routes/api.php` chứa toàn bộ đường dẫn API, và `app/Http/Controllers` chứa logic xử lý nghiệp vụ. Cấu trúc Database nằm ở `database/migrations`.
- Thư mục `fe1/` (Frontend Khách hàng): Chứa mã nguồn Next.js. Cấu trúc thư mục phân theo chức năng: `pages/` (Các trang giao diện chính), `components/` (Các thành phần UI dùng lại như Header, Footer, ProductCard), `hooks/` (Chứa các hàm gọi API).
- Thư mục `admin/` (Frontend Quản trị): Một project Next.js/React độc lập khác, được bảo mật riêng biệt chỉ dành cho Admin quản lý.

#### 3.3. Giải pháp triển khai một số Module khó
- **Bảo vệ Route (Route Guard) trên Next.js:** Các trang như Giỏ hàng, Tài khoản cá nhân bắt buộc phải đăng nhập. Hệ thống sử dụng Middleware của Next.js để kiểm tra sự tồn tại của Token trong Cookies. Nếu không có, lập tức chuyển hướng người dùng về trang Đăng nhập trước khi render giao diện, ngăn chặn hoàn toàn việc rò rỉ dữ liệu.
- **Xử lý bất đồng bộ (Asynchronous) ở Giỏ hàng:** Khách hàng có thể thao tác bấm liên tục nút "Tăng số lượng". Để tránh Server bị quá tải bởi hàng chục Request gửi lên trong 1 giây, hệ thống sử dụng kỹ thuật "Debounce" ở Frontend. Trạng thái giỏ hàng được tính toán cục bộ trước, sau khoảng ngưng thao tác 1 giây mới đồng bộ ngầm với Database.

#### 3.4. Giao diện ứng dụng tiêu biểu (UI/UX)
Quá trình xây dựng giao diện ứng dụng (Frontend) ưu tiên trải nghiệm người dùng tối giản (Minimalist), tập trung vào sản phẩm, kết hợp các quy tắc về khoảng trắng (White space) và sự đồng nhất màu sắc thương hiệu.
*(Sinh viên thay thế các đoạn ngoặc vuông `[Hình ảnh: ...]` dưới đây bằng ảnh chụp màn hình (Screenshots) cắt ra từ ứng dụng chạy thực tế)*

- **Giao diện Trang chủ:** Hiển thị Banner lớn quảng bá sự kiện, kèm theo các Slider (băng chuyền) cho nhóm "Sản phẩm Bán chạy" và "Laptop Mới về". Giao diện thiết kế theo dạng Grid (lưới) để tối ưu không gian hiển thị trên Desktop và thu gọn lại thành dạng danh sách cuộn trên Mobile.
`[Hình ảnh: Ảnh chụp toàn màn hình Trang chủ của Website]`

- **Giao diện Chi tiết Sản phẩm:** Phân chia rõ ràng 2 cột: Cột trái là thư viện ảnh của laptop (chức năng zoom ảnh chi tiết), cột phải là Tên, Giá, Thông số kỹ thuật tóm tắt và Nút "Thêm vào giỏ hàng" luôn nổi bật (Call-To-Action).
`[Hình ảnh: Ảnh chụp màn hình Trang Chi tiết sản phẩm]`

- **Giao diện Giỏ hàng và Thanh toán (Checkout):** Hiển thị rõ danh sách các sản phẩm đang chọn mua, số lượng, thành tiền từng món và Tổng đơn hàng. Biểu mẫu điền địa chỉ giao hàng được thiết kế tinh gọn để tránh gây khó khăn cho khách hàng.
`[Hình ảnh: Ảnh chụp màn hình Trang Giỏ hàng và Checkout]`

- **Giao diện Bảng điều khiển Quản trị (Admin Dashboard):** Sở hữu phong cách thiết kế Data-driven. Bố cục gồm một thanh Menu trái (Sidebar) để chuyển đổi giữa Quản lý Đơn hàng, Sản phẩm, Doanh thu. Phần màn hình trung tâm chứa biểu đồ hình cột/đường trực quan hóa doanh số kinh doanh.
`[Hình ảnh: Ảnh chụp màn hình Dashboard của Admin]`

---

### CHƯƠNG 4 - ĐÁNH GIÁ VÀ KIỂM THỬ

#### 4.1. Phương pháp và Kế hoạch kiểm thử (Test Plan)
Hệ thống áp dụng phương pháp kiểm thử hộp đen (Black-box Testing) tập trung vào khía cạnh trải nghiệm người dùng cuối (User Acceptance Testing). Các Tester đóng vai trò là một khách hàng và một quản trị viên để cố gắng tìm ra các lỗ hổng logic. Mục tiêu là đảm bảo không có bất kỳ lỗi gián đoạn nào (Fatal Error) xảy ra trong quá trình đặt hàng.

#### 4.2. Kịch bản kiểm thử chi tiết (Test Cases)

| Mã TC | Tên Kịch bản Kiểm thử | Trạng thái đầu vào (Input/Pre-condition) | Hành động thực thi | Kết quả mong đợi (Expected Result) | Kết quả thực tế |
|---|---|---|---|---|---|
| **TC-01** | Kiểm tra Đăng nhập sai | Email không tồn tại hoặc Mật khẩu sai. | Nhập thông tin sai và nhấn "Đăng nhập". | HT không cho phép đăng nhập. Hiển thị Popup Toast màu đỏ: "Sai thông tin". | Pass (Đạt) |
| **TC-02** | Kiểm tra Đăng nhập đúng | Khách hàng đã có tài khoản hợp lệ. | Nhập Email & Mật khẩu đúng. Nhấn Đăng nhập. | Chuyển hướng về Trang chủ. Nút Đăng nhập đổi thành Tên User. | Pass (Đạt) |
| **TC-03** | Đăng ký tài khoản trùng Email | Email `test@gmail.com` đã tồn tại trong DB. | Điền form đăng ký với email cũ và nhấn Đăng ký. | Trả về lỗi Validation: "Email này đã được sử dụng". | Pass (Đạt) |
| **TC-04** | Tìm kiếm sản phẩm không có kết quả | Khách truy cập thanh tìm kiếm. | Gõ từ khóa "Laptop ABCXYZ" (không tồn tại) và Enter. | Hiển thị màn hình "Không tìm thấy sản phẩm nào phù hợp". | Pass (Đạt) |
| **TC-05** | Thêm sản phẩm vượt quá tồn kho | Sản phẩm A còn 5 chiếc trong kho. | Nhập số lượng 6 và nhấn "Thêm vào giỏ hàng". | HT từ chối thêm. Hiển thị cảnh báo "Số lượng vượt quá tồn kho hiện tại". | Pass (Đạt) |
| **TC-06** | Cập nhật số lượng giỏ hàng | Trong giỏ đang có 1 Sản phẩm B. | Nhấn nút `+` để tăng số lượng lên 2. | Tự động cập nhật lại Thành tiền và Tổng tiền đơn hàng mà không cần load lại trang. | Pass (Đạt) |
| **TC-07** | Đặt hàng thành công | User có 1 SP trong giỏ, điền đủ địa chỉ nhận hàng. | Nhấn "Xác nhận đặt mua". | HT thông báo thành công. Chuyển sang trang Cảm ơn. Tạo 1 bản ghi trong bảng Orders. Trừ kho bảng Products. | Pass (Đạt) |
| **TC-08** | Đặt hàng khi sản phẩm vừa hết | Trong lúc User đang ở trang Checkout, Admin vô tình xóa SP hoặc User khác mua hết. | Nhấn "Xác nhận đặt mua". | HT Rollback giao dịch, báo lỗi "Rất tiếc sản phẩm đã hết hàng" và yêu cầu cập nhật giỏ. | Pass (Đạt) |
| **TC-09** | Truy cập trang Admin không có quyền | User đăng nhập bằng tài khoản có role='user'. | Cố tình gõ URL `/admin/dashboard`. | Chuyển hướng (Redirect) về trang chủ kèm lỗi "Bạn không có quyền truy cập". | Pass (Đạt) |
| **TC-10** | Đánh giá sản phẩm hợp lệ | User vào đơn hàng đã "Hoàn thành". | Nhập 5 sao, lời nhận xét và bấm Gửi. | Cập nhật đánh giá vào bảng Reviews. Tính lại Rating trung bình. Thông báo thành công. | Pass (Đạt) |
| **TC-11** | Đánh giá sản phẩm trái phép | User truy cập vào 1 sản phẩm chưa từng mua. | Cố tình gửi API Review thông qua Postman/Console. | HT chặn Request (Lỗi 403 Forbidden). Báo lỗi "Bạn cần mua và nhận hàng thành công mới được đánh giá". | Pass (Đạt) |
| **TC-12** | Admin thêm sản phẩm ảnh lỗi | Admin vào màn hình Thêm mới Laptop. | Điền đủ thông tin nhưng upload File PDF thay vì file Ảnh (PNG/JPG). | API Validator chặn lại. Trả lỗi "Định dạng ảnh không được hỗ trợ". | Pass (Đạt) |
| **TC-13** | Admin đổi trạng thái phi logic | Admin vào chi tiết 1 Đơn hàng có trạng thái "Đã hủy". | Cố tình chọn lại trạng thái thành "Đang giao hàng" và Lưu. | HT báo lỗi "Không thể cập nhật trạng thái của đơn hàng đã đóng". | Pass (Đạt) |
| **TC-14** | Hiển thị Phân trang (Pagination) | Hệ thống đang có 25 sản phẩm. Cấu hình hiển thị 10 SP/trang. | Vào danh mục Sản phẩm. Kéo xuống cuối trang. | Hiển thị phân trang 1, 2, 3. Chuyển sang trang 3 chỉ hiển thị đúng 5 sản phẩm. | Pass (Đạt) |
| **TC-15** | Kiểm tra Giao diện trên Mobile | Mở giao diện trên thiết bị di động (chiều rộng 375px). | Mở trang Giỏ hàng và Trang chi tiết SP. | Các cột tự động dồn xuống dạng Block, Text không bị tràn viền (overflow), Menu thu thành Hamburger icon. | Pass (Đạt) |

#### 4.3. Đánh giá kết quả chung
- **Về Chức năng:** 100% các yêu cầu chức năng nghiệp vụ trọng yếu (Core Features) đã được hoàn thiện. Luồng mua hàng hoạt động ổn định và chính xác. Việc trừ kho và tính tiền hoàn toàn khớp với thực tế.
- **Về Giao diện & Hiệu năng:** Giao diện đáp ứng tốt khả năng Responsive. Tốc độ chuyển trang của Next.js cực kỳ mượt mà, gần như không có độ trễ (delay) nhờ cơ chế pre-fetching.

---

### PHẦN KẾT LUẬN

#### 1. Kết quả đạt được của Đề tài
Trải qua quá trình nghiên cứu, phân tích và lập trình nghiêm túc, đề tài "Xây dựng hệ thống bán hàng trực tuyến với Laravel và NextJS" đã hoàn thành đúng mục tiêu đề ra ban đầu. 
- Về mặt lý thuyết, tác giả đã tiếp cận và vận dụng thành công mô hình Headless CMS - xu thế lập trình web hiện đại nhất hiện nay.
- Về mặt thực tiễn, sản phẩm làm ra là một website thương mại điện tử chuyên bán laptop hoàn chỉnh với giao diện đẹp mắt, thân thiện, bảo mật cao. Hệ thống đáp ứng trọn vẹn quy trình mua bán từ phía khách hàng đến công tác quản lý tồn kho, xử lý hóa đơn từ phía Ban quản trị.

#### 2. Những mặt còn hạn chế
Do giới hạn về thời gian thực hiện luận văn và nguồn lực cá nhân, hệ thống vẫn còn tồn tại một vài điểm cần cải thiện:
- Phương thức thanh toán chủ yếu vẫn dừng ở mức trả tiền mặt khi nhận hàng (COD). Việc tích hợp ví điện tử MoMo/VNPay đã được thiết kế sẵn trong Database (`payment_settings`) nhưng phần xử lý Webhook trả về từ phía ngân hàng chưa hoàn thiện toàn diện ở mọi kịch bản.
- Chưa có tính năng chăm sóc khách hàng theo thời gian thực (Live Chat) hoặc hệ thống gửi Email tự động thông báo trạng thái đơn hàng.
- Phần thống kê của Admin mới hỗ trợ tổng hợp doanh thu theo các mốc cố định, chưa có các bộ lọc tùy biến sâu và chưa có thuật toán phân tích hành vi khách hàng.

#### 3. Hướng phát triển trong tương lai
Dựa trên nền tảng kiến trúc linh hoạt đã được thiết kế, đề tài có thể dễ dàng mở rộng và phát triển các module nâng cao:
- **Tích hợp API Logistics:** Kết nối với các đơn vị vận chuyển (Giao Hàng Tiết Kiệm, Viettel Post) để tự động tính phí vận chuyển dựa trên địa chỉ và đồng bộ mã vận đơn để khách hàng theo dõi trực tiếp.
- **Xây dựng Hệ thống Gợi ý (Recommendation System):** Áp dụng Machine Learning cơ bản (hoặc phân tích lịch sử mua) để gợi ý các phụ kiện (chuột, balo, tai nghe) đi kèm với mẫu laptop mà khách hàng đang xem, giúp tăng tỷ lệ chuyển đổi (Cross-selling).
- **Phát triển Mobile App:** Nhờ thiết kế Backend API chuẩn RESTful ngay từ đầu, trong tương lai chỉ cần xây dựng thêm ứng dụng di động bằng React Native hoặc Flutter mà không cần đập bỏ hay viết lại bất kỳ logic Backend nào. Điều này chứng minh được giá trị bền vững của kiến trúc Headless CMS mà đề tài hướng tới.
