const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  inventory: number;
  published: boolean;
  images: string[];
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  address: string;
  total: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getCategoryProducts(slug: string): Promise<{ category: Category; products: Product[] }> {
    return this.request<{ category: Category; products: Product[] }>(
      `/categories/${slug}/products`
    );
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
    return this.request<{ data: Product[]; total: number; page: number; limit: number }>(
      `/products${queryString ? `?${queryString}` : ''}`
    );
  }

  async getProduct(slug: string): Promise<Product> {
    return this.request<Product>(`/products/${slug}`);
  }

  // Checkout
  async checkout(data: {
    buyer: { name: string; email: string; address: string };
    items: { productId: string; quantity: number }[];
    simulate?: 'success' | 'fail';
  }): Promise<{ orderId: string; status: string; total: number }> {
    return this.request('/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Orders
  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  // Admin
  async adminLogin(
    username: string,
    password: string
  ): Promise<{ token: string; admin: { id: string; username: string } }> {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async adminGetProducts(token: string): Promise<Product[]> {
    return this.request('/admin/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async adminCreateProduct(token: string, data: Partial<Product>): Promise<Product> {
    return this.request('/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async adminUpdateProduct(token: string, id: string, data: Partial<Product>): Promise<Product> {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  async adminDeleteProduct(token: string, id: string): Promise<void> {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
