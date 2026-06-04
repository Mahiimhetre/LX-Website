
import { useState } from 'react';
import { MailIcon, MessageSquareIcon, SendIcon, UserIcon, AlertCircleIcon, CheckCircle2Icon, MapPinIcon, ClockIcon } from '@/components/icons';
import { toast } from 'sonner';
import use3DTilt from '@/hooks/use3DTilt';
import { Button } from '@/components/ui/button';

const Contact = () => {
    const contactInfoRef = use3DTilt({ max: 6, scale: 1.015, speed: 250 });
    const liveChatRef = use3DTilt({ max: 6, scale: 1.015, speed: 250 });
    const formContainerRef = use3DTilt({ max: 3, scale: 1.005, speed: 300 });

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
        <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="text-primary font-medium tracking-wider text-sm uppercase bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                    Get in Touch
                </span>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Contact Us
                </h1>
                <p className="text-muted-foreground text-lg">
                    Have a question or just want to say hi? We'd love to hear from you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">

                {/* Contact Info Column */}
                <div className="space-y-8">
                    <div 
                        ref={contactInfoRef}
                        className="bg-secondary/10 border border-white/5 rounded-2xl p-8 space-y-6 relative overflow-hidden group transform-gpu"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Spotlight Glare */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                            style={{
                                background: `radial-gradient(250px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.06), transparent 50%)`
                            }}
                        />
                        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                            <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <MapPinIcon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Our Office</h4>
                                        <p className="text-muted-foreground">123 Tech Park, Cyber City<br />Bangalore, India 560100</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <MailIcon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Email Us</h4>
                                        <p className="text-muted-foreground">support@locator-x.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <ClockIcon size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">Business Hours</h4>
                                        <p className="text-muted-foreground">Mon - Fri: 9:00 AM - 6:00 PM IST<br />Sat - Sun: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div 
                        ref={liveChatRef}
                        className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8 relative overflow-hidden group transform-gpu"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Spotlight Glare */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                            style={{
                                background: `radial-gradient(250px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(30, 144, 255, 0.08), transparent 50%)`
                            }}
                        />
                        <div className="relative z-10 space-y-4" style={{ transform: 'translateZ(20px)' }}>
                            <div className="flex items-center gap-3 mb-2 text-blue-400">
                                <MessageSquareIcon size={24} />
                                <h3 className="text-xl font-bold">Live Chat Support</h3>
                            </div>
                            <p className="text-muted-foreground mb-6">Need immediate assistance? Our support team is available during business hours.</p>
                            <Button className="px-6 py-2">
                                Start Chat
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Support Form Column */}
                <div className="w-full relative group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                    <div 
                        ref={formContainerRef}
                        className="relative bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden transform-gpu"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Spotlight Glare */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                            style={{
                                background: `radial-gradient(400px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.04), transparent 50%)`
                            }}
                        />
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10" style={{ transform: 'translateZ(10px)' }}>

                            {/* Name Input */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-primary" /> Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    className="w-full bg-secondary/30 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 text-foreground"
                                />
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <MailIcon className="w-4 h-4 text-primary" /> Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@company.com"
                                    className="w-full bg-secondary/30 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 text-foreground"
                                />
                            </div>

                            {/* Subject Input */}
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <AlertCircleIcon className="w-4 h-4 text-primary" /> Subject
                                </label>
                                <select
                                    name="subject"
                                    id="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-secondary/30 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-foreground"
                                >
                                    <option value="" disabled>Select a topic</option>
                                    <option value="general" className="bg-secondary">General Inquiry</option>
                                    <option value="sales" className="bg-secondary">Sales & Enterprise</option>
                                    <option value="support" className="bg-secondary">Technical Support</option>
                                    <option value="billing" className="bg-secondary">Billing Issue</option>
                                </select>
                            </div>

                            {/* Message Input */}
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <MessageSquareIcon className="w-4 h-4 text-primary" /> Message
                                </label>
                                <textarea
                                    name="message"
                                    id="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="How can we help?"
                                    className="w-full bg-secondary/30 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 text-foreground resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-3.5 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        Send Message
                                        <SendIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
