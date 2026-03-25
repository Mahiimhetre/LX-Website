import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-secondary/30 border-t border-border shadow-sm mt-auto backdrop-blur-md">
            <div className="flex flex-wrap gap-4 justify-between items-start px-4 py-3 max-w-full">

                {/* Brand Section - 'Pyramid' Structure */}
                <div className="flex flex-col items-center text-center min-w-[140px]">
                    <div className="relative group mb-2">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                        <div className="relative w-10 h-10 rounded-full ring-1 ring-white/10">
                            <Logo />
                        </div>
                    </div>
                    <h3
                        className="m-0 text-[1rem] font-bold tracking-wide font-display text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                        LocatorX
                    </h3>
                    <p className="m-0 text-muted-foreground text-[0.75rem] font-medium tracking-wide">Consistent locators. Consistent teams.</p>
                </div>

                {/* Resources & Legal Group */}
                <div className="flex flex-wrap gap-8 sm:gap-12">
                    {/* Quick Links Section */}
                    <div className="flex flex-col gap-1 items-start min-w-[100px]">
                        <h4 className="m-0 text-foreground text-[0.72rem] font-semibold uppercase tracking-wider opacity-90">Quick Links</h4>
                        <nav className="flex flex-col gap-0.5 list-none">
                            <FooterLink to="/">Home</FooterLink>
                            <FooterLink to="/documentation">Documentation</FooterLink>
                            <FooterLink to="/playground">Playground</FooterLink>
                            <FooterLink to="/pricing">Pricing</FooterLink>
                            <FooterLink to="/contact">Contact</FooterLink>
                            <FooterLink to="/about">About Us</FooterLink>
                        </nav>
                    </div>

                    {/* Legal Section */}
                    <div className="flex flex-col gap-1 items-start min-w-[100px]">
                        <h4 className="m-0 text-foreground text-[0.72rem] font-semibold uppercase tracking-wider opacity-90">Legal</h4>
                        <nav className="flex flex-col gap-0.5 list-none">
                            <FooterLink to="/legal/privacy">Privacy Policy</FooterLink>
                            <FooterLink to="/legal/terms">Terms of Service</FooterLink>
                            <FooterLink to="/legal/refund">Cancellation & Refund</FooterLink>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border px-4 py-2 flex justify-between items-center text-muted-foreground text-[0.65rem] bg-secondary/20">
                <p className="m-0">© @2026 Locator-X. All rights reserved.</p>
                <div className="flex gap-1.5">
                    <SocialLink href="#" icon={Twitter} />
                    <SocialLink href="#" icon={Github} />
                    <SocialLink href="#" icon={Linkedin} />
                </div>
            </div>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <Link
        to={to}
        className="text-muted-foreground text-[0.7rem] no-underline transition-all hover:text-primary hover:underline hover:scale-105 inline-block py-0.5"
    >
        {children}
    </Link>
);

const SocialLink = ({ href, icon: Icon }) => (
    <a
        href={href}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-background/50 text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary hover:scale-110 border border-transparent hover:border-primary/30"
    >
        <Icon size={12} />
    </a>
);

export default Footer;
