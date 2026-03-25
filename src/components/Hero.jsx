import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative pt-16 pb-8 md:pt-24 md:pb-12 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-white/10 text-xs font-medium text-muted-foreground mb-8 animate-fade-in hover:bg-secondary/70 transition-colors cursor-default">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    New Version 2.0 is Live
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4 animate-slide-up [animation-delay:100ms]">
                    <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Consistent Locators.
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shimmer">
                        Consistent Teams.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up [animation-delay:200ms]">
                    Stop fighting with brittle selectors. Generate robust, AI-powered locators instantly and synchronize them across your entire QA team.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:300ms]">
                    <Link
                        to="/auth/login"
                        className="h-10 px-6 flex items-center justify-center rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
                    >
                        Start for Free
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                    <Link
                        to="/documentation"
                        className="h-10 px-6 flex items-center justify-center rounded-full bg-secondary/50 text-foreground font-medium text-sm hover:bg-secondary border border-white/5 hover:border-white/20 transition-all duration-300 w-full sm:w-auto"
                    >
                        Read Documentation
                        <Terminal className="ml-2 w-4 h-4 text-muted-foreground" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
