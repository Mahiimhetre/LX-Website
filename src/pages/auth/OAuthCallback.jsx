import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                toast.error('OAuth Login Failed: ' + error);
                navigate('/auth/login');
                return;
            }

            if (token) {
                await loginWithToken(token);
                toast.success('Successfully logged in!');
                navigate('/dashboard');
            } else {
                navigate('/auth/login');
            }
        };

        handleCallback();
    }, [searchParams, navigate, loginWithToken]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-secondary/20 border border-white/5 backdrop-blur-xl shadow-2xl">
                <div className="relative">
                    <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full mix-blend-screen opacity-50"></div>
                    <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold font-display tracking-tight text-white">Authenticating</h2>
                    <p className="text-muted-foreground text-sm max-w-[250px]">
                        Please wait while we complete your login securely...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OAuthCallback;
