import { MousePointer2Icon, Share2Icon, ShieldCheckIcon, ZapIcon, LayersIcon, ActivityIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

const features = [
    {
        title: "15+ Advanced Locators",
        description: "Generate resilient locators including Absolute/Relative XPath, CSS, ID, and Contains. Optimized for Selenium, Playwright, and Cypress.",
        icon: LayersIcon,
        className: "md:col-span-2",
        gradient: "from-blue-600/10 to-indigo-600/10 hover:shadow-glow-cyan"
    },
    {
        title: "Real-Time Validation",
        description: "Every locator is instantly evaluated against the live DOM, verifying its uniqueness with live Match Badges before you copy.",
        icon: ActivityIcon,
        className: "",
        gradient: "from-purple-600/10 to-pink-600/10 hover:shadow-glow-purple"
    },
    {
        title: "Team Sync",
        description: "Share verified locators instantly. Synchronize your team's test automation suite without Slack copy-pasting.",
        icon: Share2Icon,
        className: "",
        gradient: "from-purple-600/10 to-indigo-600/10 hover:shadow-glow-purple"
    },
    {
        title: "Visual Inspector",
        description: "Point and hover to capture elements. LocatorX automatically inspects the DOM nodes and outputs optimized selector combinations.",
        icon: MousePointer2Icon,
        className: "md:col-span-2",
        gradient: "from-indigo-600/10 to-cyan-600/10 hover:shadow-glow-cyan"
    },
];

const FeatureCard = ({ feature }) => {
    return (
        <div
            className={cn(
                "group relative overflow-hidden glass-panel p-8 rounded-3xl border border-white/6 transition-all duration-500 hover:border-primary/40 transform-gpu",
                feature.className
            )}
        >
            {/* Background gradient overlay */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-br pointer-events-none",
                feature.gradient
            )} />

            {/* Neon Glow Light Corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Card Content */}
            <div className="relative z-10 h-full flex flex-col justify-between gap-10">
                <div className="w-12 h-12 rounded-2xl bg-white/3 flex items-center justify-center border border-white/8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 transition-all duration-500 scale-spring">
                    <feature.icon className="w-5 h-5 text-foreground group-hover:text-white transition-colors" />
                </div>

                <div>
                    <h3 className="text-xl font-bold text-foreground mb-3 font-display tracking-tight group-hover:text-primary transition-colors">
                        {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/90 transition-colors text-sm">
                        {feature.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

const Features = () => {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background drift meshes */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-display font-black text-foreground">
                        Everything you need to <span className="animated-gradient-text">automate faster</span>
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Built by QA engineers, for QA engineers. We solve the biggest pain point in Selenium and Playwright testing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
