import { useState } from 'react';
import { MailIcon, MessageSquareIcon, SendIcon, UserIcon, AlertCircleIcon, MapPinIcon, ClockIcon } from '@/components/icons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Message sent! We'll get back to you shortly.");
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2 border border-primary/20">
                    Get in Touch
                </span>
                <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white">
                    Contact Us
                </h1>
                <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
                    Have a question or just want to say hi? We'd love to hear from you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full max-w-6xl">

                {/* Left Column: Contact Info Cards */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel rounded-3xl p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/10 group-hover:scale-105 transition-transform">
                                        <MapPinIcon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Our Office</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            123 Tech Park, Cyber City<br />Bangalore, India 560100
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/10 group-hover:scale-105 transition-transform">
                                        <MailIcon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Email Us</h4>
                                        <p className="text-xs text-muted-foreground mt-1">support@locator-x.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/10 group-hover:scale-105 transition-transform">
                                        <ClockIcon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Business Hours</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            Mon - Fri: 9:00 AM - 6:00 PM IST<br />Sat - Sun: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 hover:border-primary/20 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group transition-all">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3 mb-2 text-primary">
                                <MessageSquareIcon size={20} />
                                <h3 className="text-lg font-bold text-white">Live Chat Support</h3>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Need immediate assistance? Our support team is available during standard business hours.
                            </p>
                            <Button variant="default" size="sm" className="shadow-glow shadow-primary/25">
                                Start Chat
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Support Form Card */}
                <div className="lg:col-span-7 w-full relative group">
                    {/* Shadow Glow Underlay */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000" />

                    <div className="relative glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                            {/* Name Input */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-xs font-bold text-white/80 flex items-center gap-2">
                                    <UserIcon className="w-3.5 h-3.5 text-primary" /> Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none"
                                />
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-xs font-bold text-white/80 flex items-center gap-2">
                                    <MailIcon className="w-3.5 h-3.5 text-primary" /> Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@company.com"
                                    className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none"
                                />
                            </div>

                            {/* Subject Input */}
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-xs font-bold text-white/80 flex items-center gap-2">
                                    <AlertCircleIcon className="w-3.5 h-3.5 text-primary" /> Subject
                                </label>
                                <select
                                    name="subject"
                                    id="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none cursor-pointer appearance-none bg-neutral-950"
                                >
                                    <option value="" disabled className="bg-neutral-950 text-muted-foreground/60">Select a topic</option>
                                    <option value="general" className="bg-neutral-950 text-white">General Inquiry</option>
                                    <option value="sales" className="bg-neutral-950 text-white">Sales & Enterprise</option>
                                    <option value="support" className="bg-neutral-950 text-white">Technical Support</option>
                                    <option value="billing" className="bg-neutral-950 text-white">Billing Issue</option>
                                </select>
                            </div>

                            {/* Message Input */}
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-xs font-bold text-white/80 flex items-center gap-2">
                                    <MessageSquareIcon className="w-3.5 h-3.5 text-primary" /> Message
                                </label>
                                <textarea
                                    name="message"
                                    id="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="How can we help?"
                                    className="w-full glass-input rounded-2xl px-4 py-3 text-xs focus:outline-none resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full primary-glass-button font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed group text-xs text-white"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        Send Message
                                        <SendIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
