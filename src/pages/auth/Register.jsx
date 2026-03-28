import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, Loader2, ArrowRight, User, Mail, Lock, X, Github } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import {
    emailSchema,
    nameSchema,
    passwordSchema,
    validateField,
    checkPasswordStrength
} from '@/lib/validations';

const Register = () => {
    const navigate = useNavigate();
    const { register, signInWithGoogle, signInWithGithub } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const [nameError, setNameError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);

    const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);

    const handleNameBlur = () => {
        setFocusedField(null);
        if (name) setNameError(validateField(nameSchema, name));
    };

    const handleEmailBlur = () => {
        setFocusedField(null);
        if (email) setEmailError(validateField(emailSchema, email));
    };

    const handleConfirmPasswordBlur = () => {
        setFocusedField(null);
        if (confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError(null);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const nameErr = validateField(nameSchema, name);
        const emailErr = validateField(emailSchema, email);
        const passwordErr = validateField(passwordSchema, password);

        setNameError(nameErr);
        setEmailError(emailErr);

        if (nameErr || emailErr || passwordErr) {
            toast.error(nameErr || emailErr || passwordErr);
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        const result = await register(name, email, password);
        setIsLoading(false);

        if (result.success) {
            toast.success(result.message);
            navigate(`/auth/verify?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
        } else {
            toast.error(result.message);
        }
    };

    const RequirementItem = ({ met, allMet, label }) => (
        <div className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${
            met ? (allMet ? 'text-green-400' : 'text-blue-400') : 'text-red-500'
        }`}>
            <div className={`w-3 h-3 rounded-full flex items-center justify-center border transition-all ${
                met 
                    ? (allMet ? 'bg-green-500/20 border-green-500/50' : 'bg-blue-500/20 border-blue-500/50') 
                    : 'border-red-500/50 bg-red-500/10'
            }`}>
                {met && <Check className="w-2 h-2" />}
            </div>
            {label}
        </div>
    );


    return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden py-4 px-4 sm:px-6 lg:px-8">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[128px] rounded-full mix-blend-screen opacity-20 pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 blur-[128px] rounded-full mix-blend-screen opacity-20 pointer-events-none" />

            <div className="w-full max-w-sm relative z-10 animate-fade-in">
                {/* Login Card */}
                <div className="glass-dark rounded-3xl border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="p-6 sm:p-8">
                        {/* Header Section */}
                        <div className="text-center mb-6">
                            <Link to="/" className="inline-block group mb-4 relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                                <div className="relative w-12 h-12 rounded-full ring-1 ring-white/10">
                                    <Logo />
                                </div>
                            </Link>

                            <h2 className="text-2xl font-display font-bold text-white mb-1.5 tracking-tight">
                                Create Account
                            </h2>
                            <p className="text-muted-foreground text-xs">
                                Join thousands of QA engineers
                            </p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Name Field */}
                            <div className="relative group">
                                <div className={`absolute left-4 top-3 transition-colors duration-300 ${focusedField === 'name' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (nameError) setNameError(null);
                                    }}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={handleNameBlur}
                                    placeholder="Full Name"
                                    className={`peer w-full pl-10 pr-10 pt-5 pb-1.5 bg-secondary/30 rounded-full border focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground focus:bg-secondary/50 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)] ${nameError ? 'border-destructive/50' : 'border-white/5'}`}
                                    required
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-10 top-1.5 text-[10px] font-medium text-muted-foreground transition-all duration-300 
                                             peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                             peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:text-primary pointer-events-none"
                                >
                                    Full Name
                                </label>
                                {name && (
                                    <button
                                        type="button"
                                        onClick={() => setName('')}
                                        className="absolute right-4 top-3.5 text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                                        aria-label="Clear name"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                {nameError && <p className="absolute -bottom-5 left-4 text-[10px] text-destructive font-medium">{nameError}</p>}
                            </div>

                            {/* Email Field */}
                            <div className="relative group">
                                <div className={`absolute left-4 top-3.5 transition-colors duration-300 ${focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <Mail className="w-5 h-5" />
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
                                    onBlur={handleEmailBlur}
                                    placeholder="Email Address"
                                    className={`peer w-full pl-10 pr-10 pt-5 pb-1.5 bg-secondary/30 rounded-full border focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground focus:bg-secondary/50 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)] ${emailError ? 'border-destructive/50' : 'border-white/5'}`}
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
                                        aria-label="Clear email"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                {emailError && <p className="absolute -bottom-5 left-4 text-[10px] text-destructive font-medium">{emailError}</p>}
                            </div>

                            {/* Password Field */}
                            <div className="relative group">
                                <div className={`absolute left-4 top-3.5 transition-colors duration-300 ${focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Password"
                                    className="peer w-full pl-10 pr-16 pt-5 pb-1.5 bg-secondary/30 rounded-full border border-white/5 focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground focus:bg-secondary/50 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)]"
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
                                <div className="absolute right-4 top-3.5 flex items-center gap-1">
                                    {password && (
                                        <button
                                            type="button"
                                            onClick={() => setPassword('')}
                                            className="text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                                            aria-label="Clear password"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Strength Bar */}
                            {password.length > 0 && (
                                <div className="pl-1  animate-fade-in">
                                    <div className="flex gap-1 h-1 w-full overflow-hidden rounded-full bg-secondary/50">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className="flex-1 transition-all duration-500 ease-out"
                                                style={{
                                                    backgroundColor: level <= passwordStrength.score ? passwordStrength.color : 'transparent',
                                                    opacity: level <= passwordStrength.score ? 1 : 0
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-wider text-right" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.label.replace('-', ' ')}
                                    </p>

                                     <div className="grid grid-cols-3 gap-1 pt-1">
                                        <RequirementItem met={passwordStrength.requirements.lowercase} allMet={passwordStrength.score === 5} label="Lowercase" />
                                        <RequirementItem met={passwordStrength.requirements.uppercase} allMet={passwordStrength.score === 5} label="Uppercase" />
                                        <RequirementItem met={passwordStrength.requirements.special} allMet={passwordStrength.score === 5} label="Special char" />
                                        <RequirementItem met={passwordStrength.requirements.number} allMet={passwordStrength.score === 5} label="Number" />
                                        <RequirementItem met={passwordStrength.requirements.length} allMet={passwordStrength.score === 5} label="8+ chars" />
                                    </div>
                                </div>
                            )}

                            {/* Confirm Password Field */}
                            <div className="relative group">
                                <div className={`absolute left-4 top-3.5 transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (confirmPasswordError) setConfirmPasswordError(null);
                                    }}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={handleConfirmPasswordBlur}
                                    placeholder="Confirm Password"
                                    className={`peer w-full pl-10 pr-16 pt-5 pb-1.5 bg-secondary/30 rounded-full border focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground focus:bg-secondary/50 focus:shadow-[0_0_20px_rgba(var(--primary),0.1)] ${confirmPasswordError ? 'border-destructive/50' : 'border-white/5'}`}
                                    required
                                />
                                <label
                                    htmlFor="confirmPassword"
                                    className="absolute left-10 top-1.5 text-[10px] font-medium text-muted-foreground transition-all duration-300 
                                             peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                             peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:text-primary pointer-events-none"
                                >
                                    Confirm Password
                                </label>
                                <div className="absolute right-4 top-3.5 flex items-center gap-1">
                                    {confirmPassword && (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmPassword('')}
                                            className="text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                                            aria-label="Clear confirm password"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {confirmPasswordError && <p className="absolute -bottom-5 left-4 text-[10px] text-destructive font-medium">{confirmPasswordError}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group overflow-hidden rounded-full bg-gradient-to-r from-primary to-blue-600 p-[1px] transition-all hover:shadow-[0_0_40px_rgba(var(--primary),0.4)] disabled:opacity-50 disabled:hover:shadow-none mt-6"
                            >
                                <div className="relative flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-full transition-all group-hover:bg-transparent">
                                    <span className="font-semibold text-white tracking-wide">
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </span>
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                        <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
                                    )}
                                </div>
                            </button>
                        </form>

                        <div className="mt-5 flex items-center justify-between gap-4">
                            <div className="h-px bg-white/10 flex-1" />
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                Or continue with
                            </span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <SocialButton
                                onClick={signInWithGoogle}
                                icon={
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                                icon={<Github className="w-5 h-5" />}
                                label="GitHub"
                            />
                        </div>

                        <div className="mt-5 text-center text-xs text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-light transition-colors hover:underline">
                                Sign In
                            </Link>
                        </div>
                    </div>
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

export default Register;
