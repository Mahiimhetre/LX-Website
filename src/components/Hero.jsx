import { Link } from 'react-router-dom';
import { ArrowRightIcon, TerminalIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

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
                    <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link to="/auth/login">
                            Start for Free
                            <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                        <Link to="/documentation">
                            Read Documentation
                            <TerminalIcon className="w-4 h-4 ml-1 text-muted-foreground" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
