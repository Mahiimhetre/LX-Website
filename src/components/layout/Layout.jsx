import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from '@/components/icons';
import Header from './Header';
import Footer from './Footer';
import PromoBanner from '../marketing/PromoBanner';
import NotificationModal from '@/components/notifications/NotificationModal';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAuthPage = location.pathname.startsWith('/auth');

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
    }, [location.pathname]);

    useEffect(() => {
        const handleGlobalClick = (e) => {
            const wave = document.createElement('div');
            wave.className = 'click-wave-feedback';
            wave.style.left = `${e.clientX}px`;
            wave.style.top = `${e.clientY}px`;
            document.body.appendChild(wave);

            setTimeout(() => {
                if (wave.parentNode) {
                    wave.remove();
                }
            }, 400);
        };

        window.addEventListener('click', handleGlobalClick);
        return () => {
            window.removeEventListener('click', handleGlobalClick);
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Siri/iOS-style animated background blur mesh */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] md:w-[35vw] md:h-[35vw] bg-indigo-600/12 rounded-full blur-[100px] md:blur-[140px] animate-ios-drift-1" />
                <div className="absolute top-[35%] right-[5%] w-[45vw] h-[45vw] md:w-[40vw] md:h-[40vw] bg-purple-600/10 rounded-full blur-[110px] md:blur-[150px] animate-ios-drift-2" />
                <div className="absolute bottom-[5%] left-[10%] w-[40vw] h-[40vw] md:w-[35vw] md:h-[35vw] bg-cyan-600/10 rounded-full blur-[90px] md:blur-[130px] animate-ios-drift-3" />
                <div className="absolute top-[70%] left-[45%] -translate-x-1/2 w-[55vw] h-[35vw] bg-pink-600/6 rounded-full blur-[120px] md:blur-[160px]" />
            </div>

            <div className="sticky top-0 z-50 w-full flex flex-col relative">
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

            <main className={`flex-1 w-full flex flex-col relative z-10 ${!isAuthPage ? 'pt-20' : ''}`}>
                <div key={location.pathname} className="flex-1 flex flex-col route-entrance">
                    {children}
                </div>
            </main>
            {!isAuthPage && <Footer className="relative z-10" />}
            <NotificationModal />
        </div>
    );
};

export default Layout;
