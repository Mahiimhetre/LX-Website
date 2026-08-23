import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {  Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, Github, X, ShieldAlert, Clock  } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import SocialButton from '@/components/ui/SocialButton';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, signInWithGoogle, signInWithGithub, user, getCaptcha } = useAuth();
    const returnTo = searchParams.get('returnTo');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Lockout state per email: { [emailLower]: lockedUntilTimestamp }
    const [lockouts, setLockouts] = useState({});
    const [remainingAttempts, setRemainingAttempts] = useState(null);

    // Inline errors and warnings
    const [formError, setFormError] = useState('');
    const [formWarning, setFormWarning] = useState('');

    // CAPTCHA state
    const [requiresCaptcha, setRequiresCaptcha] = useState(false);
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');

    const fetchNewCaptcha = useCallback(async () => {
        const res = await getCaptcha();
        if (res && res.success) {
            setCaptchaSvg(res.captchaSvg);
            setCaptchaToken(res.captchaToken);
            setCaptchaInput('');
        }
    }, [getCaptcha]);

    // Check rate limit state from local storage on email change (mock mode helper)
    useEffect(() => {
        const emailLower = email.toLowerCase().trim();
        setCaptchaToken('');
        setCaptchaInput('');

        if (!emailLower) {
            setRemainingAttempts(null);
            setRequiresCaptcha(false);
            return;
        }

        try {
            const data = localStorage.getItem('locatorx_login_attempts');
            if (data) {
                const attemptsMap = new Map(JSON.parse(data));
                const record = attemptsMap.get(emailLower);
                if (record) {
                    if (record.lockedUntil && Date.now() < record.lockedUntil) {
                        setLockouts(prev => ({
                            ...prev,
                            [emailLower]: record.lockedUntil
                        }));
                    }
                    if (record.attempts >= 3) {
                        setRequiresCaptcha(true);
                    } else {
                        setRequiresCaptcha(false);
                    }
                    if (record.attempts > 0 && record.attempts < 5) {
                        setRemainingAttempts(5 - record.attempts);
                    } else {
                        setRemainingAttempts(null);
                    }
                } else {
                    setRemainingAttempts(null);
                    setRequiresCaptcha(false);
                }
            } else {
                setRemainingAttempts(null);
                setRequiresCaptcha(false);
            }
        } catch (e) {
            console.error('Error reading locatorx_login_attempts:', e);
        }
    }, [email]);

    // Fetch CAPTCHA when required and missing token
    useEffect(() => {
        if (requiresCaptcha && !captchaToken) {
            fetchNewCaptcha();
        }
    }, [requiresCaptcha, captchaToken, fetchNewCaptcha]);

    // Calculate dynamic countdown for the currently typed email
    const emailLower = email.toLowerCase().trim();
    const currentLockoutUntil = lockouts[emailLower] || null;
    const [currentLockoutSeconds, setCurrentLockoutSeconds] = useState(0);

    useEffect(() => {
        if (currentLockoutUntil) {
            const updateTimer = () => {
                const now = Date.now();
                if (now >= currentLockoutUntil) {
                    setCurrentLockoutSeconds(0);
                    setLockouts(prev => {
                        const next = { ...prev };
                        delete next[emailLower];
                        return next;
                    });
                    setRemainingAttempts(null);
                } else {
                    setCurrentLockoutSeconds(Math.ceil((currentLockoutUntil - now) / 1000));
                }
            };
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        } else {
            setCurrentLockoutSeconds(0);
        }
    }, [currentLockoutUntil, emailLower]);

    // Clear messages when inputs change
    useEffect(() => {
        setFormError('');
        setFormWarning('');
    }, [email, password]);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            const destination = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard';
            navigate(destination);
        }
    }, [user, navigate, returnTo]);

    const formatLockoutTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setFormError('Please fill in all fields');
            return;
        }

        if (currentLockoutSeconds > 0) {
            return;
        }

        if (requiresCaptcha && !captchaInput) {
            setFormError('Please enter the CAPTCHA characters');
            return;
        }

        setIsLoading(true);
        const result = await login(email, password, captchaInput, captchaToken);
        setIsLoading(false);

        if (result.success) {
            setRemainingAttempts(null);
            setRequiresCaptcha(false);
            setCaptchaInput('');
            setFormError('');
            setFormWarning('');
            toast.success('Welcome back!');
            const destination = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard';
            navigate(destination);
        } else {
            const targetEmailLower = email.toLowerCase().trim();
            setFormError('');
            setFormWarning('');

            // Handle CAPTCHA prompt
            if (result.requiresCaptcha) {
                setRequiresCaptcha(true);
                fetchNewCaptcha();
                setFormWarning(result.message || 'CAPTCHA verification required.');
            }

            // Handle lockout
            if (result.retryAfterSeconds || result.lockedUntil) {
                const durationMs = (result.retryAfterSeconds || 300) * 1000;
                const lockedTime = result.lockedUntil ? new Date(result.lockedUntil).getTime() : Date.now() + durationMs;
                
                setLockouts(prev => ({
                    ...prev,
                    [targetEmailLower]: lockedTime
                }));
                setRemainingAttempts(0);
                setFormError(result.message);
            } else if (result.remainingAttempts !== undefined && result.remainingAttempts !== null) {
                setRemainingAttempts(result.remainingAttempts);
                setFormWarning(result.message);
            } else if (!result.requiresCaptcha) {
                setFormError(result.message);
            }

            if (result.needsVerification) {
                navigate(`/auth/verify?email=${encodeURIComponent(email)}`);
            }
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden py-4 px-4 sm:px-6 lg:px-8">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[65%] -translate-y-[55%] w-[450px] h-[450px] bg-primary/35 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-[35%] -translate-y-[45%] w-[450px] h-[450px] bg-purple-500/25 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse delay-1000 -z-10" />

            <div className="w-full max-w-sm relative z-10 animate-fade-in">
                {/* Login Card */}
                <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-5 sm:p-6">
                        {/* Header Section */}
                        <div className="text-center mb-6">
                            <Link to="/" className="inline-block group mb-4 relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                                <div className="relative w-12 h-12 rounded-full ring-1 ring-white/10">
                                    <Logo />
                                </div>
                            </Link>

                            <h2 className="text-2xl font-display font-bold text-white mb-1.5 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-muted-foreground text-xs">
                                Enter your credentials to access your workspace
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Email Field with Floating Label */}
                            <div className="relative group">
                                <div className={`absolute left-4 top-3 transition-colors duration-300 ${focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="peer w-full pl-10 pr-10 pt-5 pb-1.5 glass-input rounded-full border border-white/8 focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground"
                                    placeholder="Email address"
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-10 top-0.5 text-[10px] font-medium text-muted-foreground transition-all duration-300 
                                             peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                             peer-focus:text-[10px] peer-focus:top-0.5 peer-focus:text-primary pointer-events-none"
                                >
                                    Email address
                                </label>
                                {email && (
                                    <button
                                        type="button"
                                        onClick={() => setEmail('')}
                                        className="absolute right-3 top-3 text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
                                        aria-label="Clear email"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Password Field with Floating Label */}
                            <div className="relative group">
                                <div className={`absolute left-4 top-3 transition-colors duration-300 ${focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="peer w-full pl-10 pr-16 pt-5 pb-1.5 glass-input rounded-full border border-white/8 focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground"
                                    placeholder="Password"
                                    required
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-10 top-0.5 text-[10px] font-medium text-muted-foreground transition-all duration-300 
                                             peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                             peer-focus:text-[10px] peer-focus:top-0.5 peer-focus:text-primary pointer-events-none"
                                >
                                    Password
                                </label>
                                <div className="absolute right-3 top-2.5 flex items-center gap-1">
                                    {password && (
                                        <button
                                            type="button"
                                            onClick={() => setPassword('')}
                                            className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
                                            aria-label="Clear password"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Field Actions */}
                            <div className="flex items-center justify-end">
                                <Link
                                    to="/auth/forgot-password"
                                    className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors hover:underline decoration-primary/50 underline-offset-4"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* CAPTCHA Challenge Box */}
                            {requiresCaptcha && (
                                <div className="animate-fade-in space-y-3 rounded-2xl bg-white/5 border border-white/10 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Security Check</p>
                                        <span className="text-[9px] text-muted-foreground/70 font-medium">Case-insensitive</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div 
                                            className="flex-1 flex justify-center py-2 bg-black/40 rounded-full border border-white/5 overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                        />
                                        <button
                                            type="button"
                                            onClick={fetchNewCaptcha}
                                            className="px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors border border-white/10 rounded-full hover:bg-white/5"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <input
                                            id="captchaInput"
                                            name="captchaInput"
                                            type="text"
                                            value={captchaInput}
                                            onChange={(e) => setCaptchaInput(e.target.value)}
                                            className="w-full px-4 py-3 glass-input rounded-full border border-white/8 focus:border-primary/50 outline-none transition-all duration-300 text-xs text-foreground placeholder-muted-foreground/60 uppercase tracking-widest"
                                            placeholder="Enter code (case-insensitive)"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Form Error */}
                            {formError && (
                                <div className="animate-fade-in flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                    <p className="text-[10px] font-medium text-red-400 leading-tight">
                                        {formError}
                                    </p>
                                </div>
                            )}

                            {/* Form Warning */}
                            {formWarning && !formError && (
                                <div className="animate-fade-in flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                    <p className="text-[10px] font-medium text-amber-400 leading-tight">
                                        {formWarning}
                                    </p>
                                </div>
                            )}

                            {/* Remaining Attempts Warning */}
                            {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts <= 3 && currentLockoutSeconds === 0 && !formWarning && !formError && (
                                <div className="animate-fade-in flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                    <p className="text-[10px] font-medium text-amber-400 leading-tight">
                                        {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || currentLockoutSeconds > 0}
                                className={`w-full py-3.5 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs ${
                                    currentLockoutSeconds > 0 
                                        ? "bg-red-500/10 border border-red-500/30 text-red-400" 
                                        : "primary-glass-button text-white"
                                }`}
                            >
                                <span>
                                    {currentLockoutSeconds > 0
                                        ? `Locked · ${formatLockoutTime(currentLockoutSeconds)}`
                                        : isLoading ? 'Signing In...' : 'Sign In'}
                                </span>
                                {isLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                ) : currentLockoutSeconds > 0 ? (
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                ) : (
                                    <ArrowRight className="w-3.5 h-3.5 text-white transition-transform group-hover:translate-x-1" />
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-[#08080a] px-2 text-muted-foreground/50 font-medium tracking-widest">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <SocialButton
                                onClick={signInWithGoogle}
                                icon={
                                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                }
                                label="Google"
                            />
                            <SocialButton
                                onClick={signInWithGithub}
                                icon={<Github className="w-4 h-4" />}
                                label="GitHub"
                            />
                        </div>

                        {/* Footer Link */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/auth/register" className="font-semibold text-primary hover:text-primary-light transition-colors hover:underline">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Bottom Status Bar / Decorative */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
                </div>



                {/* Copyright/Simple Footer text outside card (optional, but requested in layout) */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/40 font-medium">
                        &copy; 2026 LocatorX. Secure Access.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
