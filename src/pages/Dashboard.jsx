import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/client";
import {
    Plus,
    Code,
    Activity,
    ArrowRight,
    Clock,
    Shield,
    Settings,
    Zap,
    Layout as LayoutIcon,
    Users,
    Trash2,
    Edit,
    ExternalLink,
    X as CloseIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import Countdown from "@/components/ui/Countdown";

const Dashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [trialDaysLeft, setTrialDaysLeft] = useState(0);
    const [uniqueOffer, setUniqueOffer] = useState(null);

    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || "User";
    const currentHour = new Date().getHours();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                navigate("/auth/login");
            } else if (profile && !profile.isVerified) {
                // Redirect to verification page if not verified
                navigate(`/auth/verify?email=${encodeURIComponent(user.email)}`);
            }
        }
    }, [user, profile, isLoading, navigate]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!user) return;
                const { data } = await apiClient.get('/profile');
                if (data.success && data.profile) {
                    setProfile(data.profile);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoadingProfile(false);
            }
        };
        if (user) fetchProfile();
        else setLoadingProfile(false);
    }, [user]);

    const fetchProjects = async () => {
        if (!user) return;
        setLoadingProjects(true);
        try {
            // Check for individual projects
            try {
                const { data } = await apiClient.get('/projects');
                setProjects(data.projects || []);
            } catch (error) {
                console.warn("Projects API might not exist yet");
                setProjects([]);
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoadingProjects(false);
        }
    };

    useEffect(() => {
        if (user) fetchProjects();
    }, [user]);

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) {
            toast.error("Please enter a project name");
            return;
        }

        setIsCreating(true);
        try {
            const { data } = await apiClient.post('/projects', { name: newProjectName.trim() });
            toast.success("Project created successfully!");
            setProjects([data.project, ...projects]);
            setIsCreateModalOpen(false);
            setNewProjectName("");
        } catch (error) {
            console.error("Error creating project:", error);
            toast.error("Failed to create project. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProject = async (id) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            await apiClient.delete(`/projects/${id}`);
            toast.success("Project deleted");
            setProjects(projects.filter(p => p.id !== id));
        } catch (error) {
            toast.error("Failed to delete project");
        }
    };

    // Trial Calculation & Offer Generation
    useEffect(() => {
        const checkTrialAndOffer = async () => {
            try {
                if (!user || isLoading) return;

                // 1. Calculate Trial Status
                const createdAt = new Date(user.created_at);
                if (isNaN(createdAt.getTime())) {
                    console.error("Invalid user creation date");
                    return;
                }

                const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
                const now = new Date();
                const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
                setTrialDaysLeft(daysLeft);

                // 2. If Trial Expired, Generate/Fetch Offer
                if (daysLeft <= 0) {
                    try {
                        const { data } = await apiClient.post('/promo/generate-trial-offer');
                        if (data && data.success && data.promo) {
                            setUniqueOffer(data.promo);
                        }
                    } catch (err) {
                        console.warn("Promo generation skipped or error:", err);
                    }
                }
            } catch (error) {
                console.error("Error checking trial/offer:", error);
                // Don't toast here to avoid spamming the user on every dashboard load if something minor fails
            }
        };
        checkTrialAndOffer();
    }, [user, isLoading]);

    // Trial Calculation & Offer Generation
    const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-6 flex flex-col gap-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-secondary/10 border border-white/5 p-6 md:p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[150px] rounded-full mix-blend-screen opacity-30 pointer-events-none -mt-20 -mr-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                            Personal Workspace
                        </span>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                            {greeting}, {firstName}
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Ready to generate some locators today? Manage your projects and track your efficiency.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus size={18} />
                            New Project
                        </button>

                        <Link
                            to="/playground"
                            className="flex items-center gap-2 px-5 py-3 rounded-full bg-secondary/30 text-white font-medium hover:bg-secondary/50 border border-white/10 transition-all hover:border-white/20"
                        >
                            <Code size={18} />
                            Playground
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Shield}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                    value={profile?.plan ? (profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) + ' Plan') : "Free Plan"}
                    label="Current Tier"
                    subtext="Upgrade for unlimited"
                />
                <StatCard
                    icon={Zap}
                    color="text-yellow-400"
                    bg="bg-yellow-500/10"
                    value="0"
                    label="Locators Generated"
                    subtext="Last 30 days"
                />
                <StatCard
                    icon={LayoutIcon}
                    color="text-purple-400"
                    bg="bg-purple-500/10"
                    value="0"
                    label="Active Projects"
                    subtext="Across all teams"
                />
                <StatCard
                    icon={Activity}
                    color="text-green-400"
                    bg="bg-green-500/10"
                    value="100%"
                    label="System Status"
                    subtext="Operational"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects (Placeholder) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Code className="w-5 h-5 text-primary" />
                            Your Projects
                        </h2>
                        {projects.length > 0 && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group"
                            >
                                <Plus size={14} /> Add New
                            </button>
                        )}
                    </div>

                    {/* Project List */}
                    <div className="grid gap-4">
                        {loadingProjects ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : projects.length > 0 ? (
                            projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onDelete={() => handleDeleteProject(project.id)}
                                />
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-secondary/5 p-12 text-center flex flex-col items-center justify-center text-muted-foreground group hover:border-white/20 hover:bg-secondary/10 transition-all cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Plus className="w-8 h-8 opacity-50" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-1">No projects yet</h3>
                                <p className="text-sm max-w-xs mx-auto">Create your first project to start organizing your locators.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Quick Links */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Quick Actions
                    </h2>

                    <div className="rounded-2xl border border-white/5 bg-secondary/10 overflow-hidden divide-y divide-white/5">
                        <ActionLink to="/team" icon={Users} title="Manage Team" desc="Invite members & roles" />
                        <ActionLink to="/settings" icon={Settings} title="Settings" desc="Profile & preferences" />
                        <ActionLink to="/pricing" icon={Shield} title="Billing" desc="Manage subscription" />
                    </div>

                    {/* Dynamic Offer Card */}
                    {trialDaysLeft > 0 ? (
                        <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-6 border border-green-500/30">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-400" /> Premium Trial Active
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                You have <strong>{trialDaysLeft} days</strong> left of full access. Enjoy!
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 p-6 border border-white/10">
                            <h3 className="font-bold text-white mb-2">Did you know?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                You can export your locators directly to Selenium/Playwright format.
                            </p>
                            <Link to="/pricing" className="text-xs font-bold text-primary hover:underline">
                                Upgrade Plan &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Project Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="glass border-white/10 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Enter a name for your new project to start organizing locators.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="e.g. E-commerce Login"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="bg-secondary/20 border-white/10 focus:border-primary/50 text-white"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="text-muted-foreground hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateProject}
                            disabled={isCreating}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            {isCreating ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const ProjectCard = ({ project, onDelete }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-white/5 hover:border-white/10 transition-all group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <LayoutIcon size={20} />
            </div>
            <div>
                <h4 className="font-semibold text-white group-hover:text-primary transition-colors">{project.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock size={12} />
                    Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" aria-label="Edit project" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5">
                <Edit size={14} />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                aria-label="Delete project"
                className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                <Trash2 size={14} />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Open project" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                <ExternalLink size={14} />
            </Button>
        </div>
    </div>
);

const StatCard = ({ icon: Icon, color, bg, value, label, subtext }) => (
    <div className="p-5 rounded-3xl bg-secondary/10 border border-white/5 hover:border-white/10 hover:bg-secondary/20 transition-all group">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${bg} ${color}`}>
                <Icon size={20} />
            </div>
            {/* Optional Trend Indicator could go here */}
        </div>
        <div>
            <h3 className="text-3xl font-display font-bold text-white mb-1 group-hover:scale-105 origin-left transition-transform">{value}</h3>
            <p className="text-sm font-medium text-white/80">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </div>
    </div>
);

const ActionLink = ({ to, icon: Icon, title, desc }) => (
    <Link to={to} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
        <div className="p-2 rounded-xl bg-white/5 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-medium text-white group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
    </Link>
);

export default Dashboard;
