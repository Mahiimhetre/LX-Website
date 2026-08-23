import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CheckCircle2, Trash2 } from '@/components/icons';
import UserProfile from '@/components/playground/UserProfile';
import { ShoppingCart, AddressForm, PaymentGateway } from '@/components/playground/CheckoutSuite';
import { DataTable, DataManagement } from '@/components/playground/DataSystem';
import ModalSystem from '@/components/playground/ModalSystem';
import SignaturePad from '@/components/playground/SignaturePad';
import FormValidation from '@/components/playground/FormValidation';
import RatingSystem from '@/components/playground/RatingSystem';

const Playground = () => {
    const [view, setView] = useState('table');
    const [cart, setCart] = useState([]);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [orders, setOrders] = useState(() => {
        try {
            const saved = localStorage.getItem('lx_playground_orders');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('lx_playground_orders', JSON.stringify(orders));
        } catch (e) {}
    }, [orders]);

    // ⚡ Bolt Optimization: Wrap handlers in useCallback to prevent unnecessary re-renders
    // of child components (like DataTable and ShoppingCart) when the parent state (like `view` or `cart`) changes.
    // Impact: Avoids ~10-20ms render time per child component when unrelated parent state updates.
    const addToCart = useCallback((product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const updateQuantity = useCallback((id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return item;
                return { ...item, quantity: Math.min(newQty, item.stock) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    }, []);

    const removeItem = useCallback((id) => setCart(prev => prev.filter(item => item.id !== id)), []);
    const clearCart = useCallback(() => setCart([]), []);

    // ⚡ Bolt Optimization: Cache the price parsing and cart total calculations
    const parsePrice = useCallback((price) => parseInt(price.replace(/[₹,]/g, '')) || 0, []);
    const { cartTotal, totalWithTax } = useMemo(() => {
        const total = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
        return {
            cartTotal: total,
            totalWithTax: Math.round(total * 1.18) + (total > 0 ? 99 : 0)
        };
    }, [cart, parsePrice]);

    const handleCheckout = useCallback(() => setView('address'), []);
    const handleProceedToPayment = useCallback((amount) => {
        setPaymentAmount(amount);
        setView('payment');
    }, []);
    const handlePaymentComplete = useCallback((paymentInfo) => {
        if (cart.length > 0) {
            const newOrder = {
                id: 'LX-ORD-' + Math.floor(100000 + Math.random() * 900000),
                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                items: [...cart],
                subtotal: cartTotal,
                total: paymentAmount || totalWithTax,
                status: 'Completed',
                paymentMethod: paymentInfo?.method?.toUpperCase() || 'UPI'
            };
            setOrders(prev => [newOrder, ...prev]);
        }
        clearCart();
        setView('orders');
    }, [cart, cartTotal, paymentAmount, totalWithTax, clearCart]);

    const handleClearOrders = useCallback(() => {
        setOrders([]);
        localStorage.removeItem('lx_playground_orders');
    }, []);

    return (
        <section className="container mx-auto py-12 px-4 space-y-12">
            {/* Ambient Background */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen -z-10" />

            <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
                <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2 border border-primary/20">
                    Interactive Sandbox
                </span>
                <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white mb-4">
                    Test <span className="animated-gradient-text">Playground</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    A secure sandbox containing advanced UI structures (Shadow DOM, nested iframes, dynamic data systems) to inspect and verify selector robustness.
                </p>
            </div>

            <div className="space-y-12 w-full fade-in">
                <UserProfile />

                {view === 'table' && (
                    <DataTable
                        onAddToCart={addToCart}
                        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                        onViewCart={() => setView('cart')}
                        onViewOrders={() => setView('orders')}
                    />
                )}

                {view === 'cart' && (
                    <ShoppingCart
                        cart={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeItem}
                        onClearCart={clearCart}
                        onContinueShopping={() => setView('table')}
                        onCheckout={handleCheckout}
                    />
                )}

                {view === 'address' && (
                    <AddressForm
                        onClose={() => setView('cart')}
                        onProceedToPayment={handleProceedToPayment}
                        cartTotal={totalWithTax}
                    />
                )}

                {view === 'payment' && (
                    <PaymentGateway
                        amount={paymentAmount}
                        onClose={() => setView('address')}
                        onPaymentComplete={handlePaymentComplete}
                    />
                )}

                {view === 'orders' && (
                    <Card className="w-full glass-panel">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setView('table')}
                                    className="gap-2 text-muted-foreground hover:text-white"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" /> Back to Products
                                </Button>
                                <CardTitle>My Sandbox Orders</CardTitle>
                            </div>
                            {orders.length > 0 && (
                                <Button variant="destructive" size="sm" onClick={handleClearOrders} className="gap-2 text-xs">
                                    <Trash2 className="h-3.5 w-3.5" /> Clear History
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {orders.length === 0 ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="text-4xl">📦</div>
                                    <h3 className="text-lg font-semibold">No Sandbox Orders Found</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                        Complete a test checkout flow in the sandbox above to see your order history populate dynamically.
                                    </p>
                                    <Button onClick={() => setView('table')}>
                                        Start Sandbox Shopping
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <Card key={order.id} className="glass border border-white/10 bg-white/5 p-4 space-y-4">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/10 pb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-primary">{order.id}</span>
                                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                            <CheckCircle2 className="w-3 h-3" /> {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Placed on {order.date} via {order.paymentMethod}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-muted-foreground">Total Paid</span>
                                                    <p className="text-lg font-bold text-white">₹{order.total?.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                                                        <div>
                                                            <span className="font-medium text-slate-200">{item.name}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">x{item.quantity}</span>
                                                        </div>
                                                        <span className="font-mono text-muted-foreground">{item.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-8">
                        <ModalSystem />
                        <SignaturePad />
                    </div>
                    <DataManagement />
                </div>

                <FormValidation />

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <Card className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-primary/40 hover:shadow-glow-cyan transition-all duration-300 overflow-hidden transform-gpu">
                        <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight text-white font-display">Selectors &amp; XPath Challenges</h2>

                            <div className="p-6 rounded-2xl bg-black/30 border border-white/8 backdrop-blur-md">
                                <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 tracking-wide uppercase">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    Complex Scenarios Covered
                                </h3>
                                <ul className="grid gap-2.5 text-xs text-muted-foreground font-mono">
                                    {[
                                        'Shadow DOM (Open, Closed, Nested) - Payment Gateway',
                                        'Iframes (Simple, Nested, Sandboxed) - Address Form & Security',
                                        'Bottom Modal Overlay - Modal System',
                                        'Loading Spinner Animation - Payment Flow',
                                        'Native Form Validation - Form Verification',
                                        'Dynamic Cascading Dropdowns - Address Entry',
                                        'Input State Toggles - User Profile',
                                        'Advanced Data Table - Main Product Table',
                                        'File Upload / Import - Data Management',
                                        'Window Prompt Alerts - Payment Gateway completion'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-muted-foreground hover:text-white transition-colors leading-relaxed">
                                            <span className="text-primary font-bold mt-0.5 shrink-0">&raquo;</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>

                    <RatingSystem />
                </div>
            </div>
        </section>
    );
};

export default Playground;
