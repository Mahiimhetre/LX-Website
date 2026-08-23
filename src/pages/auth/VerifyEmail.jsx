import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {  Mail, CheckCircle, ArrowRight, Loader2, RotateCcw, ShieldAlert  } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, profile, resendVerificationEmail, refreshProfile } = useAuth();

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [isVerified, setIsVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [formError, setFormError] = useState('');
    const hasVerifiedTokenRef = useRef(false);

    // 1. Process verification token from email link
    useEffect(() => {
        if (token && !hasVerifiedTokenRef.current) {
            hasVerifiedTokenRef.current = true;
            setIsVerifying(true);
            setFormError('');

            apiClient.post('/auth/verify-email', { token })
                .then(async ({ data }) => {
                    if (data.success) {
                        setIsVerified(true);
                        toast.success(data.message || 'Email successfully verified!');
                        if (refreshProfile) await refreshProfile();
                        setTimeout(() => navigate('/dashboard'), 2000);
                    } else {
                        setFormError(data.message || 'Invalid or expired verification link.');
                    }
                })
                .catch((err) => {
                    const msg = err.response?.data?.message || err.message || 'Failed to verify email.';
                    setFormError(msg);
                })
                .finally(() => {
                    setIsVerifying(false);
                });
        }
    }, [token, navigate, refreshProfile]);

    // 2. Poll session in background if waiting on link click in another tab/device
    useEffect(() => {
        if (token) return; // If verifying via token in this tab, don't poll session concurrently

        const intervalId = setInterval(async () => {
             if (user && (!profile || !profile.isVerified)) {
                 try {
                     const { data } = await apiClient.get('/auth/session');
                     if (data.success && data.user && data.user.profile && data.user.profile.isVerified) {
                         setIsVerified(true);
                         clearInterval(intervalId);
                         toast.success('Email successfully verified!');
                         setTimeout(() => navigate('/dashboard'), 2000);
                     }
                 } catch (err) {
                     // Ignore authentication session retrieval errors during background polling
                 }
             }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [user, profile, token, navigate]);

    // Check if user is already verified (fallback)
    useEffect(() => {
        if (profile?.isVerified) {
            setIsVerified(true);
            setIsLoading(false);
        }
    }, [profile]);

    // Resend countdown
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setInterval(() => {
                setResendCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [resendCountdown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResendVerification = async () => {
        if (resendCountdown > 0 || !email) return;
        setFormError('');

        setIsLoading(true);
        try {
            const name = searchParams.get('name') || '';
            const result = await resendVerificationEmail(email, name);

            if (result.success) {
                toast.success(result.message);
                setResendCountdown(60);
            } else {
                setFormError(result.message || 'Failed to resend verification email.');
            }
        } catch (error) {
            setFormError(error.message || 'Failed to resend verification email');
        }
        setIsLoading(false);
    };

    return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[65%] -translate-y-[55%] w-[450px] h-[450px] bg-primary/35 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-[35%] -translate-y-[45%] w-[450px] h-[450px] bg-purple-500/25 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse delay-1000 -z-10" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Card */}
                <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-6 sm:p-8 text-center">
                        <Link to="/" className="inline-block group mb-4 relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                            <div className="relative w-12 h-12 rounded-full ring-1 ring-white/10">
                                <Logo />
                            </div>
                        </Link>

                        <h2 className="text-2xl font-display font-bold text-white mb-1 tracking-tight">
                            {isVerifying ? 'Verifying Account' : isVerified ? 'Account Verified' : 'Check your inbox'}
                        </h2>
                        <p className="text-muted-foreground text-xs mb-6">
                            {isVerifying ? 'Validating your verification link...' : isVerified ? 'Your email has been confirmed' : "We've sent you a verification link"}
                        </p>

                        {isVerifying ? (
                            <div className="space-y-4 py-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                                <h2 className="text-base font-bold text-white">Verifying Email...</h2>
                                <p className="text-xs text-muted-foreground">Please wait while we confirm your verification token.</p>
                            </div>
                        ) : !email && !token ? (
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3 border border-red-500/20">
                                    <Mail className="w-6 h-6 text-red-500" />
                                </div>
                                <h2 className="text-base font-bold text-white">Details Missing</h2>
                                <p className="text-xs text-muted-foreground">
                                    No email address provided. Please register again.
                                </p>
                                <Link
                                    to="/auth/register"
                                    className="w-full py-3 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 hover:shadow-glow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    Register Account <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : !isVerified ? (
                            <div className="space-y-6">
                                <div className="relative w-16 h-16 mx-auto">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                                    <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Mail className="w-8 h-8 text-primary" />
                                    </div>

                                    {/* Resend Error */}
                                    {formError && (
                                        <div className="animate-fade-in flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                                            <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                            <p className="text-[10px] font-medium text-red-400 leading-tight">{formError}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-secondary/30 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider font-semibold">Sent to</p>
                                    <p className="font-semibold text-white break-all text-sm">{email}</p>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed px-4">
                                    Click the link in the email to activate your account.<br />If you don't see it, check your spam folder.
                                </p>

                                <div className="pt-4 border-t border-white/5">
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={resendCountdown > 0 || isLoading}
                                        className="w-full py-3 rounded-full bg-secondary/20 text-white text-sm font-medium hover:bg-secondary/40 border border-white/5 hover:border-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <RotateCcw className={`w-3.5 h-3.5 ${resendCountdown === 0 ? 'group-hover:rotate-180 transition-transform duration-500' : ''}`} />
                                                {resendCountdown > 0 ? `Resend in ${formatTime(resendCountdown)}` : 'Resend Email'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20">
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-2">Email Verified!</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Your account has been successfully verified.<br />Redirecting you to the dashboard...
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full py-3 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 hover:shadow-glow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="mt-6">
                            <Link to="/auth/login" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
