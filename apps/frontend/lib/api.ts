

import type {
  Category,
  Product,
  Order,
  DashboardResponse,
} from '@/types';
import axios from './axios';


class ApiClient {

  async adminGetOrderById(id: string): Promise<Order> {
    const res = await axios.get(`/admin/orders/${id}`);
    return res.data;
  }

  // Categories

  async getCategories(): Promise<Category[]> {
    const res = await axios.get('/categories');
    return res.data;
  }


  async getCategoryProducts(slug: string): Promise<{ category: Category; products: Product[] }> {
    const res = await axios.get(`/categories/${slug}/products`);
    return res.data;
  }

  // Products

  async getProducts(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const queryString = query.toString();
    const res = await axios.get(`/products${queryString ? `?${queryString}` : ''}`);
    return res.data;
  }


  async getProduct(slug: string): Promise<Product> {
    const res = await axios.get(`/products/${slug}`);
    return res.data;
  }

  // Checkout

  async checkout(data: {
    buyer: { name: string; email: string; address: string };
    items: { productId: string; quantity: number }[];
    simulate?: 'success' | 'fail';
  }): Promise<{ orderId: string; status: string; total: number }> {
    const res = await axios.post('/checkout', data);
    return res.data;
  }

  // Orders

  async getOrder(id: string): Promise<Order> {
    const res = await axios.get(`/orders/${id}`);
    return res.data;
  }

  // Admin

  async adminLogin(
    username: string,
    password: string
  ): Promise<{ token: string; admin: { id: string; username: string } }> {
    const res = await axios.post('/admin/login', { username, password });
    return res.data;
  }

  async adminGetProducts(params?: { search?: string; page?: number; limit?: number }): Promise<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const queryString = query.toString();
    const res = await axios.get(`/admin/products${queryString ? `?${queryString}` : ''}`);
    return res.data;
  }

  async adminGetProductById(id: string): Promise<Product> {
    const res = await axios.get(`/admin/products/${id}`);
    return res.data;
  }

  async adminGetCategories(): Promise<Category[]> {
    const res = await axios.get('/admin/categories');
    return res.data;
  }

  async adminCreateCategory(data: { name: string; slug: string }): Promise<Category> {
    const res = await axios.post('/admin/categories', data);
    return res.data;
  }

  async adminUpdateCategory(id: string, data: { name: string; slug: string }): Promise<Category> {
    const res = await axios.put(`/admin/categories/${id}`, data);
    return res.data;
  }

  async adminDeleteCategory(id: string): Promise<void> {
    await axios.delete(`/admin/categories/${id}`);
  }

  async adminGetOrders(params?: { page?: number; limit?: number; status?: string }): Promise<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);
    const queryString = query.toString();
    const res = await axios.get(`/admin/orders${queryString ? `?${queryString}` : ''}`);
    return res.data;
  }

  async adminCreateProduct(data: Partial<Product>): Promise<Product> {
    const res = await axios.post('/admin/products', data);
    return res.data;
  }

  async adminUpdateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await axios.put(`/admin/products/${id}`, data);
    return res.data;
  }

  async adminDeleteProduct(id: string): Promise<void> {
    await axios.delete(`/admin/products/${id}`);
  }

  // Order Status Management APIs (Sprint 6)
  async adminUpdateOrderStatus(
    orderId: string,
    data: {
      status: string;
      note?: string;
      trackingNumber?: string;
      carrier?: string;
      shipDate?: string;
      deliveryDate?: string;
      cancellationReason?: string;
      shouldRestock?: boolean;
    },
    idempotencyKey?: string
  ): Promise<{ order: Order; restocked?: Array<{ productId: string; quantity: number }> }> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const res = await axios.put(`/admin/orders/${orderId}/status`, data, { headers });
    return res.data;
  }

  async adminGetOrderActivities(
    orderId: string
  ): Promise<{
    orderId: string;
    currentStatus: string;
    activities: Array<{
      id: string;
      fromStatus: string;
      toStatus: string;
      note: string | null;
      timestamp: string;
      admin: { id: string; username: string };
    }>;
  }> {
    const res = await axios.get(`/admin/orders/${orderId}/activities`);
    return res.data;
  }

  // Admin dashboard analytics
  async adminGetDashboard(
    params?: { startDate?: string; endDate?: string }
  ): Promise<DashboardResponse> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    const res = await axios.get(`/admin/analytics/dashboard${query.toString() ? `?${query.toString()}` : ''}`);
    return res.data;
  }
}

export const api = new ApiClient();
