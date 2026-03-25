
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import RazorpayButton from "./RazorpayButton";
import PromoCodeInput from "./PromoCodeInput";
import { useState, useEffect } from "react";
import { Check, Clock, CheckCircle2, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { generateReceipt } from "@/services/receiptService";

const PaymentModal = ({ isOpen, onClose, planName, amount, currency, user, onSuccess, features }) => {
    const [discount, setDiscount] = useState(null);
    const [finalAmount, setFinalAmount] = useState(amount);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);

    // Timer logic
    useEffect(() => {
        if (!isOpen || isSuccess) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, isSuccess]);

    useEffect(() => {
        if (amount) {
            if (discount) {
                let newAmount = amount;
                if (discount.type === 'percent') {
                    newAmount = amount - (amount * discount.value / 100);
                } else if (discount.type === 'flat') {
                    newAmount = amount - discount.value;
                }
                setFinalAmount(Math.max(0, newAmount));
            } else {
                setFinalAmount(amount);
            }
        }
    }, [amount, discount]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleApplyPromo = (d, code) => {
        setDiscount({ ...d, code });
    };

    const handleRemovePromo = () => {
        setDiscount(null);
    };

    const handlePaymentSuccess = (response) => {
        setPaymentDetails(response);
        setIsSuccess(true);
        if (onSuccess) {
            onSuccess({ ...response, discountCode: discount?.code });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Payment ID copied!");
    };

    const handleDownloadReceipt = () => {
        if (!paymentDetails) return;

        generateReceipt({
            paymentId: paymentDetails.razorpay_payment_id,
            orderId: paymentDetails.razorpay_order_id,
            amount: finalAmount,
            currency: currency,
            planName: planName,
            userName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
            userEmail: user?.email,
            date: new Date().toLocaleDateString()
        });

        toast.success("Receipt downloaded!");
    };

    if (isSuccess) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-white/10 text-white text-center py-10">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold">Payment Successful!</DialogTitle>
                            <p className="text-slate-400">Your subscription has been extended successfully.</p>
                        </div>

                        <div className="w-full bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Payment ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs">{paymentDetails?.razorpay_payment_id || 'PAY-N/A'}</span>
                                    <button onClick={() => copyToClipboard(paymentDetails?.razorpay_payment_id)} className="p-1 hover:bg-white/10 rounded transition-colors">
                                        <Copy className="w-3 h-3 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Amount Paid</span>
                                <span className="font-semibold">{currency === 'INR' ? '₹' : '$'}{finalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={handleDownloadReceipt}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                <Download className="w-4 h-4" /> Download Receipt
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all"
                            >
                                Back to Pricing
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-white/10 text-white">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <DialogTitle className="text-xl">Confirm Purchase</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Upgrade to <span className="text-white font-semibold">{planName}</span>
                        </DialogDescription>
                    </div>
                    {timeLeft > 0 && (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </DialogHeader>

                {timeLeft === 0 ? (
                    <div className="py-10 text-center space-y-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Clock className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold">Payment Session Expired</h3>
                            <p className="text-sm text-slate-400">For your security, this payment session has timed out. Please refresh and try again.</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                        >
                            Refresh Page
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="py-4">
                            <div className="mb-6 space-y-2">
                                <h4 className="text-sm font-medium text-slate-300">Plan and Benefits</h4>
                                <ul className="text-sm text-slate-400 space-y-1">
                                    {features?.slice(0, 3).map((f, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className="w-3 h-3 text-green-500" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Separator className="bg-white/10 mb-4" />

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span>{currency === 'INR' ? '₹' : '$'}{amount.toLocaleString()}</span>
                                </div>

                                {discount && (
                                    <div className="flex justify-between text-sm text-green-500">
                                        <span>Discount ({discount.code})</span>
                                        <span>- {currency === 'INR' ? '₹' : '$'}{(amount - finalAmount).toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                                    <span>Total</span>
                                    <span>{currency === 'INR' ? '₹' : '$'}{finalAmount.toLocaleString()}</span>
                                </div>

                                <div className="py-2">
                                    <PromoCodeInput onApply={handleApplyPromo} onRemove={handleRemovePromo} planName={planName} />
                                </div>
                            </div>
                        </div>

                        <RazorpayButton
                            amount={finalAmount}
                            currency={currency}
                            planName={planName}
                            user={user}
                            onSuccess={handlePaymentSuccess}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                        >
                            Pay {currency === 'INR' ? '₹' : '$'}{finalAmount.toLocaleString()}
                        </RazorpayButton>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
