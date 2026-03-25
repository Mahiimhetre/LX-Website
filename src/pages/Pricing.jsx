import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { Users, Check, Zap, Shield, Crown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentModal from '@/components/payment/PaymentModal';
import PromoBanner from '@/components/marketing/PromoBanner';

const BASE_PRICES = {
    USD: { free: 0, pro: 29, teamBase: 79, perMember: 15 },
    INR: { free: 0, pro: 299, teamBase: 1999, perMember: 199 },
};

const CURRENCY_SYMBOLS = { USD: '$', INR: '₹' };

const Pricing = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [currency, setCurrency] = useState('INR'); // Default to INR
    const [teamMemberCount, setTeamMemberCount] = useState(5);
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

    const prices = BASE_PRICES[currency];
    const symbol = CURRENCY_SYMBOLS[currency];

    const calculateTeamPrice = (members) => {
        const additionalMembers = Math.max(0, members - 1);
        return prices.teamBase + additionalMembers * prices.perMember;
    };

    const teamTotalPrice = calculateTeamPrice(teamMemberCount);

    const handleInitiatePurchase = (plan) => {
        if (!user) {
            toast.error("Please login to purchase.");
            navigate('/auth/login');
            return;
        }

        let amount_ = 0;
        if (plan.isTeam) {
            if (teamMemberCount < 2) {
                toast.error("Team plan requires at least 2 members.");
                return;
            }
            amount_ = teamTotalPrice;
        } else if (plan.name === 'Pro') {
            // Apply 50% Flash Sale discount
            amount_ = Math.floor(prices.pro * 0.5);
        } else {
            // Free
            plan.action();
            return;
        }

        setSelectedPlanDetails({
            ...plan,
            finalAmount: amount_
        });
        setShowPaymentModal(true);
    };


    const handlePaymentSuccess = async (paymentDetails) => {
        setIsCreatingTeam(true); // Reuse loading state logic
        setShowPaymentModal(false);

        try {
            // For Team Plan
            if (selectedPlanDetails?.isTeam) {
                const { data } = await apiClient.post('/teams', {
                    name: `${profile?.name || user.email?.split('@')[0]}'s Team`,
                    memberCount: teamMemberCount,
                    currency,
                    totalPaid: selectedPlanDetails.finalAmount,
                    paymentId: paymentDetails.paymentId,
                    discountCode: paymentDetails.discountCode
                });

                if (!data.success) throw new Error(data.message);

                await refreshProfile(); // Sync local session
                toast.success(`Team created successfully! Payment ID: ${paymentDetails.paymentId}`);
                navigate('/team');
            }
            // For Pro Plan
            else {
                const { data } = await apiClient.post('/profile/upgrade-plan', {
                    plan: 'pro',
                    paymentId: paymentDetails.paymentId,
                    discountCode: paymentDetails.discountCode
                });

                if (!data.success) throw new Error(data.message);

                await refreshProfile(); 
                toast.success("Pro Plan activated successfully! Welcome to Pro.");
                setTimeout(() => navigate('/dashboard'), 1500);
            }

        } catch (error) {
            console.error('Error post-payment:', error);
            toast.error(error.message || "Payment successful but failed to update account. Please contact support.");
        } finally {
            setIsCreatingTeam(false); // Reuse loading state logic
        }
    };

    const getExpiryString = () => {
        if (!profile?.billing_expiry_date) return null;
        const date = new Date(profile.billing_expiry_date);
        if (date < new Date()) return null;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const expiryDate = getExpiryString();

    const pricingPlans = [
        {
            name: 'Free',
            price: `${symbol}${prices.free}`,
            period: '/mo',
            description: 'Perfect for individual testers',
            features: ['1 workspace', '1 user', 'Basic locator generation', 'Community support'],
            cta: profile?.plan === 'free' ? 'Current Plan' : 'Get Started',
            highlight: false,
            icon: Zap,
            action: () => navigate('/auth/register'),
        },
        {
            name: 'Pro',
            price: `${symbol}${prices.pro}`,
            period: '/mo',
            description: profile?.plan === 'pro'
                ? (expiryDate ? `Active until ${expiryDate}` : 'Currently Active')
                : 'For power users needing more',
            features: ['Unlimited workspaces', '5 collaborator seats', 'Priority email support', 'Advanced AI Models', 'Dark mode syncing'],
            cta: profile?.plan === 'pro' ? 'Extend Pro Plan' : 'Upgrade to Pro',
            highlight: true,
            icon: Shield,
            action: () => handleInitiatePurchase({ name: 'Pro', features: ['Unlimited workspaces', '5 collaborator seats', 'Priority email support'] }),
        },
        {
            name: 'Team',
            price: null,
            period: '/mo',
            description: profile?.plan === 'team'
                ? (expiryDate ? `Active until ${expiryDate}` : 'Currently Active')
                : 'Scale with your team',
            features: ['Everything in Pro', 'Custom member count', 'Priority Slack support', 'Role-based permissions', 'Team management dashboard'],
            cta: profile?.plan === 'team' ? 'Extend Team Plan' : 'Start Team Plan',
            highlight: false,
            isTeam: true,
            icon: Crown,
        },
    ];

    const faqs = [
        { q: 'Can I trial Locator-X before choosing a plan?', a: 'Yes. Every account starts with a 14-day full-featured trial with no credit card required.' },
        { q: 'Do plans include new framework support?', a: 'All tiers receive new locator exporters and integration updates as soon as they ship.' },
        { q: 'How does team pricing work?', a: 'Team pricing is based on a base fee plus a per-seat cost. You can add or remove members at any time.' },
        { q: 'Can I add more members later?', a: 'Yes, you can upgrade your team size at any time. Prorated charges will apply.' },
    ];

    return (
        <div className="relative py-12 px-4 min-h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* Animated Background Gradients & Blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[0%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px] mix-blend-screen opacity-60 animate-pulse duration-[10000ms]"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen opacity-60 animate-pulse duration-[8000ms]"></div>
                <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-purple-500/10 blur-[90px] mix-blend-screen opacity-40 animate-pulse duration-[12000ms]"></div>
            </div>

            <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 relative z-10">
                {/* Header */}
                <div className="text-center space-y-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 mt-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-1 shadow-sm shadow-primary/10">
                        <Zap className="w-3.5 h-3.5 fill-primary/20" />
                        <span>Unlock your full potential</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground tracking-tight leading-tight">
                        Simple, transparent <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary/80">
                            pricing plans.
                        </span>
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">
                        Choose the plan that matches your team's scale. Every tier includes unlimited locator generation.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative rounded-[2rem] p-6 md:p-8 transition-all duration-500 flex flex-col group backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8",
                                plan.highlight
                                    ? "bg-gradient-to-b from-background/90 to-background/50 border border-primary/40 shadow-[0_0_50px_-15px_rgba(var(--primary),0.3)] scale-100 md:scale-[1.03] z-10"
                                    : "bg-background/40 border border-white/10 hover:border-white/30 hover:bg-background/60 shadow-xl"
                            )}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Pro Plan Glowing overlay */}
                            {plan.highlight && (
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-[2rem] pointer-events-none"></div>
                            )}

                            {plan.highlight && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 bg-gradient-to-r from-primary flex items-center gap-1.5 to-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)] border border-white/10">
                                    <Zap className="w-3 h-3 fill-white/40" /> Most Popular
                                </div>
                            )}
                            {!plan.highlight && plan.isTeam && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 bg-secondary flex items-center gap-1.5 text-muted-foreground text-[9px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                                    <Crown className="w-3 h-3" /> Best Value
                                </div>
                            )}

                            <div className="mb-5 relative z-10 flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-[1rem] flex items-center justify-center transition-transform group-hover:scale-105 duration-500 shadow-sm shrink-0",
                                    plan.highlight ? "bg-gradient-to-br from-primary to-blue-600 text-white shadow-primary/20" : "bg-secondary/80 text-foreground"
                                )}>
                                    <plan.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-foreground leading-none">{plan.name}</h2>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">{plan.description}</p>
                                </div>
                            </div>

                            <div className="mb-6 relative z-10">
                                {plan.isTeam ? (
                                    <div className="space-y-3">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                                                {symbol}{teamTotalPrice.toLocaleString()}
                                            </span>
                                            <span className="text-muted-foreground font-medium text-sm">{plan.period}</span>
                                        </div>

                                        <div className="p-3 bg-background/50 rounded-2xl border border-white/5 backdrop-blur-md">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Team Size</label>
                                                <div className="flex items-center gap-2 bg-black/20 rounded-full p-0.5 border border-white/5">
                                                    <button onClick={() => setTeamMemberCount(Math.max(2, teamMemberCount - 1))} className="w-7 h-7 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-sm transition-colors shadow-sm text-foreground/80">-</button>
                                                    <span className="text-sm font-display font-bold w-6 text-center">{teamMemberCount}</span>
                                                    <button onClick={() => setTeamMemberCount(Math.min(100, teamMemberCount + 1))} className="w-7 h-7 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-sm transition-colors shadow-sm text-foreground/80">+</button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-2 font-medium opacity-80">
                                                {symbol}{prices.teamBase.toLocaleString()} base + {symbol}{prices.perMember.toLocaleString()}/seat
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                                                {plan.highlight ? Math.floor(prices.pro * 0.5) : plan.price}
                                            </span>
                                            <span className="text-muted-foreground font-medium text-sm">{plan.period}</span>
                                        </div>
                                        {plan.highlight && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-base font-display text-muted-foreground/60 line-through decoration-red-500/40 font-medium">
                                                    {plan.price}
                                                </span>
                                                <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Save 50%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6 opacity-50"></div>

                            <ul className="space-y-3 mb-8 flex-1 relative z-10">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2.5 text-[13px] text-foreground/90 font-medium">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                            plan.highlight ? "bg-primary/20 border border-primary/20" : "bg-secondary/50 border border-white/5"
                                        )}>
                                            <Check className={cn("w-3 h-3", plan.highlight ? "text-primary drop-shadow-sm" : "text-foreground/70")} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={plan.isTeam ? () => handleInitiatePurchase(plan) : plan.action}
                                disabled={isCreatingTeam}
                                className={cn(
                                    "w-full py-5 rounded-2xl text-sm font-bold transition-all duration-300 relative z-10 overflow-hidden group/btn shadow-none",
                                    plan.highlight
                                        ? "bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.01] hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)] text-white border-0"
                                        : "bg-secondary text-foreground hover:bg-secondary/80 hover:scale-[1.01] border border-white/10 hover:border-white/20"
                                )}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isCreatingTeam ? 'Processing...' : plan.cta}
                                </span>
                                {plan.highlight && (
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto w-full mt-12 pt-10 border-t border-white/10 relative">
                    <div className="text-center mb-10 space-y-2 relative z-10">
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Frequently Asked Questions</h2>
                        <p className="text-sm text-muted-foreground font-medium">Everything you need to know about billing and teams.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-6 rounded-[1.5rem] bg-background/30 backdrop-blur-md border border-white/5 hover:border-white/15 transition-all duration-300 group hover:bg-background/50 hover:shadow-md">
                                <h3 className="font-semibold text-foreground mb-3 flex items-start gap-3 text-sm leading-snug">
                                    <div className="p-2 rounded-xl bg-secondary/60 text-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors shrink-0 shadow-sm border border-white/5 group-hover:border-primary/20">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <span className="mt-1">{faq.q}</span>
                                </h3>
                                <p className="text-[13px] text-muted-foreground leading-relaxed pl-11 font-medium opacity-90">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {selectedPlanDetails && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={setShowPaymentModal}
                    planName={selectedPlanDetails.name}
                    amount={selectedPlanDetails.finalAmount}
                    currency={currency}
                    user={user}
                    onSuccess={handlePaymentSuccess}
                    features={selectedPlanDetails.features}
                />
            )}
        </div>
    );
};

export default Pricing;
