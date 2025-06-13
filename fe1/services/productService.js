import { apiRequest } from '../utils/apiRequest';

const API_URL = 'http://127.0.0.1:8000/api';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const productService = {
  // Lấy danh sách sản phẩm với các bộ lọc
  getProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.new) queryParams.append('new', params.new);
    if (params.discount) queryParams.append('discount', params.discount);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    return apiRequest(`${API_URL}/products?${queryParams.toString()}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
  },

  // Lấy chi tiết một sản phẩm
  getProductById: async (id) => {
    return apiRequest(`${API_URL}/products/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
  },

  // Lấy danh sách danh mục
  getCategories: async () => {
    return apiRequest(`${API_URL}/categories`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
  },

  // Lấy danh sách sản phẩm trong giỏ hàng
  getCart: async () => {
    return apiRequest(`${API_URL}/cart`, {
      credentials: 'include',
      headers: {
        ...getAuthHeaders(),
      },
    });
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async ({ product_id, quantity }) => {
    return apiRequest(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({ product_id, quantity }),
    });
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async ({ product_id }) => {
    return apiRequest(`${API_URL}/cart/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({ product_id }),
    });
  },
}; 