import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Layout from "@/components/layout/Layout";

// Lazy-load all pages — each becomes a separate JS chunk downloaded on demand
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Contact = lazy(() => import("./pages/Contact"));
const Playground = lazy(() => import("./pages/Playground"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeamDashboard = lazy(() => import("./pages/TeamDashboard"));
const JoinTeam = lazy(() => import("./pages/JoinTeam"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const OAuthCallback = lazy(() => import("./pages/auth/OAuthCallback"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy"));
const AuthAnimationPreview = lazy(() => import("./pages/AuthAnimationPreview"));
const AIChatWidget = lazy(() => import("./components/ai/AIChatWidget"));

// Premium page-transition fallback — renders inside Layout without unmounting Header/Footer
const PageSubLoader = () => (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 animate-pulse">
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-[100] animate-pulse" />
        <div className="h-44 rounded-3xl bg-white/5 border border-white/5 p-8 flex flex-col justify-center gap-4">
            <div className="h-4 bg-white/10 rounded w-24" />
            <div className="h-8 bg-white/10 rounded w-1/3" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 h-32 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-xl bg-white/10" />
                    <div className="space-y-2">
                        <div className="h-6 bg-white/10 rounded w-16" />
                        <div className="h-3 bg-white/5 rounded w-24" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 5 * 60 * 1000,
            retry: 1,
        },
    },
});

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <AuthProvider>
                <NotificationProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                            <Layout>
                                <Suspense fallback={<PageSubLoader />}>
                                    <Routes>
                                        <Route path="/" element={<Index />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/documentation" element={<Documentation />} />
                                        <Route path="/pricing" element={<Pricing />} />
                                        <Route path="/contact" element={<Contact />} />
                                        <Route path="/playground" element={<Playground />} />
                                        <Route path="/auth/login" element={<Login />} />
                                        <Route path="/auth/register" element={<Register />} />
                                        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                                        <Route path="/auth/reset-password" element={<ResetPassword />} />
                                        <Route path="/auth/verify" element={<VerifyEmail />} />
                                        <Route path="/auth/callback" element={<OAuthCallback />} />
                                        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/billing" element={<Navigate to="/pricing" replace />} />
                                        <Route path="/team" element={<TeamDashboard />} />
                                        <Route path="/join-team" element={<JoinTeam />} />
                                        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                                        <Route path="/legal/terms" element={<TermsOfService />} />
                                        <Route path="/legal/refund" element={<RefundPolicy />} />
                                        <Route path="/auth-animation-preview" element={<AuthAnimationPreview />} />
                                        <Route path="*" element={<NotFound />} />
                                    </Routes>
                                </Suspense>
                            </Layout>
                            <Suspense fallback={null}>
                                <AIChatWidget />
                            </Suspense>
                        </BrowserRouter>
                    </TooltipProvider>
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
