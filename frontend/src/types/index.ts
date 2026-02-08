export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'USER' | 'ADMIN';
    mustChangePassword?: boolean;
    createdAt?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    productCount?: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: string;
    discountPercent?: string;
    stock: number;
    categoryId?: string;
    category?: Category;
    imageUrl?: string;
    featured?: boolean;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface CartResponse {
    id: string;
    userId: string;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
}


export interface OrderItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    priceAtPurchase: string;
}

export interface Order {
    id: string;
    userId: string;
    subtotal: string;
    taxAmount: string;
    discountAmount: string;
    total: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    stripePaymentIntentId?: string;
    shippingAddress?: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponse {
    products: Product[];
    total: number;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment?: string;
    images?: string[];
    createdAt: string;
    user?: User;
}

export interface ProductQA {
    id: string;
    productId: string;
    question: string;
    answer?: string;
    createdAt: string;
}

export interface Testimonial {
    id: string;
    name: string;
    role?: string;
    content: string;
    avatarUrl?: string;
    rating?: number;
    featured?: boolean;
    createdAt: string;
}

export interface ApiError {
    error: string;
    details?: unknown;
}

