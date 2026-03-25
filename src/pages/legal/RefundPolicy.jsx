import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground pt-20 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <h1 className="text-4xl font-display font-bold mb-8">Cancellation and Refund Policy</h1>

                <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                    <p>Last updated: January 2026</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">1. Cancellation Policy</h2>
                    <p>
                        You may cancel your subscription at any time. If you cancel your plan, you will continue to have access to the Pro or Team features until the end of your current billing cycle.
                        After that, your account will revert to the Free plan. We do not provide pro-rated refunds for unused time in the middle of a billing cycle.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">2. Money-Back Guarantee (Refunds)</h2>
                    <p>
                        We want you to be satisfied with Locator-X. If you are not completely satisfied with our Pro or Team service,
                        you can request a full refund within <strong>14 days</strong> of your initial purchase.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">3. How to Request a Refund</h2>
                    <p>
                        To request a refund, please email us at <a href="mailto:billing@locator-x.com" className="text-primary hover:underline">billing@locator-x.com</a> with your order details and a brief explanation of why you are unhappy with the service.
                        We use this feedback to improve our product.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">3. Processing Time</h2>
                    <p>
                        Refunds are processed within 5-7 business days of approval. The time it takes for the credit to appear on your statement depends on your card issuer.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">4. Promo Codes & Sales</h2>
                    <p>
                        Purchases made with "Limited Time Offer" or "Flash Sale" promo codes are still eligible for the 14-day money-back guarantee, typically refunded at the discounted price paid.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
