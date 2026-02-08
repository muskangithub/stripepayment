'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ordersApi, productsApi, categoriesApi } from '@/lib/api';
import { Order, Product, Category, ProductsResponse } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Tag,
    Loader2,
    TrendingUp,
    Users,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    SHIPPED: 'bg-purple-500/20 text-purple-400',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400',
    CANCELLED: 'bg-rose-500/20 text-rose-400',
};

export default function AdminDashboard() {
    const router = useRouter();
    const { isAdmin, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    async function loadData() {
        try {
            const [ordersData, productsData, categoriesData] = await Promise.all([
                ordersApi.getAllAdmin() as Promise<Order[]>,
                productsApi.getAll() as Promise<ProductsResponse>,
                categoriesApi.getAll() as Promise<Category[]>,
            ]);
            setOrders(ordersData);
            setProducts(productsData.products);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(orderId: string, newStatus: string) {
        try {
            await ordersApi.updateStatus(orderId, newStatus);
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
            ));
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            </div>
        );
    }

    const totalRevenue = orders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, order) => sum + parseFloat(order.total), 0);
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const filteredOrders = selectedStatus
        ? orders.filter(o => o.status === selectedStatus)
        : orders;

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <LayoutDashboard className="w-8 h-8 text-purple-400" />
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6">
                        <DollarSign className="w-8 h-8 text-purple-400 mb-2" />
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-6">
                        <ShoppingBag className="w-8 h-8 text-blue-400 mb-2" />
                        <p className="text-gray-400 text-sm">Total Orders</p>
                        <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-6">
                        <TrendingUp className="w-8 h-8 text-amber-400 mb-2" />
                        <p className="text-gray-400 text-sm">Pending Orders</p>
                        <p className="text-2xl font-bold">{pendingOrders}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-2xl p-6">
                        <Package className="w-8 h-8 text-emerald-400 mb-2" />
                        <p className="text-gray-400 text-sm">Products</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Recent Orders
                        </h2>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-white/10">
                                    <th className="pb-4">Order ID</th>
                                    <th className="pb-4">Date</th>
                                    <th className="pb-4">Items</th>
                                    <th className="pb-4">Total</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.slice(0, 10).map((order) => (
                                    <tr key={order.id} className="border-b border-white/5">
                                        <td className="py-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                                        <td className="py-4 text-gray-400">{formatDate(order.createdAt)}</td>
                                        <td className="py-4">{order.items?.length || 0}</td>
                                        <td className="py-4 font-bold">{formatPrice(order.total)}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PROCESSING">Processing</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Products & Categories */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5" />
                            Products ({products.length})
                        </h2>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {products.slice(0, 5).map((product) => (
                                <div key={product.id} className="flex items-center justify-between">
                                    <span className="truncate flex-1 mr-4">{product.name}</span>
                                    <span className="text-gray-400">{formatPrice(product.price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5" />
                            Categories ({categories.length})
                        </h2>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between">
                                    <span>{category.name}</span>
                                    <span className="text-gray-400">{category.productCount || 0} products</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
