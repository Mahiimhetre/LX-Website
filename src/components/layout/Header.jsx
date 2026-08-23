import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SearchIcon, UserIcon, LogOutIcon, ChevronDownIcon, CreditCardIcon, HelpCircleIcon, SettingsIcon, UsersIcon, PencilIcon, CameraIcon, KeyIcon, MenuIcon, XIcon } from '@/components/icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import NotificationBell from '@/components/NotificationBell';
import NotificationDropdown from '@/components/NotificationDropdown';
import HandleAvatar from '@/components/HandleAvatar';

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/documentation', label: 'Documentation' },
    { path: '/playground', label: 'Playground' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/contact', label: 'Contact' },
    { path: '/about', label: 'About' },
];

const HeaderSearch = ({ navigate }) => {
    const [headerSearch, setHeaderSearch] = useState('');

    const handleSearch = () => {
        if (!headerSearch.trim()) return;
        navigate(`/documentation?search=${encodeURIComponent(headerSearch.trim())}`);
        setHeaderSearch('');
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 transition-all shadow-lg hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white/10 focus-within:border-primary/40 max-w-[150px] sm:max-w-[200px]">
            <SearchIcon size={16} className="text-muted-foreground shrink-0" />
            <input
                type="text"
                placeholder="Search..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 p-0"
            />
            {headerSearch && (
                <button
                    onClick={() => setHeaderSearch('')}
                    aria-label="Clear Search"
                    className="p-1 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all shrink-0 ml-1 animate-in zoom-in duration-200"
                >
                    <XIcon size={12} />
                </button>
            )}
        </div>
    );
};

const Header = () => {
    // Theme toggle removed as per latest design
    const { user, profile, logout, refreshProfile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isProfileSubmenuOpen, setIsProfileSubmenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationsToggleRef = useRef(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const userMenuToggleRef = useRef(null);
    const mobileMenuToggleRef = useRef(null);

    useOutsideClick(userMenuRef, (e) => {
        if (userMenuToggleRef.current && userMenuToggleRef.current.contains(e.target)) {
            return;
        }
        if (isUserMenuOpen) setIsUserMenuOpen(false);
    });

    useOutsideClick(mobileMenuRef, (e) => {
        if (mobileMenuToggleRef.current && mobileMenuToggleRef.current.contains(e.target)) {
            return;
        }
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    });

    const [isTeamAdmin, setIsTeamAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;
        const checkTeamAdmin = async () => {
            if (!user) {
                if (mounted) setIsTeamAdmin(false);
                return;
            }

            try {
                const { data } = await apiClient.get('/teams');
                if (data.success && data.teams && data.teams.length > 0) {
                    // Check if owner or admin
                    const isGod = data.teams.some(t => t.ownerId === user.id || t.role === 'admin');
                    if (mounted) setIsTeamAdmin(isGod);
                } else {
                    if (mounted) setIsTeamAdmin(false);
                }
            } catch (error) {
                console.error('Error checking team admin status:', error);
                if (mounted) setIsTeamAdmin(false);
            }
        };

        checkTeamAdmin();

        return () => { mounted = false; };
    }, [user]);



    useEffect(() => {
        if (user) {
            apiClient.get('/profile')
                .then(({ data }) => {
                    if (data?.success && data.profile?.avatarUrl) {
                        setAvatarUrl(data.profile.avatarUrl);
                    }
                })
                .catch(() => { });
        } else {
            setAvatarUrl(null);
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const handleSaveName = async () => {
        if (!user || !editName.trim()) return;
        setIsSavingName(true);
        try {
            const { data } = await apiClient.put('/profile', { name: editName.trim() });
            if (!data.success) throw new Error(data.message);

            toast.success('Name updated successfully!');
            await refreshProfile();
            setIsEditingName(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update name');
        }
        setIsSavingName(false);
    };





    const toggleProfileSubmenu = () => {
        setIsProfileSubmenuOpen(!isProfileSubmenuOpen);
        if (!isProfileSubmenuOpen) {
            setEditName(profile?.name || user?.email?.split('@')[0] || '');
        }
    };

    return (
        <>
            {/* Floating Glass Capsule Header */}
            <header className={`fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl h-14 bg-black/45 backdrop-blur-3xl saturate-[210%] border border-white/10 rounded-full transition-all shadow-[0_12px_40px_rgba(0,0,0,0.5),_inset_0_1px_0_0_rgba(255,255,255,0.12)] z-[100] ${!sessionStorage.getItem('header-animated') ? (sessionStorage.setItem('header-animated', '1'), 'animate-header-drop') : ''}`}>
                <div className="h-full w-full px-6 flex items-center justify-between">
                    {/* Minimal Logo */}
                    {/* Brand Section */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
                            <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full ring-1 ring-white/15">
                                <Logo />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span
                                className="text-xl md:text-2xl font-bold font-display tracking-tight leading-none text-transparent bg-clip-text w-fit bg-gradient-to-r from-blue-400 to-purple-400 group-hover:brightness-110 transition-all"
                            >
                                LocatorX
                            </span>
                            <span className="hidden sm:block text-[9px] md:text-[10px] text-muted-foreground font-medium tracking-wider opacity-70 leading-none mt-1">
                                Locator Generator &amp; Manager
                            </span>
                        </div>
                    </Link>

                    {/* Compact Navigation */}
                    <nav className="hidden xl:flex items-center gap-6 mx-4">
                        {user && (
                            <Link
                                to="/dashboard"
                                className={cn(
                                    'text-sm font-medium py-1 relative premium-nav-link transition-colors duration-300',
                                    location.pathname === '/dashboard'
                                        ? 'text-white active'
                                        : 'text-muted-foreground hover:text-white'
                                )}
                            >
                                <span className="relative z-10">Dashboard</span>
                            </Link>
                        )}
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    'text-sm font-medium py-1 relative premium-nav-link transition-colors duration-300',
                                    location.pathname === link.path
                                        ? 'text-white active'
                                        : 'text-muted-foreground hover:text-white'
                                )}
                            >
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Minimal Toolbar */}
                    <div className="flex items-center gap-3">
                        {/* Search - Persistent Capsule */}
                        <HeaderSearch navigate={navigate} />

                        <div className="h-4 w-px bg-white/10 mx-1" />

                        {user && (
                            <>
                                <div className="relative">
                                    <div ref={notificationsToggleRef}>
                                        <NotificationBell onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} />
                                    </div>
                                    <NotificationDropdown
                                        isOpen={isNotificationsOpen}
                                        onClose={() => setIsNotificationsOpen(false)}
                                        toggleRef={notificationsToggleRef}
                                    />
                                </div>
                                <div className="h-4 w-px bg-white/10 mx-1" />
                            </>
                        )}

                        {user ? (
                            <div className="relative z-50">
                                <button
                                    ref={userMenuToggleRef}
                                    onClick={() => {
                                        setIsUserMenuOpen(!isUserMenuOpen);
                                        setIsProfileSubmenuOpen(false);
                                    }}
                                    aria-label="User Menu"
                                    className={cn(
                                        "relative flex items-center justify-center transition-all duration-300 group/avatar outline-none focus:outline-none focus-visible:ring-0 active:scale-95",
                                        isUserMenuOpen && "scale-105"
                                    )}
                                >
                                    <div className="relative">
                                        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10 group-hover/avatar:ring-primary/50 transition-all duration-300">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-black">
                                                    {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Plan-Specific Banner Badge (Extension Style) */}
                                        {(() => {
                                            if (!profile?.plan) return null;

                                            const rawDate = user.created_at || user.createdAt;
                                            const createdAt = rawDate ? new Date(rawDate) : new Date();
                                            const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
                                            const isTrialActive = new Date() < trialEnd;

                                            return (
                                                <div className={cn(
                                                    "absolute -top-1.5 -right-2 px-1.5 py-0.4 rounded-md text-[8px] font-black uppercase tracking-tighter shadow-xl border border-black/5 ring-1 ring-white/20 animate-in zoom-in slide-in-from-bottom-1 duration-500",
                                                    isTrialActive ? "bg-amber-500 text-black" : "bg-primary text-white"
                                                )}>
                                                    {isTrialActive ? "Trial" : profile.plan}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div ref={userMenuRef} className="absolute right-0 mt-3 w-72 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-white/5 bg-white/5 relative group/header">
                                            <div className="flex items-center gap-4">
                                                {/* Reusable Avatar Action Trigger */}
                                                <HandleAvatar
                                                    userId={user.id}
                                                    currentAvatarUrl={avatarUrl}
                                                    onUploadComplete={async (url) => {
                                                        await refreshProfile();
                                                        setAvatarUrl(url);
                                                    }}
                                                    size="header"
                                                />

                                                <div className="flex-1 min-w-0">
                                                    {isEditingName ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                value={editName}
                                                                onChange={e => setEditName(e.target.value)}
                                                                className="w-full bg-black/40 text-sm px-3 py-1.5 rounded-full border border-white/10 focus:border-primary/50 outline-none text-white font-semibold shadow-inner"
                                                                autoFocus
                                                                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                                                onBlur={handleSaveName}
                                                            />
                                                            <button
                                                                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                                                onClick={handleSaveName}
                                                                aria-label="Save Name"
                                                                className="p-1.5 bg-primary hover:bg-primary/90 rounded-full text-white flex-shrink-0 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                                            >
                                                                <PencilIcon size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="group/name flex items-center gap-2">
                                                            <p className="text-sm font-bold text-foreground truncate">{profile?.name || user?.email?.split('@')[0] || 'User Account'}</p>
                                                            <button
                                                                onClick={() => {
                                                                    setIsEditingName(true);
                                                                    setEditName(profile?.name || '');
                                                                }}
                                                                aria-label="Edit Name"
                                                                className="opacity-0 group-hover/name:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
                                                            >
                                                                <PencilIcon size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground truncate font-medium mt-0.5 ml-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-2 space-y-1">

                                            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
                                                <div className="w-3.5 h-3.5 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full group-hover:bg-green-400" /></div>
                                                <span>Dashboard</span>
                                            </Link>

                                            {isTeamAdmin && (
                                                <Link to="/team" className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
                                                    <UsersIcon size={14} className="group-hover:text-blue-400 transition-colors" />
                                                    <span>Team Management</span>
                                                </Link>
                                            )}

                                            <Link to="/pricing" className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
                                                <CreditCardIcon size={14} className="group-hover:text-purple-400 transition-colors" />
                                                <span>Billing & Usage</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-white/5 p-2 mt-1">
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10">
                                                <LogOutIcon size={14} />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/auth/login">
                                <Button size="sm" className="shadow-sm">
                                    Get Started
                                </Button>
                            </Link>
                        )}

                        <Button
                            ref={mobileMenuToggleRef}
                            variant="secondary"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Mobile Menu"
                            className="xl:hidden h-8 w-8 !p-0 rounded-full"
                        >
                            {isMobileMenuOpen ? <XIcon size={16} /> : <MenuIcon size={16} />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu (Dropdown) */}
                {isMobileMenuOpen && (
                    <div ref={mobileMenuRef} className="absolute top-full right-4 mt-2 w-64 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[1001] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 space-y-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                        location.pathname === link.path
                                            ? "bg-white/10 text-white"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {user && (
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                        location.pathname === '/dashboard'
                                            ? "bg-white/10 text-white"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    Dashboard
                                </Link>
                            )}
                            {!user && (
                                <div className="pt-2 border-t border-white/5 mt-1">
                                    <Button asChild size="sm" className="w-full">
                                        <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            Log In
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

        </>
    );
};

export default Header;
