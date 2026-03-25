import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground pt-20 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <h1 className="text-4xl font-display font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                    <p>Last updated: January 2026</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">1. Introduction</h2>
                    <p>
                        Welcome to Locator-X. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">2. Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data:</strong> includes email address and billing details.</li>
                        <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                        <li><strong>Usage Data:</strong> includes information about how you use our website and services (e.g., locator generation stats).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-foreground mt-8">3. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To register you as a new customer.</li>
                        <li>To process and deliver your subscription order.</li>
                        <li>To manage our relationship with you.</li>
                        <li>To use data analytics to improve our website, products/services, marketing, customer relationships and experiences.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-foreground mt-8">4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                        We use Supabase for secure authentication and database management, ensuring industry-standard encryption.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">5. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:support@locator-x.com" className="text-primary hover:underline">support@locator-x.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
