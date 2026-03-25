
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Documentation from "./pages/Documentation";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Playground from "./pages/Playground";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import TeamDashboard from "./pages/TeamDashboard";
import JoinTeam from "./pages/JoinTeam";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import OAuthCallback from "./pages/auth/OAuthCallback";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundPolicy from "./pages/legal/RefundPolicy";
import AIChatWidget from "./components/ai/AIChatWidget";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <Layout>
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
                                <Route path="/auth/verify" element={<VerifyEmail />} />
                                <Route path="/auth/callback" element={<OAuthCallback />} />
                                <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/team" element={<TeamDashboard />} />
                                <Route path="/join-team" element={<JoinTeam />} />
                                <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                                <Route path="/legal/terms" element={<TermsOfService />} />
                                <Route path="/legal/refund" element={<RefundPolicy />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Layout>
                        <AIChatWidget />
                    </BrowserRouter>
                </TooltipProvider>
            </AuthProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
