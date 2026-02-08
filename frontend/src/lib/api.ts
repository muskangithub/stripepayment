import { CartResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data as T;
}

// Auth API
export const authApi = {
    register: (email: string, password: string, firstName?: string, lastName?: string) =>
        request('/auth/register', { method: 'POST', body: { email, password, firstName, lastName } }),

    login: (email: string, password: string) =>
        request('/auth/login', { method: 'POST', body: { email, password } }),

    getMe: () => request('/auth/me'),

    changePassword: (currentPassword: string, newPassword: string) =>
        request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
};

// Products API
export const productsApi = {
    getAll: (params?: { category?: string; search?: string; featured?: boolean; sort?: string; limit?: number; offset?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.set('category', params.category);
        if (params?.search) searchParams.set('search', params.search);
        if (params?.featured) searchParams.set('featured', 'true');
        if (params?.sort) searchParams.set('sort', params.sort);
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.offset) searchParams.set('offset', params.offset.toString());

        const query = searchParams.toString();
        return request(`/products${query ? `?${query}` : ''}`);
    },

    getBySlug: (slug: string) => request(`/products/${slug}`),

    create: (product: unknown) => request('/products', { method: 'POST', body: product }),

    update: (id: string, product: unknown) => request(`/products/${id}`, { method: 'PATCH', body: product }),

    delete: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
};

// Categories API
export const categoriesApi = {
    getAll: () => request('/categories'),

    getBySlug: (slug: string) => request(`/categories/${slug}`),

    create: (category: unknown) => request('/categories', { method: 'POST', body: category }),

    update: (id: string, category: unknown) => request(`/categories/${id}`, { method: 'PATCH', body: category }),

    delete: (id: string) => request(`/categories/${id}`, { method: 'DELETE' }),
};

// Orders API
export const ordersApi = {
    getAll: () => request('/orders'),

    getById: (id: string) => request(`/orders/${id}`),

    create: (items: { productId: string; quantity: number }[], shippingAddress: string) =>
        request('/orders', { method: 'POST', body: { items, shippingAddress } }),

    // Admin
    getAllAdmin: (params?: { status?: string; limit?: number; offset?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set('status', params.status);
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.offset) searchParams.set('offset', params.offset.toString());

        const query = searchParams.toString();
        return request(`/orders/admin/all${query ? `?${query}` : ''}`);
    },

    updateStatus: (id: string, status: string) =>
        request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
};

// Payments API
export const paymentsApi = {
    createPaymentIntent: (orderId: string) =>
        request<{ clientSecret: string }>('/payments/create-payment-intent', { method: 'POST', body: { orderId } }),

    getStatus: (orderId: string) => request(`/payments/status/${orderId}`),
};

// Cart API
export const cartApi = {
    get: () => request<CartResponse>('/cart'),
    add: (productId: string, quantity: number) => request<CartResponse>('/cart', { method: 'POST', body: { productId, quantity } }),
    update: (productId: string, quantity: number) => request<CartResponse>(`/cart/${productId}`, { method: 'PUT', body: { quantity } }),
    remove: (productId: string) => request<CartResponse>(`/cart/${productId}`, { method: 'DELETE' }),
    clear: () => request<void>('/cart', { method: 'DELETE' }),
};


// Testimonials API
export const testimonialsApi = {
    getAll: () => request('/testimonials'),
    getFeatured: () => request('/testimonials/featured'),
};

// Reviews API
export const reviewsApi = {
    getByProduct: (productId: string) => request(`/reviews/product/${productId}`),
    create: (productId: string, rating: number, comment?: string) =>
        request('/reviews', { method: 'POST', body: { productId, rating, comment } }),
};

// Q&A API
export const qaApi = {
    getByProduct: (productId: string) => request(`/qa/product/${productId}`),
};

