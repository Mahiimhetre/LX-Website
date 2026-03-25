import { useState } from 'react';
import UserProfile from '@/components/playground/UserProfile';
import { ShoppingCart, AddressForm, PaymentGateway } from '@/components/playground/CheckoutSuite';
import { DataTable, DataManagement } from '@/components/playground/DataSystem';
import ModalSystem from '@/components/playground/ModalSystem';
import FormValidation from '@/components/playground/FormValidation';
import RatingSystem from '@/components/playground/RatingSystem';

const Playground = () => {
    const [view, setView] = useState('table');
    const [cart, setCart] = useState([]);
    const [paymentAmount, setPaymentAmount] = useState(0);

    const addToCart = (product) => {
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
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return item;
                return { ...item, quantity: Math.min(newQty, item.stock) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeItem = (id) => setCart(prev => prev.filter(item => item.id !== id));
    const clearCart = () => setCart([]);

    const parsePrice = (price) => parseInt(price.replace(/[₹,]/g, '')) || 0;
    const cartTotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
    const totalWithTax = Math.round(cartTotal * 1.18) + (cartTotal > 0 ? 99 : 0);

    const handleCheckout = () => setView('address');
    const handleProceedToPayment = (amount) => {
        setPaymentAmount(amount);
        setView('payment');
    };
    const handlePaymentComplete = () => {
        clearCart();
        setView('table');
    };

    return (
        <section className="container mx-auto py-12 px-4 space-y-12">
            {/* Ambient Background */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen -z-10" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen -z-10" />

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    Test Playground
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                    Advanced UI components with Shadow DOM and iframes.
                </p>
            </div>

            <UserProfile />

            {view === 'table' && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <DataTable
                        onAddToCart={addToCart}
                        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                        onViewCart={() => setView('cart')}
                        onViewOrders={() => setView('orders')}
                    />
                </div>
            )}

            {view === 'cart' && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <ShoppingCart
                        cart={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeItem}
                        onClearCart={clearCart}
                        onContinueShopping={() => setView('table')}
                        onCheckout={handleCheckout}
                    />
                </div>
            )}

            {view === 'address' && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto">
                    <AddressForm
                        onClose={() => setView('cart')}
                        onProceedToPayment={handleProceedToPayment}
                        cartTotal={totalWithTax}
                    />
                </div>
            )}

            {view === 'payment' && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto">
                    <PaymentGateway
                        amount={paymentAmount}
                        onClose={() => setView('address')}
                        onPaymentComplete={handlePaymentComplete}
                    />
                </div>
            )}

            {view === 'orders' && (
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setView('table')}
                            className="text-sm text-muted-foreground hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                        <h2 className="text-2xl font-semibold text-white">My Orders</h2>
                    </div>
                    <div className="text-center py-12 space-y-4">
                        <div className="text-4xl">📦</div>
                        <p className="text-muted-foreground">No orders found</p>
                        <button
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
                            onClick={() => setView('table')}
                        >
                            Start Shopping
                        </button>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                <ModalSystem />
                <DataManagement />
            </div>

            <FormValidation />

            <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-3xl rounded-full" />
                <div className="relative z-10 space-y-6">
                    <h2 className="text-2xl font-bold text-white">Selectors & XPath Challenges</h2>

                    <div className="glass-card p-6 rounded-xl bg-white/5 border border-white/5">
                        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            Complex Scenarios Covered
                        </h3>
                        <ul className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
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
                                <li key={i} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <span className="w-1 h-1 rounded-full bg-primary/50" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <RatingSystem />
        </section>
    );
};

export default Playground;
