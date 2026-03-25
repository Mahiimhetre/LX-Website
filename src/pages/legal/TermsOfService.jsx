import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background text-foreground pt-20 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <h1 className="text-4xl font-display font-bold mb-8">Terms of Service</h1>

                <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                    <p>Last updated: January 2026</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using this website and the Locator-X extension, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">2. Description of Service</h2>
                    <p>
                        Locator-X provides a browser extension and web platform for generating, managing, and exporting XPath and CSS locators for test automation.
                        We offer Free, Pro, and Team plans with varying feature sets.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">3. User Accounts</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">4. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of Locator-X and its licensors.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">5. Termination</h2>
                    <p>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">6. Limitation of Liability</h2>
                    <p>
                        In no event shall Locator-X, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
