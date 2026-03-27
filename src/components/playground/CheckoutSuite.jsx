import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    ShoppingCart as CartIcon,
    Trash2, Plus, Minus, ArrowLeft, ShoppingBag,
    CreditCard, Wallet, Landmark, QrCode, Smartphone, Building, Loader2
} from 'lucide-react';

// --- Shopping Cart Component ---
// ⚡ Bolt Optimization: Wrap component in React.memo so it only re-renders when its specific props (like `cart`) change.
export const ShoppingCart = React.memo(({
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onContinueShopping,
    onCheckout
}) => {
    const parsePrice = (price) => parseInt(price?.toString().replace(/[₹,]/g, '')) || 0;

    const { subtotal, tax, shipping, total } = useMemo(() => {
        const sub = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
        const t = Math.round(sub * 0.18);
        const ship = sub > 0 ? 99 : 0;
        return { subtotal: sub, tax: t, shipping: ship, total: sub + t + ship };
    }, [cart]);

    const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <Card className="w-full bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onContinueShopping} title="Back to Products">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <CardTitle className="flex items-center gap-2">
                        <CartIcon className="h-5 w-5" /> Shopping Cart
                    </CardTitle>
                </div>
                {cart.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={onClearCart} className="gap-2">
                        <Trash2 className="h-4 w-4" /> Clear Cart
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="bg-white/5 p-6 rounded-full">
                            <CartIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold">Your cart is empty</h3>
                            <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
                        </div>
                        <Button onClick={onContinueShopping} className="gap-2">
                            <ShoppingBag className="h-4 w-4" /> Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <Card key={item.id} className="bg-white/5 border-white/10">
                                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                        <div className="space-y-1 flex-1">
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground">{item.category}</p>
                                            <p className="font-medium text-primary">{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex items-center gap-2 bg-background/50 rounded-md border border-input p-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-sm"
                                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-sm"
                                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                                    disabled={item.quantity >= item.stock}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => onRemoveItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <Card className="bg-white/5 border-white/10 sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tax (18%)</span>
                                            <span>{formatPrice(tax)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>{formatPrice(shipping)}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-primary">{formatPrice(total)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col gap-3">
                                    <Button className="w-full gap-2" size="lg" onClick={onCheckout}>
                                        Proceed to Checkout
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={onContinueShopping}>
                                        Continue Shopping
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

// --- Address Form Component ---
// ⚡ Bolt Optimization: Wrap component in React.memo so it only re-renders when its specific props change.
const countries = {
    in: { name: 'India', states: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu'] },
    us: { name: 'United States', states: ['California', 'Texas', 'New York', 'Florida'] },
    uk: { name: 'United Kingdom', states: ['England', 'Scotland', 'Wales'] },
    ca: { name: 'Canada', states: ['Ontario', 'Quebec', 'British Columbia'] }
};

const citiesByState = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
    'Delhi': ['New Delhi', 'Noida', 'Gurgaon'],
    'California': ['Los Angeles', 'San Francisco', 'San Diego'],
    'Texas': ['Houston', 'Austin', 'Dallas'],
    'England': ['London', 'Manchester', 'Birmingham'],
    'Ontario': ['Toronto', 'Ottawa', 'Hamilton'],
};

export const AddressForm = React.memo(({ onClose, onProceedToPayment, cartTotal }) => {
    const [address, setAddress] = useState({
        fullName: '', phone: '', address: '', country: '',
        state: '', city: '', pinCode: '', addressType: ''
    });

    const states = address.country ? countries[address.country]?.states || [] : [];
    const cities = address.state ? citiesByState[address.state] || [] : [];

    const handleSubmit = () => {
        if (!address.fullName || !address.phone || !address.address || !address.country ||
            !address.state || !address.city || !address.pinCode || !address.addressType) {
            alert('Please fill all required fields');
            return;
        }
        onProceedToPayment(cartTotal);
    };

    return (
        <Card className="w-full bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Delivery Address</CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input placeholder="Enter full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input placeholder="+91 98765 43210" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Address *</Label>
                        <Input placeholder="House/Flat No., Street Name" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Country *</Label>
                        <Select value={address.country} onValueChange={(value) => setAddress({ ...address, country: value, state: '', city: '' })}>
                            <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(countries).map(([code, data]) => (
                                    <SelectItem key={code} value={code}>{data.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>State *</Label>
                        <Select value={address.state} onValueChange={(value) => setAddress({ ...address, state: value, city: '' })} disabled={!address.country}>
                            <SelectTrigger><SelectValue placeholder={address.country ? 'Select State' : 'Select Country First'} /></SelectTrigger>
                            <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>City *</Label>
                        <Select value={address.city} onValueChange={(value) => setAddress({ ...address, city: value })} disabled={!address.state}>
                            <SelectTrigger><SelectValue placeholder={address.state ? 'Select City' : 'Select State First'} /></SelectTrigger>
                            <SelectContent>{cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>PIN Code *</Label>
                        <Input placeholder="400001" maxLength={6} value={address.pinCode} onChange={(e) => setAddress({ ...address, pinCode: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Address Type *</Label>
                        <RadioGroup value={address.addressType} onValueChange={(v) => setAddress({ ...address, addressType: v })} className="flex gap-4">
                            {['home', 'office', 'other'].map((type) => (
                                <div key={type} className="flex items-center space-x-2">
                                    <RadioGroupItem value={type} id={type} />
                                    <Label htmlFor={type} className="capitalize cursor-pointer">{type}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-6">
                    <Label className="mb-2 block">Location Preview</Label>
                    <div className="relative w-full h-[200px] rounded-md overflow-hidden border border-white/10 bg-black/20">
                        <iframe
                            srcDoc={`
                                <!DOCTYPE html>
                                <html>
                                <body style="margin:0; padding:0; background:#1e293b; color:#94a3b8; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; flex-direction:column;">
                                    <div style="text-align:center;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#38bdf8; margin-bottom:8px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                        <p>Map View Area</p>
                                        <button id="street-view-btn" style="margin-top:10px; padding:6px 12px; background:#0f172a; color:white; border:1px solid #334155; border-radius:4px; cursor:pointer;">Toggle Street View</button>
                                        <div id="nested-container" style="margin-top:10px; display:none; width: 200px; height: 100px; border: 1px dashed #64748b;"></div>
                                    </div>
                                    <script>
                                        const btn = document.getElementById('street-view-btn');
                                        const container = document.getElementById('nested-container');
                                        let isOpen = false;
                                        btn.addEventListener('click', () => {
                                            isOpen = !isOpen;
                                            if (isOpen) {
                                                container.style.display = 'block';
                                                container.innerHTML = '<iframe srcdoc="<body style=\\'margin:0; background:#000; color:#fff; display:flex; justify-content:center; align-items:center; height:100%;\\'><p style=\\'font-size:10px;\\'>Street View (Nested)</p></body>" style="width:100%; height:100%; border:none;"></iframe>';
                                                btn.textContent = 'Close Street View';
                                            } else {
                                                container.style.display = 'none';
                                                container.innerHTML = '';
                                                btn.textContent = 'Toggle Street View';
                                            }
                                        });
                                    </script>
                                </body>
                                </html>
                            `}
                            className="w-full h-full"
                            title="Map Preview"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setAddress({
                    fullName: '', phone: '', address: '', country: '',
                    state: '', city: '', pinCode: '', addressType: ''
                })}>Clear Form</Button>
                <Button onClick={handleSubmit}>Proceed to Payment</Button>
            </CardFooter>
        </Card>
    );
});

// --- Payment Gateway Component ---
// ⚡ Bolt Optimization: Wrap component in React.memo so it only re-renders when its specific props change.
export const PaymentGateway = React.memo(({ amount, onClose, onPaymentComplete }) => {
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [paymentAmount, setPaymentAmount] = useState(amount);
    const [isProcessing, setIsProcessing] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [selectedBank, setSelectedBank] = useState('');

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const secureBadgeRef = useRef(null);

    const antiFraudRef = useRef(null);

    useEffect(() => {
        if (secureBadgeRef.current && !secureBadgeRef.current.shadowRoot) {
            const shadow = secureBadgeRef.current.attachShadow({ mode: 'open' });
            shadow.innerHTML = `
                <style>
                    :host { display: block; margin-top: 1rem; text-align: center; }
                    .badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 0.5rem 1rem; border-radius: 9999px; font-family: inherit; font-size: 0.875rem; border: 1px solid rgba(34, 197, 94, 0.2); cursor: default; transition: all 0.2s; }
                    .badge:hover { background: rgba(34, 197, 94, 0.2); }
                    .icon { width: 1.2em; height: 1.2em; fill: currentColor; }
                </style>
                <div class="badge">
                    <svg class="icon" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                    <span>256-bit SSL Encrypted</span>
                </div>
                <div id="nested-partner"></div>
            `;
            const nestedContainer = shadow.getElementById('nested-partner');
            if (nestedContainer) {
                const nestedShadow = nestedContainer.attachShadow({ mode: 'open' });
                nestedShadow.innerHTML = `<style>.nested-badge { font-size: 0.65rem; color: #a1a1aa; margin-top: 4px; letter-spacing: 0.05em; }</style><div class="nested-badge">VERIFIED PARTNER (NESTED)</div>`;
            }
        }
        if (antiFraudRef.current) {
            try {
                const shadow = antiFraudRef.current.attachShadow({ mode: 'closed' });
                shadow.innerHTML = `<div style="display:none;" id="tracker-pixel"></div><script>console.log("Anti-fraud tracker initialized in closed shadow root");</script>`;
            } catch (e) { }
        }
    }, []);

    const processPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            alert(`Payment of ₹${paymentAmount.toLocaleString('en-IN')} successful!`);
            onPaymentComplete();
        }, 2000);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Payment Gateway</CardTitle><CardDescription>Securely complete transaction</CardDescription></div>
                <Button variant="ghost" onClick={onClose}>Close</Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <Label className="text-lg font-semibold">Amount to Pay:</Label>
                    <div className="relative w-full max-w-[200px]"><span className="absolute left-3 top-2.5 text-muted-foreground">₹</span><Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} className="pl-7 bg-background" /></div>
                </div>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6"><TabsTrigger value="upi" className="gap-2"><Smartphone className="h-4 w-4" /> UPI</TabsTrigger><TabsTrigger value="card" className="gap-2"><CreditCard className="h-4 w-4" /> Card</TabsTrigger><TabsTrigger value="netbanking" className="gap-2"><Landmark className="h-4 w-4" /> Net Banking</TabsTrigger></TabsList>
                    <TabsContent value="upi" className="space-y-6">
                        <div className="space-y-4">
                            <Label>Enter UPI ID</Label>
                            <Input placeholder="user@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                            <div className="grid grid-cols-3 gap-3">
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-1" onClick={() => setUpiId('user@paytm')}>
                                    <span className="text-xl">💰</span>
                                    <span className="text-xs">Paytm</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-1" onClick={() => setUpiId('user@gpay')}>
                                    <span className="text-xl">🔵</span>
                                    <span className="text-xs">Google Pay</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-3 flex flex-col gap-1" onClick={() => setUpiId('user@phonepe')}>
                                    <span className="text-xl">📱</span>
                                    <span className="text-xs">PhonePe</span>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="card" className="space-y-4">
                        <Label>Card Number</Label>
                        <Input
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            value={card.number}
                            onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Expiry</Label>
                                <Input
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={card.expiry}
                                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>CVV</Label>
                                <Input
                                    type="password"
                                    placeholder="123"
                                    maxLength={3}
                                    value={card.cvv}
                                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="netbanking" className="space-y-6"><Label>Select Bank</Label><Select value={selectedBank} onValueChange={setSelectedBank}><SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger><SelectContent><SelectItem value="sbi">SBI</SelectItem><SelectItem value="hdfc">HDFC</SelectItem></SelectContent></Select></TabsContent>
                </Tabs>
                <div ref={secureBadgeRef}></div><div ref={antiFraudRef}></div>
            </CardContent>
            <CardFooter><Button className="w-full h-12" onClick={processPayment} disabled={isProcessing}>{isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : `Pay ₹${paymentAmount.toLocaleString('en-IN')}`}</Button></CardFooter>
        </Card>
    );
});
