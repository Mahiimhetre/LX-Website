import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, CheckCircle, Eye, EyeOff, X, ShieldAlert } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { passwordSchema, validateField } from '@/lib/validations';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { confirmResetPassword } = useAuth();

    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleConfirmReset = async (e) => {
        e.preventDefault();

        if (!token) {
            return;
        }

        const passErr = validateField(passwordSchema, newPassword);
        if (passErr) {
            setPasswordError(passErr);
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setPasswordError(null);

        const result = await confirmResetPassword(token, newPassword);
        setIsLoading(false);

        if (result.success) {
            setResetSuccess(true);
            toast.success(result.message || 'Password reset successfully!');
        } else {
            setPasswordError(result.message || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden py-4 px-4 sm:px-6 lg:px-8">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[65%] -translate-y-[55%] w-[450px] h-[450px] bg-primary/35 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-[35%] -translate-y-[45%] w-[450px] h-[450px] bg-purple-500/25 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-pulse delay-1000 -z-10" />

            <div className="w-full max-w-sm relative z-10 px-6 animate-fade-in">
                <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <Link to="/" className="inline-block group mb-4 relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                                <div className="relative w-12 h-12 rounded-full ring-1 ring-white/10">
                                    <Logo />
                                </div>
                            </Link>
                            <h2 className="text-2xl font-display font-bold text-white mb-1.5 tracking-tight">Set New Password</h2>
                            <p className="text-muted-foreground text-xs">Enter your new password below</p>
                        </div>

                        {!resetSuccess ? (
                            <>
                                {!token && (
                                    <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                                        <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <p className="text-[10px] font-medium text-red-400 leading-tight">
                                            No reset token found. Please check your email link.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleConfirmReset} className="space-y-4">
                                    {/* New Password Input */}
                                    <div className="relative group">
                                        <div className={`absolute left-4 top-3 transition-colors duration-300 ${focusedField === 'newPassword' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                if (passwordError) setPasswordError(null);
                                            }}
                                            onFocus={() => setFocusedField('newPassword')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="New Password"
                                            className={`peer w-full pl-10 pr-16 pt-5 pb-1.5 glass-input rounded-full border focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground ${passwordError ? 'border-destructive/50' : 'border-white/5'}`}
                                            required
                                            disabled={!token}
                                        />
                                        <label
                                            htmlFor="newPassword"
                                            className="absolute left-10 top-1.5 text-[10px] font-medium text-muted-foreground transition-all duration-300
                                                     peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                                     peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:text-primary pointer-events-none"
                                        >
                                            New Password
                                        </label>
                                        <div className="absolute right-3 top-2.5 flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
                                            >
                                                {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password Input */}
                                    <div className="relative group">
                                        <div className={`absolute left-4 top-3 transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (passwordError) setPasswordError(null);
                                            }}
                                            onFocus={() => setFocusedField('confirmPassword')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="Confirm New Password"
                                            className={`peer w-full pl-10 pr-16 pt-5 pb-1.5 glass-input rounded-full border focus:border-primary/50 outline-none transition-all duration-300 placeholder-transparent text-xs text-foreground ${passwordError ? 'border-destructive/50' : 'border-white/5'}`}
                                            required
                                            disabled={!token}
                                        />
                                        <label
                                            htmlFor="confirmPassword"
                                            className="absolute left-10 top-1.5 text-[10px] font-medium text-muted-foreground transition-all duration-300
                                                     peer-placeholder-shown:text-xs peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-muted-foreground/70
                                                     peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:text-primary pointer-events-none"
                                        >
                                            Confirm New Password
                                        </label>
                                        <div className="absolute right-3 top-2.5 flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="text-muted-foreground/50 hover:text-foreground transition-colors p-0.5"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {passwordError && (
                                        <div className="animate-fade-in flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                                            <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                            <p className="text-[10px] font-medium text-red-400 leading-tight">{passwordError}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading || !token}
                                        className="w-full primary-glass-button font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed group text-xs text-white"
                                    >
                                        <span>{isLoading ? 'Updating Password...' : 'Reset Password'}</span>
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center space-y-6 py-4">
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                                    <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <CheckCircle className="w-10 h-10 text-primary" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Password Reset Complete</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Your password has been successfully updated. You can now log in with your new credentials.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/auth/login')}
                                    className="w-full primary-glass-button font-bold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs text-white"
                                >
                                    <span>Proceed to Login</span>
                                    <ArrowRight className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        )}

                        <div className="mt-8 text-center pt-6 border-t border-white/5">
                            <Link to="/auth/login" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors hover:underline">
                                Return to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
