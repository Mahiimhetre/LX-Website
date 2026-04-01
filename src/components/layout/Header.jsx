import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown, CreditCard, HelpCircle, Settings, Users, Pencil, Camera, Key, Menu, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import apiClient from '@/api/client';
import { toast } from 'sonner';

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/documentation', label: 'Documentation' },
    { path: '/playground', label: 'Playground' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/contact', label: 'Contact' },
    { path: '/about', label: 'About' },
];

const Header = () => {
    // Theme toggle removed as per latest design
    const { user, logout, refreshProfile } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isProfileSubmenuOpen, setIsProfileSubmenuOpen] = useState(false);
    // isSearchOpen state removed as we switched to persistent search bar
    const [headerSearch, setHeaderSearch] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const fileInputRef = useRef(null);
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useOutsideClick(userMenuRef, () => {
        if (isUserMenuOpen) setIsUserMenuOpen(false);
    });

    useOutsideClick(mobileMenuRef, () => {
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

    const handleAvatarUpload = async (e) => {
        if (!e.target.files || !e.target.files[0] || !user) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const { data } = await apiClient.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (!data.success) throw new Error(data.message);

            await refreshProfile();
            setAvatarUrl(data.avatarUrl);
            toast.success('Avatar updated successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to upload avatar');
        }
    };

    const toggleProfileSubmenu = () => {
        setIsProfileSubmenuOpen(!isProfileSubmenuOpen);
        if (!isProfileSubmenuOpen) {
            setEditName(user?.user_metadata?.name || user?.email?.split('@')[0] || '');
        }
    };

    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />

            {/* Minimal Sticky Header */}
            <header className="w-full h-14 bg-background/60 backdrop-blur-xl border-b border-white/5 transition-all">
                <div className="h-full w-full px-6 flex items-center justify-between">
                    {/* Minimal Logo */}
                    {/* Brand Section */}
                    <Link to="/" className="grid grid-cols-[auto_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-0.5 group">
                        <div className="relative group row-span-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full ring-1 ring-white/10">
                                <Logo />
                            </div>
                        </div>
                        <span
                            className="text-2xl font-bold font-display tracking-tight leading-none text-transparent bg-clip-text col-start-2 w-fit bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                            LocatorX
                        </span>
                        <span className="hidden sm:flex text-[10px] md:text-[11px] text-muted-foreground font-medium tracking-wide opacity-80 leading-tight col-start-2">
                            Locator Generator & Manager
                        </span>
                    </Link>

                    {/* Compact Navigation */}
                    <nav className="hidden xl:flex items-center gap-1 xl:gap-2 mx-4">
                        {user && (
                            <Link
                                to="/dashboard"
                                className={cn(
                                    'text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300 relative group overflow-hidden',
                                    location.pathname === '/dashboard'
                                        ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/5'
                                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                )}
                            >
                                <span className="relative z-10">Dashboard</span>
                                {location.pathname === '/dashboard' && (
                                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                                )}
                            </Link>
                        )}
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    'text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300 relative group overflow-hidden',
                                    location.pathname === link.path
                                        ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/5'
                                        : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                )}
                            >
                                <span className="relative z-10">{link.label}</span>
                                {location.pathname === link.path && (
                                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Minimal Toolbar */}
                    <div className="flex items-center gap-3">
                        {/* Search - Expandable Capsule */}
                        <div className={cn(
                            "flex hover-expand bg-white/5 backdrop-blur-md border border-white/10 transition-all shadow-lg cursor-pointer",
                            "hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white/10 focus-within:border-primary/40",
                            headerSearch && "is-expanded"
                        )}>
                            <Search size={16} className="text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={headerSearch}
                                onChange={(e) => setHeaderSearch(e.target.value)}
                                className="hover-expand-text min-w-0 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 p-0"
                            />
                            {headerSearch && (
                                <button
                                    onClick={() => setHeaderSearch('')}
                                    aria-label="Clear search"
                                    className="p-1 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all shrink-0 ml-1 animate-in zoom-in duration-200"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        <div className="h-4 w-px bg-white/10 mx-1" />

                        {user ? (
                            <div className="relative z-50">
                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(!isUserMenuOpen);
                                        setIsProfileSubmenuOpen(false);
                                    }}
                                    aria-label="Toggle user menu"
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
                                                    {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Plan-Specific Banner Badge (Extension Style) */}
                                        {user.user_metadata?.plan && (
                                            <div className={cn(
                                                "absolute -top-1.5 -right-2 px-1.5 py-0.4 rounded-md text-[8px] font-black uppercase tracking-tighter shadow-xl border border-black/5 ring-1 ring-white/20 animate-in zoom-in slide-in-from-bottom-1 duration-500",
                                                "bg-primary text-white"
                                            )}>
                                                {user.user_metadata?.plan}
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div ref={userMenuRef} className="absolute right-0 mt-3 w-72 rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-white/5 bg-white/5 relative group/header">
                                            <div className="flex items-center gap-4">
                                                {/* Avatar Action Trigger */}
                                                <div className="relative group/avatar cursor-pointer">
                                                    <div
                                                        onClick={() => {
                                                            if (!avatarUrl) {
                                                                fileInputRef.current?.click();
                                                            }
                                                        }}
                                                        className="relative"
                                                    >
                                                        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10 group-hover/avatar:ring-primary/50 transition-all duration-300">
                                                            {avatarUrl ? (
                                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center text-primary font-bold">
                                                                    <Camera size={20} className="opacity-70" />
                                                                </div>
                                                            )}

                                                            {/* Glassmorphism Overlay on Hover */}
                                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all duration-300">
                                                                <Camera size={16} className="text-white/80" />
                                                            </div>
                                                        </div>

                                                        {/* Pencil Edit Button at Bottom-Right */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                fileInputRef.current?.click();
                                                            }}
                                                            aria-label="Change avatar"
                                                            className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#1a1a1a] hover:scale-110 transition-transform z-10"
                                                            title="Change Avatar"
                                                        >
                                                            <Pencil size={12} />
                                                        </button>

                                                        {/* Remove Button (Corner) */}
                                                        {avatarUrl && (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm('Remove profile picture?')) {
                                                                        try {
                                                                            const formData = new FormData();
                                                                            formData.append('remove', 'true');
                                                                            const { data } = await apiClient.post('/profile/avatar', formData);
                                                                            if (!data.success) throw new Error(data.message);

                                                                            await refreshProfile();
                                                                            setAvatarUrl(null);
                                                                            toast.success('Avatar removed');
                                                                        } catch (err) {
                                                                            toast.error('Failed to remove avatar');
                                                                        }
                                                                    }
                                                                }}
                                                                aria-label="Remove avatar"
                                                                className="absolute -top-1 -right-1 w-5 h-5 bg-black/50 backdrop-blur-md text-white/70 rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover/avatar:opacity-100 hover:bg-destructive hover:text-white transition-all duration-200"
                                                                title="Remove Avatar"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

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
                                                                aria-label="Save name"
                                                                className="p-1.5 bg-primary hover:bg-primary/90 rounded-full text-white flex-shrink-0 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                                                            >
                                                                <Pencil size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="group/name flex items-center gap-2">
                                                            <p className="text-sm font-bold text-foreground truncate">{user.user_metadata?.name || 'User Account'}</p>
                                                            <button
                                                                onClick={() => {
                                                                    setIsEditingName(true);
                                                                    setEditName(user.user_metadata?.name || '');
                                                                }}
                                                                aria-label="Edit name"
                                                                className="opacity-0 group-hover/name:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
                                                            >
                                                                <Pencil size={12} />
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
                                                    <Users size={14} className="group-hover:text-blue-400 transition-colors" />
                                                    <span>Team Management</span>
                                                </Link>
                                            )}

                                            <Link to="/billing" className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
                                                <CreditCard size={14} className="group-hover:text-purple-400 transition-colors" />
                                                <span>Billing & Usage</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-white/5 p-2 mt-1">
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10">
                                                <LogOut size={14} />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/auth/login" className="text-xs font-semibold bg-primary text-white px-4 py-1.5 rounded-full hover:bg-primary/90 transition-all shadow-sm">
                                Get Started
                            </Link>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                            className={cn(
                                "xl:hidden hover-expand border border-white/10 transition-all",
                                isMobileMenuOpen && "is-expanded"
                            )}
                        >
                            {isMobileMenuOpen ? <X size={18} className="shrink-0" /> : <Menu size={18} className="shrink-0" />}
                            <span className="hover-expand-text">Menu</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu (Dropdown) */}
                {isMobileMenuOpen && (
                    <div ref={mobileMenuRef} className="absolute top-full right-4 mt-2 w-64 rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden z-[1001] animate-in fade-in slide-in-from-top-2 duration-200">
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
                                    <Link
                                        to="/auth/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 bg-primary text-white text-sm py-1.5 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition-all"
                                    >
                                        Log In
                                    </Link>
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
