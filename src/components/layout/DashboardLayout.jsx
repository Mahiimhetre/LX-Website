import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get page title from path (simple mapping)
    const location = useLocation();
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Overview';
        if (path.includes('/team')) return 'Team Management';
        if (path.includes('/settings')) return 'Settings';
        if (path.includes('/billing') || path.includes('/pricing')) return 'Billing';
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isMobile={false}
            />

            <Sidebar
                isCollapsed={false}
                isMobile={true}
                isOpen={isMobileMenuOpen}
                closeMobile={() => setIsMobileMenuOpen(false)}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Mobile Header */}
                <div className="md:hidden h-16 border-b border-white/5 flex items-center px-4 justify-between bg-card/50 backdrop-blur-xl sticky top-0 z-30">
                    <span className="font-semibold">{getPageTitle()}</span>
                    <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open mobile menu" className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-8 relative">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10 animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
