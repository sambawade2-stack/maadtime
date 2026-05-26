import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = Cookies.get("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
          Cookies.set("access_token", data.access, { expires: 1 });
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/auth/connexion";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login/", { email, password }),
  register: (data: object) => api.post("/auth/register/", data),
  logout: (refresh: string) => api.post("/auth/logout/", { refresh }),
  profile: () => api.get("/auth/profile/"),
  updateProfile: (data: object) => api.patch("/auth/profile/", data),
  changePassword: (old_password: string, new_password: string) =>
    api.post("/auth/change-password/", { old_password, new_password }),
};

export const productsApi = {
  list: (params?: object) => api.get("/products/", { params }),
  detail: (slug: string) => api.get(`/products/${slug}/`),
  featured: () => api.get("/products/featured/"),
  newArrivals: () => api.get("/products/new_arrivals/"),
  similar: (params: object) => api.get("/products/similar/", { params }),
  categories: () => api.get("/products/categories/"),
  category: (slug: string) => api.get(`/products/categories/${slug}/`),
  wishlist: () => api.get("/products/wishlist/"),
  addWishlist: (product_id: number) => api.post("/products/wishlist/", { product_id }),
  removeWishlist: (product_id: number) =>
    api.delete("/products/wishlist/remove/", { data: { product_id } }),
};

export const ordersApi = {
  create: (data: object) => api.post("/orders/", data),
  list: (params?: object) => api.get("/orders/", { params }),
  detail: (id: number) => api.get(`/orders/${id}/`),
  cancel: (id: number) => api.post(`/orders/${id}/cancel/`),
  track: (number: string) => api.get("/orders/track/", { params: { number } }),
  addresses: () => api.get("/orders/addresses/"),
  createAddress: (data: object) => api.post("/orders/addresses/", data),
};

export const storesApi = {
  list: () => api.get("/stores/"),
  create: (data: object) => api.post("/stores/", data),
  update: (id: number, data: object) => api.patch(`/stores/${id}/`, data),
  delete: (id: number) => api.delete(`/stores/${id}/`),
  stats: (id: number) => api.get(`/stores/${id}/stats/`),
  overview: () => api.get("/stores/overview/"),
  // Gérants
  listUsers: () => api.get("/stores/users/"),
  createUser: (data: object) => api.post("/stores/users/", data),
  updateUser: (id: number, data: object) => api.patch(`/stores/users/${id}/`, data),
  deleteUser: (id: number) => api.delete(`/stores/users/${id}/`),
};

export const dashboardApi = {
  stats: (params?: object) => api.get("/dashboard/stats/", { params }),
  salesChart: (period?: string, params?: object) => api.get("/dashboard/sales-chart/", { params: { period, ...params } }),
  topProducts: (params?: object) => api.get("/dashboard/top-products/", { params }),
  recentOrders: () => api.get("/dashboard/recent-orders/"),
  products: (params?: object) => api.get("/products/", { params }),
  updateProduct: (slug: string, data: object) => api.patch(`/products/${slug}/`, data),
  deleteProduct: (slug: string) => api.delete(`/products/${slug}/`),
  createProduct: (data: object) => api.post("/products/", data),
  uploadProductImage: async (slug: string, formData: FormData) => {
    const token = Cookies.get("access_token");
    const res = await fetch(`${API_URL}/products/${slug}/add_image/`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw { response: { data: await res.json() } };
    return res.json();
  },
  // Categories admin
  allCategories: (params?: object) => api.get("/products/categories/", { params }),
  createCategory: (data: object) => api.post("/products/categories/", data),
  updateCategory: (slug: string, data: object) => api.patch(`/products/categories/${slug}/`, data),
  deleteCategory: (slug: string) => api.delete(`/products/categories/${slug}/`),
  // Orders
  allOrders: (params?: object) => api.get("/orders/", { params }),
  updateOrderStatus: (id: number, status: string) =>
    api.patch(`/orders/${id}/update_status/`, { status }),
  customers: () => api.get("/customers/"),
  deliveries: () => api.get("/deliveries/"),
  deliveryZones: () => api.get("/deliveries/zones/"),
};
