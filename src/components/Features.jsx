import { MousePointer2Icon, Share2Icon, ShieldCheckIcon, ZapIcon, LayersIcon, ActivityIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import use3DTilt from '@/hooks/use3DTilt';

const features = [
    {
        title: "15+ Advanced Locators",
        description: "Generate resilient locators including Absolute/Relative XPath, CSS, ID, and Contains. Optimized for Selenium, Playwright, and Cypress.",
        icon: LayersIcon,
        className: "md:col-span-2",
        gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
        title: "Real-Time Validation",
        description: "Every locator is instantly evaluated against the live DOM, verifying its uniqueness with live Match Badges before you copy.",
        icon: ActivityIcon,
        className: "",
        gradient: "from-purple-500/20 to-indigo-500/20"
    },
    {
        title: "Team Sync",
        description: "Share verified locators instantly. No more copy-pasting from Slack.",
        icon: Share2Icon,
        className: "",
        gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
        title: "Visual Inspector",
        description: "Point and hover to capture elements. We handle the heavy lifting of uniqueness verification.",
        icon: MousePointer2Icon,
        className: "md:col-span-2",
        gradient: "from-orange-500/20 to-red-500/20"
    },
];

const FeatureCard = ({ feature }) => {
    // 3D Tilt Hook for interactive card rotation
    const cardRef = use3DTilt({ max: 8, scale: 1.025, speed: 150 });

    return (
        <div
            ref={cardRef}
            className={cn(
                "group relative overflow-hidden rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-glow transform-gpu",
                feature.className
            )}
            style={{
                transformStyle: 'preserve-3d',
            }}
        >
            {/* Dynamic Glass Glare Reflection (moves with mouse) */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                style={{
                    background: `radial-gradient(350px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.08), transparent 45%)`
                }}
            />

            {/* Background gradient overlay */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br pointer-events-none",
                feature.gradient
            )} />

            {/* Inner elements floating in 3D */}
            <div className="relative z-10 h-full flex flex-col justify-between gap-8" style={{ transform: 'translateZ(25px)' }}>
                <div className="w-12 h-12 rounded-xl bg-secondary/70 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500">
                    <feature.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
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
        <section className="py-12 relative overflow-hidden">
            {/* Tech background elements */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                        Everything you need to <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">automate faster</span>
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Built by QA engineers, for QA engineers. We solve the biggest pain point in Selenium and Playwright testing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(260px,auto)]">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
