import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const JoinTeam = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const [isProcessing, setIsProcessing] = useState(true);
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            toast.error("Invalid invitation link.");
            navigate('/');
            return;
        }

        const processInvitation = async () => {
            if (!user) {
                // Determine valid redirect path
                const returnUrl = `/join-team?token=${token}`;
                // Redirect to login with return path
                navigate(`/auth/login?returnTo=${encodeURIComponent(returnUrl)}`);
                return;
            }

            try {
                const { data } = await apiClient.post('/teams/accept', { token });
                if (!data.success) throw new Error(data.message);

                await refreshProfile();
                toast.success("You have joined the team successfully!");
                navigate('/team');

            } catch (error) {
                console.error("Join Team Error:", error);
                toast.error(error.message || "Failed to join team.");
                navigate('/dashboard');
            } finally {
                setIsProcessing(false);
            }
        };

        processInvitation();
    }, [token, user, navigate, refreshProfile]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    Joining Team...
                </h1>
                <p className="text-muted-foreground">Please wait while we set up your access.</p>
            </div>
        </div>
    );
};

export default JoinTeam;
