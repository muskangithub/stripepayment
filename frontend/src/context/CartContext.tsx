'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { calculateDiscountedPrice } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { cartApi } from '@/lib/api';

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    tax: number;
    total: number;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08; // 8%

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Initial load and sync on auth change
    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated) {
                try {
                    const cart = await cartApi.get();
                    if (cart && cart.items) {
                        setItems(cart.items.map((item: any) => ({
                            product: item.product,
                            quantity: item.quantity
                        })));
                    } else {
                        setItems([]);
                    }
                } catch (error) {
                    console.error('Failed to load cart from server:', error);
                    // Fallback or empty? Probably empty if server error or auth error
                    setItems([]);
                }
            } else {
                // Load from localStorage for guest
                const storedCart = localStorage.getItem('cart');
                if (storedCart) {
                    try {
                        setItems(JSON.parse(storedCart));
                    } catch {
                        console.error('Failed to parse cart from localStorage');
                        setItems([]);
                    }
                } else {
                    setItems([]);
                }
            }
            setIsHydrated(true);
        };

        loadCart();
    }, [isAuthenticated]);

    // Save cart to localStorage whenever it changes (only for guest)
    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isHydrated, isAuthenticated]);

    const addItem = async (product: Product, quantity = 1) => {
        if (isAuthenticated) {
            try {
                // Optimistic update? Or wait for server?
                // For better UX, let's wait but handle errors.
                // Actually optimistic is complex. Let's just call API and refresh.
                // The API returns the updated cart.
                const updatedCart = await cartApi.add(product.id, quantity);
                if (updatedCart && updatedCart.items) {
                    setItems(updatedCart.items.map((item: any) => ({
                        product: item.product,
                        quantity: item.quantity
                    })));
                }
            } catch (error) {
                console.error('Failed to add item to server cart:', error);
                alert('Failed to add item to cart. Please try again.');
            }
        } else {
            setItems((prev) => {
                const existingItem = prev.find((item) => item.product.id === product.id);
                if (existingItem) {
                    return prev.map((item) =>
                        item.product.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                return [...prev, { product, quantity }];
            });
        }
    };

    const removeItem = async (productId: string) => {
        if (isAuthenticated) {
            try {
                await cartApi.remove(productId);
                setItems((prev) => prev.filter((item) => item.product.id !== productId));
            } catch (error) {
                console.error('Failed to remove item from server cart:', error);
            }
        } else {
            setItems((prev) => prev.filter((item) => item.product.id !== productId));
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }

        if (isAuthenticated) {
            try {
                await cartApi.update(productId, quantity);
                // Update local state to reflect change without re-fetching entire cart if possible, 
                // but re-fetching is safer.
                // However, we just need to update one item.
                setItems((prev) =>
                    prev.map((item) =>
                        item.product.id === productId ? { ...item, quantity } : item
                    )
                );
            } catch (error) {
                console.error('Failed to update quantity on server:', error);
            }
        } else {
            setItems((prev) =>
                prev.map((item) =>
                    item.product.id === productId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                await cartApi.clear();
                setItems([]);
            } catch (error) {
                console.error('Failed to clear server cart:', error);
            }
        } else {
            setItems([]);
            localStorage.removeItem('cart');
        }
    };

    const isInCart = (productId: string) => {
        return items.some((item) => item.product.id === productId);
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const subtotal = items.reduce((sum, item) => {
        const price = calculateDiscountedPrice(item.product.price, item.product.discountPercent);
        return sum + price * item.quantity;
    }, 0);

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                tax,
                total,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                isInCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
