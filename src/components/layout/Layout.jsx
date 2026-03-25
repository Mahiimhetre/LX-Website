import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import PromoBanner from '../marketing/PromoBanner';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAuthPage = location.pathname.startsWith('/auth');

    useEffect(() => {
        const path = location.pathname;
        let title = 'LocatorX';

        if (path === '/') title = 'LocatorX | Home';
        else if (path.startsWith('/documentation')) title = 'LocatorX | Documentation';
        else if (path.startsWith('/playground')) title = 'LocatorX | Playground';
        else if (path.startsWith('/pricing')) title = 'LocatorX | Pricing';
        else if (path.startsWith('/support')) title = 'LocatorX | Support';
        else if (path.startsWith('/auth/login')) title = 'LocatorX | Login';
        else if (path.startsWith('/auth/register')) title = 'LocatorX | Create Account';
        else if (path.startsWith('/auth/forgot-password')) title = 'LocatorX | Reset Password';
        else if (path.startsWith('/auth/verify')) title = 'LocatorX | Verify Email';
        else if (path.startsWith('/dashboard')) title = 'LocatorX | Dashboard';
        else if (path.startsWith('/team')) title = 'LocatorX | Team';

        document.title = title;
    }, [location]);

    return (
        <div className="flex flex-col min-h-screen bg-background relative">
            <div className="sticky top-0 z-50 w-full flex flex-col">
                {/* <PromoBanner /> */}
                {!isAuthPage && <Header />}
            </div>

            {isAuthPage && (
                <div className="absolute top-6 left-6 z-50">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 hover:bg-black/40 hover:border-white/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            )}

            <main className="flex-1 w-full flex flex-col">
                {children}
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
};

export default Layout;
