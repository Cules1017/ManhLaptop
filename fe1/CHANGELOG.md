# Changelog FE1 - Audit UI & Logic

Ghi lại các thay đổi dựa trên rà soát toàn diện giao diện và logic frontend.

## Backend (be/)

- **CartController**: Thêm method `update()` xử lý set số lượng tuyệt đối (không cộng dồn). Khi `quantity <= 0` sẽ tự xoá sản phẩm khỏi giỏ.
- **routes/api.php**: Đăng ký route mới `POST /cart/update`.

## Frontend (fe1/)

### Logic & API

- `services/productService.js`: Thêm tham số `search` cho `getProducts`; thêm method mới `updateCartQuantity` gọi endpoint `/cart/update`.
- `utils/apiRequest.js`: Thêm option `silent` (tắt popup lỗi), không redirect về login khi đang ở trang auth, lưu lại `redirect` sau khi đăng nhập, xoá token/user khi bị 401.
- `utils/price.js` (NEW): Tiện ích chung cho toàn FE: `getOriginalPrice`, `getFinalPrice`, `getDiscountPercent`, `hasDiscount`, `formatVND`. Quy ước: `price` là giá gốc, `discount` là phần trăm giảm.
- `context/CartContext.js`: Kiểm tra token trước khi gọi `/cart` (tránh 401 khi chưa login).
- `components/header/index.js`: Gọi `refreshCartCount` khi user login/logout (sự kiện storage).

### Giao diện & UX

- `pages/cart.js`: Áp dụng `utils/price.js` tính đúng giá giảm; dùng `POST /cart/update` khi nhập tay số lượng; xác nhận trước khi xoá; nút xoá riêng (icon `FaTrashAlt`); sửa hydration `user`; format VND; bỏ dead imports.
- `pages/checkout.js`: Dùng `utils/price.js`; phí ship cố định 30.000đ; bỏ discount ảo; xác thực giỏ & địa chỉ; toast thay `alert`; refresh cart sau khi đặt hàng.
- `pages/orders.js`: Map trạng thái sang tiếng Việt kèm màu; loại nút search thừa (đã lọc on-change); `toast.warn` cho validate đánh giá; format VND & ngày `vi-VN`.
- `pages/product/[id].js`: Check đăng nhập trước khi add cart (redirect về `/user/login`); dùng `utils/price.js`; hiển thị tồn kho; số lượng input giới hạn theo tồn kho.
- `pages/profile.js`: Redirect login nếu chưa đăng nhập; cho phép chỉnh sửa tên/số điện thoại/địa chỉ; confirm trước khi đăng xuất; refresh cart sau logout.
- `pages/wishlist.js`: Hydration-safe; fallback khi fetch lỗi; UI responsive; truyền `discount` prop cho `ProductItem`.
- `pages/user/login.js`: Validate client-side; dùng `apiRequest` (silent); refresh cart sau login; hỗ trợ tham số `redirect`.
- `pages/user/signup.js`: Validate toàn bộ (email, phone, password, xác nhận); dùng `apiRequest`; refresh cart sau signup.
- `pages/user/signout.js`: Loại `useApolloClient` (dead); logout + xoá token + refresh cart.
- `pages/user/resetpassword.js`: Hiển thị rõ là chức năng chưa bật (backend chưa hỗ trợ), hướng dẫn liên hệ hotline.
- `pages/index.js`: Set `title` SEO; bỏ import không dùng.
- `pages/_app.js`: Gỡ bỏ `ApolloProvider`; `ToastContainer` có cấu hình chuẩn.
- `components/productItem.js`: Viết lại hoàn toàn: dùng `utils/price.js`, format VND, badge discount, nút wishlist toggle, nút thêm giỏ với check login, rating stars, a11y (aria-label).
- `components/products.js`: Đọc `search` từ router; hiển thị kết quả tìm kiếm; responsive grid nhỏ hơn.
- `components/productSection.js`: Layout 2 cột với sidebar 240px; responsive stack trên mobile.
- `components/headerBarProducts.js`: Tiếng Việt; styling đỏ chủ đạo; nút tròn; responsive.
- `components/asideCategories.js`: Header "Danh mục sản phẩm"; nested trong aside; style nhất quán.
- `components/categoriesItem.js`: Hover/active theme đỏ MANH STORE.
- `components/promoCard.js`: Card gradient đỏ với CTA "Mua ngay".
- `components/search-box.js`: Enter gửi tìm tới `/?search=` hoặc `/category/:id?search=`; submit dạng form; theme chuẩn; responsive.
- `components/header/header-desktop.js`: Loại `useQuery(GET_CART)` dead; dùng `utils/price.js` và `formatVND`; badge cart đỏ; icon đơn hàng.
- `components/header/header-mobile.js`: Dùng React state thay cho Apollo var.
- `components/header/side-drawer.js`: Loại bỏ Apollo `useQuery`; có overlay click để đóng; tiếng Việt; auto-close khi click link.
- `components/header/open-drawer-button.js`: Thêm `aria-label`.
- `components/header/index.js`: Sticky top; trigger `refreshCartCount` khi đổi storage.
- `components/emptySection.js`: Label theo context (cart/wishlist/orders); thêm nút "Về trang chủ".
- `components/logo.js`: Màu đỏ MANH STORE.
- `components/page.js`: Layout max-width 1400px, padding responsive.
- `components/title.js`: Prop `level`; thống nhất style tiêu đề.
- `components/footer.js`: Đổi tên hàm `Fotter` → `Footer` (typo).

### Dọn dẹp dead code

- Xoá hoàn toàn thư mục `apollo/` (client, queries, mutations, cache, schema, typeDefs, resolvers).
- Xoá `pages/api/graphql.js` (endpoint GraphQL không còn dùng).
- Xoá `components/finishOrderCart.js` (orphan, có bug `useState` thay `useEffect`).
- Xoá `components/productDetail.js` (orphan, trùng với `pages/product/[id].js`).
- Xoá `utils/toggleProductStates.js` (phụ thuộc Apollo var).
- Xoá `src/app/cart/page.tsx` (App Router file lạc trong project Pages Router).
- `package.json`: gỡ `@apollo/client`, `apollo-server-micro`, `graphql`, `graphql-tools`, `@hapi/iron`, `bcrypt`, `cookie`, `knex`, `sqlite3`, `micro-cors`, `mysql`, `uuidv4`; xoá script `knex:*`, thêm `lint`.

### Lưu ý khi cài đặt lại

Sau khi sync code, cần chạy:

```bash
cd fe1
rm -rf node_modules yarn.lock
yarn install   # hoặc npm install
```

để đồng bộ lại dependencies sau khi loại bỏ các gói không dùng.
