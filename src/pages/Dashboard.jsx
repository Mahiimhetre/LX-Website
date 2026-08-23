import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/client";
import { 
    PlusIcon, CodeIcon, ActivityIcon, ArrowRightIcon, ClockIcon, ShieldIcon, 
    SettingsIcon, ZapIcon, UsersIcon, Trash2Icon, ExternalLinkIcon 
} from '@/components/icons';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import Countdown from "@/components/ui/Countdown";

const Dashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [trialDaysLeft, setTrialDaysLeft] = useState(0);
    const [uniqueOffer, setUniqueOffer] = useState(null);

    const [locators, setLocators] = useState([]);
    const [loadingLocators, setLoadingLocators] = useState(true);

    const firstName = profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || "User";
    const currentHour = new Date().getHours();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                navigate("/auth/login");
            } else if (profile && !profile.isVerified) {
                // Redirect to verification page if not verified
                navigate(`/auth/verify?email=${encodeURIComponent(user.email)}`);
            }
        }
    }, [user, profile, isLoading, navigate]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!user) return;
                const { data } = await apiClient.get('/profile');
                if (data.success && data.profile) {
                    setProfile(data.profile);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoadingProfile(false);
            }
        };
        if (user) fetchProfile();
        else setLoadingProfile(false);
    }, [user]);

    const fetchLocators = async () => {
        if (!user) return;
        setLoadingLocators(true);
        try {
            const { data } = await apiClient.get('/locators');
            setLocators(data.locators || []);
        } catch (error) {
            console.error("Error fetching locators:", error);
            setLocators([]);
        } finally {
            setLoadingLocators(false);
        }
    };

    useEffect(() => {
        if (user) fetchLocators();
    }, [user]);

    const handleDeleteLocator = async (id) => {
        if (!confirm("Are you sure you want to delete this locator?")) return;

        try {
            await apiClient.delete(`/locators/${id}`);
            toast.success("Locator deleted");
            setLocators(locators.filter(l => l.id !== id));
        } catch (error) {
            toast.error("Failed to delete locator");
        }
    };

    // Trial Calculation & Offer Generation
    useEffect(() => {
        const checkTrialAndOffer = async () => {
            try {
                if (!user || isLoading) return;

                // 1. Calculate Trial Status
                const rawDate = user.created_at || user.createdAt;
                const createdAt = rawDate ? new Date(rawDate) : new Date();
                
                if (isNaN(createdAt.getTime())) {
                    console.error("Invalid user creation date", rawDate);
                    return;
                }

                const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
                const now = new Date();
                const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
                setTrialDaysLeft(daysLeft);

                // 2. If Trial Expired, Generate/Fetch Offer
                if (daysLeft <= 0) {
                    try {
                        const { data } = await apiClient.post('/promo/generate-trial-offer');
                        if (data && data.success && data.promo) {
                            setUniqueOffer(data.promo);
                        }
                    } catch (err) {
                        console.warn("Promo generation skipped or error:", err);
                    }
                }
            } catch (error) {
                console.error("Error checking trial/offer:", error);
                // Don't toast here to avoid spamming the user on every dashboard load if something minor fails
            }
        };
        checkTrialAndOffer();
    }, [user, isLoading]);

    const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-6 flex flex-col gap-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl glass-dark p-6 md:p-8 transform-gpu">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[150px] rounded-full mix-blend-screen opacity-20 pointer-events-none -mt-20 -mr-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                            Personal Workspace
                        </span>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                            {greeting}, {firstName}
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Ready to generate some locators today? Your generated locators are listed below for easy access.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                        <Link
                            to="/playground"
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all transform hover:-translate-y-0.5"
                        >
                            <PlusIcon size={18} />
                            New Locator
                        </Link>

                        <Link
                            to="/documentation"
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-secondary/30 text-white font-medium hover:bg-secondary/50 border border-white/10 transition-all hover:border-white/20"
                        >
                            <ClockIcon size={18} />
                            Documentation
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={ShieldIcon}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                    value={trialDaysLeft > 0 ? "Premium Trial" : (profile?.plan ? (profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) + ' Plan') : "Free Plan")}
                    label="Current Tier"
                    subtext={trialDaysLeft > 0 ? `${trialDaysLeft} days left` : "Upgrade for unlimited"}
                    glow="hover:shadow-glow-cyan"
                />
                <StatCard
                    icon={ZapIcon}
                    color="text-yellow-400"
                    bg="bg-yellow-500/10"
                    value={locators.length.toString()}
                    label="Total Locators"
                    subtext="Saved in your vault"
                    glow="hover:shadow-glow-purple"
                />
                <StatCard
                    icon={CodeIcon}
                    color="text-purple-400"
                    bg="bg-purple-500/10"
                    value="0"
                    label="Active Sessions"
                    subtext="Extension connections"
                    glow="hover:shadow-glow"
                />
                <StatCard
                    icon={ActivityIcon}
                    color="text-green-400"
                    bg="bg-green-500/10"
                    value="100%"
                    label="System Status"
                    subtext="Operational"
                    glow="hover:shadow-glow-cyan"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects (Placeholder) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CodeIcon className="w-5 h-5 text-primary" />
                            Your Locators
                        </h2>
                        {locators.length > 0 && (
                            <Link
                                to="/playground"
                                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                            >
                                <PlusIcon size={14} /> Add New
                            </Link>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {loadingLocators ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="h-[74px] rounded-2xl border border-white/5 bg-white/2 shimmer-skeleton" />
                                ))}
                            </div>
                        ) : locators.length > 0 ? (
                            locators.map((locator) => (
                                <LocatorCard
                                    key={locator.id}
                                    locator={locator}
                                    onDelete={() => handleDeleteLocator(locator.id)}
                                />
                            ))
                        ) : (
                            <Link to="/playground" className="rounded-2xl border border-dashed border-white/8 bg-white/2 p-12 text-center flex flex-col items-center justify-center text-muted-foreground group hover:border-white/20 hover:bg-white/4 transition-all cursor-pointer">
                                <div className="w-16 h-16 rounded-full bg-white/3 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <CodeIcon className="w-8 h-8 opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-1">No locators yet</h3>
                                <p className="text-sm max-w-xs mx-auto">Visit the Playground or use the Extension to start saving locators.</p>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Sidebar / Quick Links */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-primary" />
                        Quick Actions
                    </h2>

                    <div className="rounded-2xl glass-dark overflow-hidden divide-y divide-white/8">
                        <ActionLink to="/team" icon={UsersIcon} title="Manage Team" desc="Invite members & roles" />
                        <ActionLink to="/settings" icon={SettingsIcon} title="Settings" desc="Profile & preferences" />
                        <ActionLink to="/pricing" icon={ShieldIcon} title="Billing" desc="Manage subscription" />
                    </div>

                    {/* Dynamic Offer Card */}
                    {trialDaysLeft > 0 ? (
                        <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-6 border border-green-500/30">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <ShieldIcon className="w-5 h-5 text-green-400" /> Premium Trial Active
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                You have <strong>{trialDaysLeft} days</strong> left of full access. Enjoy!
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 p-6 border border-white/10">
                            <h3 className="font-bold text-white mb-2">Did you know?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                You can export your locators directly to Selenium/Playwright format.
                            </p>
                            <Link to="/pricing" className="text-xs font-bold text-primary hover:underline">
                                Upgrade Plan &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

const LocatorCard = ({ locator, onDelete }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl glass-panel group shadow-sm hover:translate-y-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <CodeIcon size={20} />
            </div>
            <div className="truncate">
                <h4 className="font-semibold text-white group-hover:text-primary transition-colors truncate">{locator.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-mono group-hover:bg-white/10 transition-colors uppercase">{locator.type}</span>
                    <span className="opacity-40">•</span>
                    <span className="truncate">{locator.pageUrl || 'No URL'}</span>
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Button
                variant="ghost"
                size="icon"
                aria-label="Delete locator"
                className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                <Trash2Icon size={14} />
            </Button>
            <Link to="/playground">
                <Button variant="ghost" size="icon" aria-label="Open in Playground" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <ExternalLinkIcon size={14} />
                </Button>
            </Link>
        </div>
    </div>
);

const StatCard = ({ icon: Icon, color, bg, value, label, subtext, glow }) => {
    return (
        <div 
            className={`p-5 rounded-3xl glass-panel group transform-gpu transition-all duration-300 hover:-translate-y-1 ${glow || ''}`}
        >
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                        <Icon size={20} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-display font-bold text-white mb-1 group-hover:scale-105 origin-left transition-transform">{value}</h3>
                    <p className="text-sm font-medium text-white/80">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
                </div>
            </div>
        </div>
    );
};

const ActionLink = ({ to, icon: Icon, title, desc }) => (
    <Link to={to} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
        <div className="p-2 rounded-xl bg-white/5 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-medium text-white group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <ArrowRightIcon size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
    </Link>
);

export default Dashboard;
