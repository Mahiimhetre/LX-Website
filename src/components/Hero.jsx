import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, TerminalIcon, CodeIcon, CopyIcon, CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

const Hero = () => {
    const [activeTab, setActiveTab] = useState('playwright');
    const [copied, setCopied] = useState(false);

    const locatorCode = {
        cypress: `// cypress selector
cy.get('[data-testid="email-input"]')
  .type('hello@locatorx.ai')`,
        playwright: `// playwright selector
await page.locator('[data-testid="email-input"]')
  .fill('hello@locatorx.ai')`,
        selenium: `// selenium selector
driver.findElement(By.cssSelector(
  "[data-testid='email-input']"
)).sendKeys("hello@locatorx.ai")`,
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(locatorCode[activeTab]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/15 blur-[130px] rounded-full opacity-60 pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full opacity-40 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* Left Column: Heading and description */}
                    <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/3 border border-white/8 text-xs font-semibold text-muted-foreground animate-fade-in hover:bg-white/6 transition-colors cursor-default backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Version 2.0 is Live
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.1] animate-slide-up [animation-delay:100ms]">
                            Consistent Locators.<br />
                            <span className="animated-gradient-text">
                                Consistent Teams.
                            </span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed animate-slide-up [animation-delay:200ms]">
                            Stop fighting with brittle selectors. Generate robust, AI-powered locators instantly and synchronize them across your entire QA team.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-4 animate-slide-up [animation-delay:300ms]">
                            <Button asChild size="lg" className="w-full sm:w-auto shadow-glow shadow-primary/20">
                                <Link to="/auth/login">
                                    Start for Free
                                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                                <Link to="/documentation">
                                    Read Docs
                                    <TerminalIcon className="w-4 h-4 ml-1 text-muted-foreground" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Premium Interactive Mockup Compiler */}
                    <div className="lg:col-span-5 w-full flex justify-center items-center mockup-container animate-fade-in [animation-delay:250ms]">
                        <div className="mockup-card rounded-2xl border border-white/10 bg-black/45 backdrop-blur-2xl p-5 w-full max-w-lg text-left font-mono text-xs flex flex-col gap-4 relative overflow-hidden">
                            {/* Card Glow Underlay */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full opacity-60 pointer-events-none" />

                            {/* Top Control Bar */}
                            <div className="flex items-center justify-between border-b border-white/8 pb-3">
                                <div className="flex gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/30" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/30" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600/30" />
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/5 border border-white/8 text-[9px] text-muted-foreground">
                                    <CodeIcon size={10} />
                                    <span>locator-inspector.jsx</span>
                                </div>
                            </div>

                            {/* DOM Inspector Mock */}
                            <div className="bg-white/3 border border-white/5 rounded-lg p-3 space-y-1.5">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex justify-between items-center">
                                    <span>DOM ELEMENT</span>
                                    <span className="text-green-400 bg-green-500/10 border border-green-500/20 px-1 py-0.2 rounded text-[8px]">Verifying...</span>
                                </div>
                                <div className="text-white text-xs leading-relaxed">
                                    <span className="text-blue-400">&lt;input</span> <span className="text-purple-400">type</span>=<span className="text-amber-400">"email"</span> <span className="text-purple-400">data-testid</span>=<span className="text-amber-400">"email-input"</span> <span className="text-purple-400">className</span>=<span className="text-amber-400">"input-capsule"</span> <span className="text-blue-400">/&gt;</span>
                                </div>
                            </div>

                            {/* Code Selector Tabs */}
                            <div className="flex gap-1.5 border-b border-white/8 pb-0.5">
                                {['playwright', 'cypress', 'selenium'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 rounded-t-lg font-bold text-[10px] capitalize transition-all border-t border-x ${
                                            activeTab === tab
                                                ? 'bg-white/5 text-primary border-white/10'
                                                : 'text-muted-foreground hover:text-white border-transparent'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Code Output Panel */}
                            <div className="relative bg-black/40 rounded-lg p-4 min-h-[90px] flex items-center justify-between border border-white/5 group/code">
                                <pre className="text-[11px] leading-relaxed text-indigo-200">
                                    <code>{locatorCode[activeTab]}</code>
                                </pre>

                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-white/5 hover:bg-primary/20 rounded-md border border-white/8 hover:border-primary/40 text-muted-foreground hover:text-white transition-all scale-spring"
                                    aria-label="Copy code block"
                                >
                                    {copied ? (
                                        <CheckIcon size={14} className="text-green-400" />
                                    ) : (
                                        <CopyIcon size={14} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
