import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/api/client';

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
                    _lastUpdated: Date.now() // Force extension update
                };
                localStorage.setItem('locatorx_current_user', JSON.stringify(userData));

                // Dispatch event for extension content script
                console.log('AuthContext: Syncing with extension...', userData);
                document.dispatchEvent(new CustomEvent('SYNC_LOCATOR_X', { detail: userData }));
            } else {
                localStorage.removeItem('locatorx_current_user');
                document.dispatchEvent(new CustomEvent('SYNC_LOCATOR_X', { detail: null }));
            }
        }
    }, [user, profile, isLoading]);

    const login = async (email, password) => {
        try {
            const { data } = await apiClient.post('/auth/login', { email, password });
            if (data.success) {
                localStorage.setItem('locatorx_token', data.token);
                await initAuth();
                return { success: true, message: 'Login successful' };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'An error occurred' };
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
            return data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'An error occurred' };
        }
    };

    const resendVerificationEmail = async (email, name) => {
        try {
            const { data } = await apiClient.post('/auth/resend-verification', { email, name });
            return data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'An error occurred' };
        }
    };

    const resetPassword = async (email) => {
        try {
            const { data } = await apiClient.post('/auth/reset-password-request', { email });
            return data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'An error occurred' };
        }
    };

    const signInWithGoogle = async () => {
        window.location.href = '/api/auth/google';
    };

    const signInWithGithub = async () => {
        window.location.href = '/api/auth/github';
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
            resendVerificationEmail,
            signInWithGoogle,
            signInWithGithub,
            loginWithToken,
            refreshProfile,
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
