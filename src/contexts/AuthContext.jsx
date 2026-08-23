import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { handleApiError } from '@/lib/errorHandler';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const initAuth = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('locatorx_token');
        if (!token) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await apiClient.get('/auth/session');
            if (data.success) {
                setSession({ token });
                setUser(data.user);
                setProfile(data.user.profile);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Session error', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initAuth();
    }, []);

    // Reactive Sync with Extension
    useEffect(() => {
        if (!isLoading) {
            // 1. Sync with Extension
            if (user && profile) {
                const userData = {
                    id: user.id,
                    email: user.email,
                    name: profile.name,
                    avatar: profile.avatarUrl,
                    plan: profile.plan || 'free',
                    token: session?.token,
                    _lastUpdated: Date.now() // Force extension update
                };
                localStorage.setItem('locatorx_current_user', JSON.stringify(userData));

                // Dispatch event for extension content script
                document.dispatchEvent(new CustomEvent('SYNC_LOCATOR_X', { detail: userData }));
            } else {
                localStorage.removeItem('locatorx_current_user');
                document.dispatchEvent(new CustomEvent('SYNC_LOCATOR_X', { detail: null }));
            }
        }
    }, [user, profile, isLoading]);

    const login = async (email, password, captchaAnswer, captchaToken) => {
        try {
            const { data } = await apiClient.post('/auth/login', { email, password, captchaAnswer, captchaToken });
            if (data.success) {
                localStorage.setItem('locatorx_token', data.token);
                await initAuth();
                return { success: true, message: 'Login successful' };
            }
            const parsed = handleApiError(data, 'Login failed. Please try again.');
            return { 
                success: false, 
                message: parsed.message,
                code: parsed.code,
                remainingAttempts: data.remainingAttempts,
                retryAfterSeconds: data.retryAfterSeconds,
                lockedUntil: data.lockedUntil,
                requiresCaptcha: data.requiresCaptcha
            };
        } catch (error) {
            const errData = error.response?.data;
            const parsed = handleApiError(error, 'Login failed. Please try again.');
            return { 
                success: false, 
                message: parsed.message,
                code: parsed.code,
                needsVerification: errData?.needsVerification,
                remainingAttempts: errData?.remainingAttempts,
                retryAfterSeconds: errData?.retryAfterSeconds,
                lockedUntil: errData?.lockedUntil,
                requiresCaptcha: errData?.requiresCaptcha
            };
        }
    };

    const getCaptcha = async () => {
        try {
            const { data } = await apiClient.get('/auth/captcha');
            return data;
        } catch (error) {
            console.error('Error fetching captcha:', error);
            return { success: false, message: 'Could not load CAPTCHA. Please try again.' };
        }
    };

    const logout = async () => {
        localStorage.removeItem('locatorx_token');
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await apiClient.post('/auth/register', { name, email, password });
            if (data.success === false) {
                return { success: false, ...handleApiError(data, 'Registration failed. Please try again.') };
            }
            return data;
        } catch (error) {
            return { success: false, ...handleApiError(error, 'Registration failed. Please try again.') };
        }
    };

    const resendVerificationEmail = async (email, name) => {
        try {
            const { data } = await apiClient.post('/auth/resend-verification', { email, name });
            if (data.success === false) {
                return { success: false, ...handleApiError(data, 'Failed to resend verification email. Please try again.') };
            }
            return data;
        } catch (error) {
            return { success: false, ...handleApiError(error, 'Failed to resend verification email. Please try again.') };
        }
    };

    const resetPassword = async (email) => {
        try {
            const { data } = await apiClient.post('/auth/reset-password-request', { email });
            if (data.success === false) {
                return { success: false, ...handleApiError(data, 'Failed to send reset email. Please try again.') };
            }
            return data;
        } catch (error) {
            return { success: false, ...handleApiError(error, 'Failed to send reset email. Please try again.') };
        }
    };

    const confirmResetPassword = async (token, newPassword) => {
        try {
            const { data } = await apiClient.post('/auth/reset-password', { token, newPassword });
            if (data.success === false) {
                return { success: false, ...handleApiError(data, 'Failed to reset password. Please try again.') };
            }
            return data;
        } catch (error) {
            return { success: false, ...handleApiError(error, 'Failed to reset password. Please try again.') };
        }
    };

    const signInWithGoogle = async () => {
        window.location.href = '/api/v1/auth/google';
    };

    const signInWithGithub = async () => {
        window.location.href = '/api/v1/auth/github';
    };

    const loginWithToken = async (token) => {
        localStorage.setItem('locatorx_token', token);
        await initAuth();
        return { success: true };
    };

    const refreshProfile = async () => {
        if (!user) return;
        await initAuth();
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            isLoading,
            login,
            logout,
            register,
            resetPassword,
            confirmResetPassword,
            resendVerificationEmail,
            signInWithGoogle,
            signInWithGithub,
            loginWithToken,
            refreshProfile,
            getCaptcha,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
