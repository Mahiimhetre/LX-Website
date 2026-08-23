import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HandleAvatar from '@/components/HandleAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import apiClient from '@/api/client';
import { SettingsIcon, UserIcon, MailIcon, ShieldIcon, CheckCircleIcon } from '@/components/icons';

/**
 * Settings Page
 *
 * Provides profile settings (name editing, avatar editing) and account metadata.
 * Premium glassmorphic cards layout.
 */
const Settings = () => {
    const { user, profile, refreshProfile } = useAuth();
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [trialDaysLeft, setTrialDaysLeft] = useState(0);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setAvatarUrl(profile.avatarUrl || '');
        } else if (user) {
            setName(user.email.split('@')[0]);
        }
    }, [user, profile]);

    // Calculate trial days left
    useEffect(() => {
        if (user) {
            const rawDate = user.created_at || user.createdAt;
            const createdAt = rawDate ? new Date(rawDate) : new Date();
            const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
            const now = new Date();
            const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
            setTrialDaysLeft(Math.max(0, daysLeft));
        }
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name cannot be empty.');
            return;
        }

        setIsSaving(true);
        try {
            const { data } = await apiClient.put('/profile', { name: name.trim() });
            if (!data.success) throw new Error(data.message);

            toast.success('Profile updated successfully!');
            await refreshProfile();
        } catch (error) {
            toast.error(error.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUploadComplete = async (url) => {
        setAvatarUrl(url);
        await refreshProfile();
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <SettingsIcon className="h-8 w-8 text-primary" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your profile information, avatar, and account tier.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-2 rounded-3xl glass-panel p-6 relative overflow-hidden group transform-gpu">
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                Profile Details
                            </h2>

                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <HandleAvatar
                                    userId={user?.id}
                                    currentAvatarUrl={avatarUrl}
                                    onUploadComplete={handleAvatarUploadComplete}
                                    size="lg"
                                />
                                <div className="text-center sm:text-left space-y-1">
                                    <h3 className="font-semibold text-white">Profile Avatar</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        Upload a profile photo. Supported formats: JPG, PNG, GIF. Max file size: 5MB.
                                    </p>
                                </div>
                            </div>

                            {/* Form fields */}
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                                            <MailIcon size={12} /> Email Address
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                disabled
                                                value={user?.email || ''}
                                                className="bg-secondary/20 border-white/10 text-muted-foreground/60 pr-10 cursor-not-allowed"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center" title="Verified Account">
                                                <CheckCircleIcon size={16} className="text-green-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
                                            <UserIcon size={12} /> Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-secondary/20 border-white/10 focus:border-primary/50 text-white"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-white shadow-glow"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Subscription & Account Metadata */}
                    <div className="space-y-6">
                        <div className="rounded-3xl glass-panel p-6 relative overflow-hidden group transform-gpu">
                            <div className="relative z-10 space-y-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShieldIcon className="h-5 w-5 text-primary" />
                                    Subscription Tier
                                </h2>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Current Plan</span>
                                        <span className="text-sm font-bold text-primary uppercase tracking-wider">
                                            {profile?.plan || 'Free'}
                                        </span>
                                    </div>

                                    {trialDaysLeft > 0 ? (
                                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                                            <span className="text-xs text-muted-foreground">Premium Trial</span>
                                            <span className="text-xs font-semibold text-green-400">
                                                {trialDaysLeft} days remaining
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                                            <span className="text-xs text-muted-foreground">Status</span>
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                Active
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Unlock collaboration, advanced API features, team spaces, and larger usage limits by upgrading.
                                </p>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full rounded-xl border-white/10 hover:bg-white/5"
                                >
                                    <a href="/pricing">Manage Plans</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
