import { Link } from "react-router-dom";
import { ArrowLeftIcon, UsersIcon, GlobeIcon, AwardIcon, HeartIcon } from '@/components/icons';
import { Button } from "@/components/ui/button";
import use3DTilt from '@/hooks/use3DTilt';

const About = () => {
    const missionRef = use3DTilt({ max: 8, scale: 1.02, speed: 200 });
    const whoWeAreRef = use3DTilt({ max: 8, scale: 1.02, speed: 200 });
    const ctaBtn1Ref = use3DTilt({ max: 12, scale: 1.05, speed: 150 });
    const ctaBtn2Ref = use3DTilt({ max: 12, scale: 1.05, speed: 150 });

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Hero Section */}
                <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-display font-bold">
                        Empowering Teams to <br /> <span className="text-primary">Test Faster</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Locator-X is the intelligent companion for test automation engineers. We replace brittle, manual selectors with robust, AI-generated locators.
                    </p>
                </div>

                {/* Mission Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div 
                        ref={missionRef} 
                        className="p-8 rounded-3xl bg-secondary/10 border border-white/5 space-y-4 relative overflow-hidden group transform-gpu"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Spotlight Glare */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                            style={{
                                background: `radial-gradient(250px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.06), transparent 50%)`
                            }}
                        />
                        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                                <GlobeIcon size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">Our Mission</h3>
                            <p className="text-muted-foreground">
                                To eliminate the "flaky test" problem forever. We believe QA engineers should spend time designing test scenarios, not hunting for CSS classes.
                            </p>
                        </div>
                    </div>

                    <div 
                        ref={whoWeAreRef} 
                        className="p-8 rounded-3xl bg-secondary/10 border border-white/5 space-y-4 relative overflow-hidden group transform-gpu"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Spotlight Glare */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                            style={{
                                background: `radial-gradient(250px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.06), transparent 50%)`
                            }}
                        />
                        <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                                <UsersIcon size={24} />
                            </div>
                            <h3 className="text-2xl font-bold">Who We Are</h3>
                            <p className="text-muted-foreground">
                                A passionate team of developers and QA experts who were tired of maintaining broken Selenium scripts. So we built the tool we wished we had.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-center">Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ValueCard
                            icon={AwardIcon}
                            title="Quality First"
                            desc="We don't ship broken code, and neither should you."
                        />
                        <ValueCard
                            icon={HeartIcon}
                            title="User Obsessed"
                            desc="Every feature is built based on direct feedback from our community."
                        />
                        <ValueCard
                            icon={GlobeIcon}
                            title="Open Standard"
                            desc="We support Selenium, Playwright, and Cypress equally."
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-12 border-t border-white/10">
                    <h2 className="text-2xl font-bold mb-6">Ready to join the revolution?</h2>
                    <div className="flex justify-center gap-4">
                        <Link to="/auth/register">
                            <Button ref={ctaBtn1Ref} size="lg" className="rounded-full px-8 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                                <span style={{ transform: 'translateZ(10px)', display: 'inline-block' }}>Get Started Free</span>
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button ref={ctaBtn2Ref} variant="outline" size="lg" className="rounded-full px-8 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                                <span style={{ transform: 'translateZ(10px)', display: 'inline-block' }}>Contact Us</span>
                            </Button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

const ValueCard = ({ icon: Icon, title, desc }) => {
    const cardRef = use3DTilt({ max: 8, scale: 1.03, speed: 200 });
    return (
        <div 
            ref={cardRef} 
            className="p-6 rounded-2xl bg-secondary/5 border border-white/5 hover:bg-secondary/10 transition-colors text-center relative overflow-hidden group transform-gpu"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* Spotlight Glare */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                style={{
                    background: `radial-gradient(150px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255, 255, 255, 0.08), transparent 50%)`
                }}
            />
            <div className="relative z-10" style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <Icon size={20} />
                </div>
                <h4 className="font-bold text-lg mb-2">{title}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
        </div>
    );
};

export default About;
