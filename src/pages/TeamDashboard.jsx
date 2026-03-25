import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Users, Mail, Shield, Crown, UserPlus, Trash2, Clock, CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';

const TeamDashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loadingTeam, setLoadingTeam] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) navigate('/auth/login');
    }, [user, isLoading, navigate]);

    useEffect(() => {
        if (user) fetchTeamData();
    }, [user]);

    const fetchTeamData = async () => {
        if (!user) return;
        try {
            const { data } = await apiClient.get('/teams');
            if (!data.success || !data.teams || data.teams.length === 0) {
                setLoadingTeam(false);
                return;
            }

            const teamData = data.teams[0];

            // Get full details
            const { data: detailsData } = await apiClient.get(`/teams/${teamData.id}`);
            if (detailsData.success && detailsData.team) {
                setTeam(detailsData.team);
                
                // Format members
                const formattedMembers = detailsData.team.members.map(m => ({
                    ...m,
                    user_id: m.userId,
                    profile: {
                        name: m.user.profile.name,
                        email: m.user.email,
                        avatar_url: m.user.profile.avatarUrl
                    }
                }));
                setMembers(formattedMembers);
                setInvitations(detailsData.team.invitations || []);
            }
        } catch (error) {
            console.error('Error fetching team data:', error);
            toast.error('Failed to load team data.');
        } finally {
            setLoadingTeam(false);
        }
    };

    const handleInviteMember = async () => {
        if (!user || !team) return;
        if (!inviteEmail.trim()) {
            toast.error('Please enter an email address.');
            return;
        }

        const totalSlots = team.member_count;
        const usedSlots = members.length + invitations.filter(i => i.status === 'pending').length;

        if (usedSlots >= totalSlots) {
            toast.error(`Your team has ${totalSlots} member slots. Please upgrade to add more members.`);
            return;
        }

        setIsInviting(true);
        try {
            const { data } = await apiClient.post('/teams/invite', {
                teamId: team.id,
                email: inviteEmail.trim().toLowerCase(),
                role: inviteRole
            });
            if (!data.success) throw new Error(data.message);

            toast.success(`Invitation sent to ${inviteEmail}`);
            setInviteEmail('');
            setInviteRole('member');
            setInviteDialogOpen(false);
            fetchTeamData();
        } catch (error) {
            toast.error(error.message || 'Failed to send invitation.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId, userId) => {
        if (!team || userId === team.owner_id) {
            toast.error('Cannot remove the team owner.');
            return;
        }
        try {
            await apiClient.delete(`/teams/members/${memberId}`);
            toast.success('Team member has been removed.');
            fetchTeamData();
        } catch (error) {
            toast.error('Failed to remove member.');
        }
    };

    const handleCancelInvitation = async (invitationId) => {
        try {
            await apiClient.delete(`/teams/invitations/${invitationId}`);
            toast.success('The invitation has been cancelled.');
            fetchTeamData();
        } catch (error) {
            toast.error('Failed to cancel invitation.');
        }
    };

    const handleUpdateRole = async (memberId, newRole) => {
        try {
            await apiClient.put(`/teams/members/${memberId}`, { role: newRole });
            toast.success(`Member role updated to ${newRole}.`);
            fetchTeamData();
        } catch (error) {
            toast.error('Failed to update role.');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'declined':
            case 'expired': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return null;
        }
    };

    if (isLoading || loadingTeam) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!team) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto p-8 rounded-3xl glass border border-white/5 bg-white/5">
                    <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">No active team</h1>
                    <p className="text-muted-foreground mb-8">
                        You don't have a team yet. Create one or upgrade your plan to start collaborating.
                    </p>
                    <Button onClick={() => navigate('/pricing')} className="rounded-xl px-8 bg-primary hover:bg-primary/90">
                        View Pricing & Plans
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const isOwner = user?.id === team.owner_id;
    const isAdmin = isOwner || members.find(m => m.user_id === user?.id)?.role === 'admin';
    const usedSlots = members.length;
    const pendingInvites = invitations.filter(i => i.status === 'pending').length;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Users className="h-8 w-8 text-primary" />
                            {team.name}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            {team.currency === 'INR' ? '₹' : '$'}{Number(team.total_paid).toLocaleString()} Plan
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                            {usedSlots} / {team.member_count} Members Used
                        </p>
                    </div>
                    {isAdmin && (
                        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-glow">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invite Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass border-white/10 sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Invite Team Member</DialogTitle>
                                    <DialogDescription>Send an invitation to join your workspace.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs uppercase font-semibold text-muted-foreground">Email Address</Label>
                                        <Input
                                            id="email"
                                            className="bg-secondary/20 border-white/10 focus:border-primary/50"
                                            placeholder="colleague@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="text-xs uppercase font-semibold text-muted-foreground">Role</Label>
                                        <Select value={inviteRole} onValueChange={setInviteRole}>
                                            <SelectTrigger className="bg-secondary/20 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin - Can manage team</SelectItem>
                                                <SelectItem value="member">Member - Full access</SelectItem>
                                                <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleInviteMember} disabled={isInviting}>
                                        {isInviting ? 'Sending...' : 'Send Invitation'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Team Members List */}
                <div className="rounded-3xl glass border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Team Members</h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">{usedSlots} Active</span>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-6">User</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined</TableHead>
                                    {isAdmin && <TableHead className="text-right pr-6">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                {member.profile?.avatar_url ? (
                                                    <img src={member.profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10" />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-white/10">
                                                        {(member.profile?.name || member.profile?.email || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground flex items-center gap-2">
                                                        {member.profile?.name || 'Unknown'}
                                                        {member.user_id === team.owner_id && <Crown className="h-3 w-3 text-yellow-500" />}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{member.profile?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {isAdmin && member.user_id !== team.owner_id ? (
                                                <Select value={member.role} onValueChange={(v) => handleUpdateRole(member.id, v)}>
                                                    <SelectTrigger className="h-7 text-xs w-24 bg-white/5 border-white/10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="member">Member</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge variant="secondary" className="capitalize bg-secondary/50 text-muted-foreground hover:bg-secondary/50">{member.role}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(member.joined_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right pr-6">
                                                {member.user_id !== team.owner_id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Invitations List */}
                {invitations.length > 0 && (
                    <div className="rounded-3xl glass border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Pending Invitations</h2>
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">{pendingInvites} Pending</span>
                        </div>
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-6">Email</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sent</TableHead>
                                    {isAdmin && <TableHead className="text-right pr-6">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.map((invitation) => (
                                    <TableRow key={invitation.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                        <TableCell className="font-medium pl-6">{invitation.email}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize border-white/10 text-muted-foreground">{invitation.role}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                {getStatusIcon(invitation.status)}
                                                <span className="capitalize text-muted-foreground">{invitation.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right pr-6">
                                                {invitation.status === 'pending' && (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white/10"
                                                            onClick={async () => {
                                                                const link = `${window.location.origin}/join-team?token=${invitation.token}`;
                                                                await navigator.clipboard.writeText(link);
                                                                toast.success("Invite link copied to clipboard");
                                                            }}
                                                            title="Copy Invite Link"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleCancelInvitation(invitation.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeamDashboard;
