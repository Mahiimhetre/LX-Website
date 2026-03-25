import { MousePointer2, Share2, ShieldCheck, Zap, Layers, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
    {
        title: "15+ Advanced Locators",
        description: "Generate resilient locators including Absolute/Relative XPath, CSS, ID, and Contains. Optimized for Selenium, Playwright, and Cypress.",
        icon: Layers,
        className: "md:col-span-2",
        gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
        title: "Real-Time Validation",
        description: "Every locator is instantly evaluated against the live DOM, verifying its uniqueness with live Match Badges before you copy.",
        icon: Activity,
        className: "",
        gradient: "from-purple-500/20 to-indigo-500/20"
    },
    {
        title: "Team Sync",
        description: "Share verified locators instantly. No more copy-pasting from Slack.",
        icon: Share2,
        className: "",
        gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
        title: "Visual Inspector",
        description: "Point and hover to capture elements. We handle the heavy lifting of uniqueness verification.",
        icon: MousePointer2,
        className: "md:col-span-2",
        gradient: "from-orange-500/20 to-red-500/20"
    },
];

const Features = () => {
    return (
        <section className="py-10 relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                        Everything you need to <span className="text-primary">automate faster</span>
                    </h2>
                    <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                        Built by QA engineers, for QA engineers. We solve the biggest pain point in Selenium and Playwright testing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                                feature.className
                            )}
                        >
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                                feature.gradient
                            )} />

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="mb-4 w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <feature.icon className="w-5 h-5 text-foreground" />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
