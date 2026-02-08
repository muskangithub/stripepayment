'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { ordersApi, paymentsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { Order } from '@/types';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError('');

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
            },
        });

        if (result.error) {
            setError(result.error.message || 'Payment failed');
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-rose-500/20 border border-rose-500/50 text-rose-400 rounded-xl p-4 text-sm">
                    {error}
                </div>
            )}
            <PaymentElement />
            <Button type="submit" className="w-full" size="lg" disabled={loading || !stripe}>
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay Now
                    </>
                )}
            </Button>
        </form>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, tax, total, clearCart } = useCart();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
    const [shippingAddress, setShippingAddress] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login?redirect=/checkout');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (items.length === 0 && step !== 'success') {
            router.push('/cart');
        }
    }, [items, step, router]);

    async function handleCreateOrder() {
        if (!shippingAddress.trim()) {
            setError('Please enter a shipping address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const orderData = await ordersApi.create(
                items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
                shippingAddress
            ) as Order;
            setOrder(orderData);

            const paymentData = await paymentsApi.createPaymentIntent(orderData.id);
            setClientSecret(paymentData.clientSecret);
            setStep('payment');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create order');
        } finally {
            setLoading(false);
        }
    }

    function handlePaymentSuccess() {
        clearCart();
        setStep('success');
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <CheckCircle className="w-24 h-24 text-emerald-400 mb-6" />
                <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
                <p className="text-gray-400 mb-8">Thank you for your purchase. You will receive a confirmation email shortly.</p>
                <Link href="/orders">
                    <Button size="lg">View My Orders</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                {/* Steps */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step === 'address' ? 'text-purple-400' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'address' ? 'bg-purple-500' : 'bg-gray-600'}`}>1</div>
                        <span>Shipping</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-600"></div>
                    <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-purple-400' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-purple-500' : 'bg-gray-600'}`}>2</div>
                        <span>Payment</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        {error && (
                            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-400 rounded-xl p-4 text-sm mb-6">
                                {error}
                            </div>
                        )}

                        {step === 'address' && (
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Shipping Address
                                </h2>
                                <textarea
                                    placeholder="Enter your full shipping address..."
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                />
                                <Button onClick={handleCreateOrder} className="mt-6 w-full" size="lg" disabled={loading}>
                                    {loading ? 'Processing...' : 'Continue to Payment'}
                                </Button>
                            </div>
                        )}

                        {step === 'payment' && clientSecret && (
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Details
                                </h2>
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret,
                                        appearance: {
                                            theme: 'night',
                                            variables: {
                                                colorPrimary: '#a855f7',
                                                colorBackground: '#1e1e2e',
                                                colorText: '#ffffff',
                                                borderRadius: '12px',
                                            },
                                        },
                                    }}
                                >
                                    <CheckoutForm orderId={order?.id || ''} onSuccess={handlePaymentSuccess} />
                                </Elements>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            <div className="space-y-3 mb-6">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex justify-between text-sm">
                                        <span className="text-gray-300 truncate flex-1 mr-2">{item.product.name} × {item.quantity}</span>
                                        <span>{formatPrice(parseFloat(item.product.price) * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <hr className="border-white/10 mb-4" />
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Tax</span>
                                    <span>{formatPrice(tax)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Shipping</span>
                                    <span className="text-emerald-400">Free</span>
                                </div>
                                <hr className="border-white/10" />
                                <div className="flex justify-between text-xl font-bold pt-2">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
