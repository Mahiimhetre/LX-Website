import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { logoUrl } from '@/components/Logo';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const RazorpayButton = ({ amount, currency, planName, user, onSuccess, className, children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        if (!user) {
            toast.error('Please login to continue');
            return;
        }

        setIsLoading(true);

        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                throw new Error('Razorpay SDK failed to load');
            }

            // 1. Create Order via Backend API
            const { data } = await apiClient.post('/payment/create-order', {
                amount,
                currency,
                planName
            });

            if (!data.success) throw new Error(data.message);
            const order = data.order;

            // 2. Open Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your local .env
                amount: order.amount,
                currency: order.currency,
                name: "Locator-X",
                description: `Upgrade to ${planName}`,
                image: logoUrl, // Dynamic Logo
                order_id: order.id,
                handler: async function (response) {
                    // 3. Payment Success
                    // Here you would typically verify the signature on backend
                    // For now, we trust the frontend success to trigger the callback

                    // console.log("Payment Successful", response);
                    await onSuccess({
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        signature: response.razorpay_signature
                    });
                },
                prefill: {
                    name: user.user_metadata?.name || '',
                    email: user.email,
                },
                theme: {
                    color: "#0F172A", // Slate-900 or your primary color
                },
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment Error:', error);
            toast.error(error.message || 'Something went wrong with payment initialization');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                children || 'Pay Now'
            )}
        </Button>
    );
};

export default RazorpayButton;
