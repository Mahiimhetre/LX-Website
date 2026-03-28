import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, Github, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

const Login = () => {
    const navigate = useNavigate();
    const { login, signInWithGoogle, signInWithGithub, user } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden py-4 px-4 sm:px-6 lg:px-8">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[128px] rounded-full mix-blend-screen opacity-20 pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[128px] rounded-full mix-blend-screen opacity-20 pointer-events-none animate-pulse delay-1000" />

            <div className="w-full max-w-sm relative z-10 animate-fade-in">
                {/* Login Card */}
                <div className="glass-dark rounded-3xl border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
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
                                    className="peer w-full pl-10 pr-10 pt-5 pb-1.5 bg-secondary/30 rounded-full border border-white/5 focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground focus:bg-secondary/50 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                    placeholder="Email address"
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-10 top-1.5 text-[10px] font-medium text-muted-foreground transition-all duration-300 
                                             peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                             peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:text-primary pointer-events-none"
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
                                    className="peer w-full pl-10 pr-16 pt-5 pb-1.5 bg-secondary/30 rounded-full border border-white/5 focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground focus:bg-secondary/50 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                    placeholder="Password"
                                    required
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-10 top-1.5 text-[10px] font-medium text-muted-foreground transition-all duration-300 
                                             peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                             peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:text-primary pointer-events-none"
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group overflow-hidden rounded-full bg-gradient-to-r from-primary to-blue-600 p-[1px] transition-all hover:shadow-[0_0_40px_rgba(var(--primary),0.4)] disabled:opacity-50 disabled:hover:shadow-none"
                            >
                                <div className="relative flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-full transition-all group-hover:bg-transparent">
                                    <span className="font-semibold text-white tracking-wide text-xs">
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                    </span>
                                    {isLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                    ) : (
                                        <ArrowRight className="w-3.5 h-3.5 text-white transition-transform group-hover:translate-x-1" />
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-[#0B0F17] px-2 text-muted-foreground/50 font-medium tracking-widest">
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

const SocialButton = ({ onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-white/5 hover:bg-secondary/40 hover:border-white/10 hover:shadow-lg transition-all duration-300 group"
    >
        <span className="text-muted-foreground group-hover:text-foreground transition-colors group-hover:scale-110 duration-300">
            {icon}
        </span>
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {label}
        </span>
    </button>
);

export default Login;
