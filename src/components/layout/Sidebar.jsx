import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, CreditCard, LogOut, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Logo from '@/components/Logo';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: CreditCard, label: 'Billing', path: '/pricing' }, // Redirecting to pricing for now or billing if exists
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = ({ isCollapsed, toggleSidebar, isMobile, isOpen, closeMobile }) => {
    const location = useLocation();
    const { logout, user } = useAuth();



    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={cn("h-16 flex items-center border-b border-white/5", isCollapsed ? "justify-center" : "px-6 gap-3")}>
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                        <div className="relative w-8 h-8 rounded-full ring-1 ring-white/10">
                            <Logo />
                        </div>
                    </div>
                    {!isCollapsed && <span className="font-display font-bold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">LocatorX</span>}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={isMobile ? closeMobile : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-glow"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                            {!isCollapsed && (
                                <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                                    {item.label}
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/10">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-3 border-t border-white/5 space-y-1">
                <Link
                    to="/"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-white/5 hover:text-foreground group",
                    )}
                >
                    <Home className="w-5 h-5 group-hover:text-primary transition-colors" />
                    {!isCollapsed && <span className="font-medium text-sm">Back to Home</span>}
                </Link>
                <button
                    onClick={logout}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300 group",
                    )}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                </button>
            </div>

            {/* Collapse Toggle (Desktop only) */}
            {!isMobile && (
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 w-6 h-6 bg-card border border-white/10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-lg transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <>
                {isOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={closeMobile} />
                )}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-transform duration-300 md:hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <SidebarContent />
                </aside>
            </>
        );
    }

    return (
        <aside className={cn(
            "hidden md:flex flex-col sticky top-0 h-screen bg-card/50 backdrop-blur-xl border-r border-white/5 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <SidebarContent />
        </aside>
    );
};

export default Sidebar;
