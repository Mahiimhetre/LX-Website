import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { emailSchema, validateField } from '@/lib/validations';

const ForgotPassword = () => {
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState(null);
    const [emailSent, setEmailSent] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const emailErr = validateField(emailSchema, email);
        setEmailError(emailErr);

        if (emailErr) {
            toast.error(emailErr);
            return;
        }

        setIsLoading(true);
        const result = await resetPassword(email);
        setIsLoading(false);

        if (result.success) {
            toast.success(result.message);
            setEmailSent(true);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden py-4 px-4 sm:px-6 lg:px-8">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[128px] rounded-full mix-blend-screen opacity-20 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[128px] rounded-full mix-blend-screen opacity-20 pointer-events-none animate-pulse delay-1000" />

            <div className="w-full max-w-sm relative z-10 px-6">
                {/* Login Card */}
                <div className="glass-dark rounded-3xl border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="p-6 sm:p-8">
                        {!emailSent ? (
                            <>
                                <div className="text-center mb-6">
                                    <Link to="/" className="inline-block group mb-4 relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                                        <div className="relative w-12 h-12 rounded-full ring-1 ring-white/10">
                                            <Logo />
                                        </div>
                                    </Link>
                                    <h2 className="text-2xl font-display font-bold text-white mb-1.5 tracking-tight">Reset Password</h2>
                                    <p className="text-muted-foreground text-xs">We'll help you get back into your account</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="relative group">
                                        <div className={`absolute left-4 top-3 transition-colors duration-300 ${focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (emailError) setEmailError(null);
                                            }}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Email Address"
                                            className={`peer w-full pl-10 pr-12 pt-5 pb-1.5 bg-secondary/30 rounded-full border focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground focus:bg-secondary/50 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)] ${emailError ? 'border-destructive/50' : 'border-white/5'}`}
                                            required
                                        />
                                        <label
                                            htmlFor="email"
                                            className="absolute left-10 top-1.5 text-[10px] font-medium text-muted-foreground transition-all duration-300 
                                                     peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                                     peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:text-primary pointer-events-none"
                                        >
                                            Email Address
                                        </label>
                                        {email && (
                                            <button
                                                type="button"
                                                onClick={() => setEmail('')}
                                                className="absolute right-4 top-3.5 text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        {emailError && <p className="absolute -bottom-5 left-4 text-[10px] text-destructive font-medium">{emailError}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full relative group overflow-hidden rounded-full bg-gradient-to-r from-primary to-blue-600 p-[1px] transition-all hover:shadow-[0_0_40px_rgba(var(--primary),0.4)] disabled:opacity-50 disabled:hover:shadow-none"
                                    >
                                        <div className="relative flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-full transition-all group-hover:bg-transparent">
                                            <span className="font-semibold text-white tracking-wide">
                                                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                                            </span>
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            ) : (
                                                <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
                                            )}
                                        </div>
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center space-y-8 py-4">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                                    <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <CheckCircle className="w-10 h-10 text-primary" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3">Check your email</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        We've sent a password reset link to <br />
                                        <span className="font-semibold text-white">{email}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-sm font-medium text-primary hover:text-primary-light transition-colors hover:underline"
                                >
                                    Try another email
                                </button>
                            </div>
                        )}

                        <div className="mt-8 text-center pt-8 border-t border-white/5">
                            <Link to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline">
                                Return to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
