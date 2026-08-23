import { BookIcon, CodeIcon, GlobeIcon, ShieldIcon, ZapIcon } from '@/components/icons';
import { Button } from "@/components/ui/button";

const docSections = [
    {
        title: 'Getting Started',
        items: [
            { id: 'introduction', label: 'Introduction' },
            { id: 'features', label: 'Key Features' }
        ]
    },
    {
        title: 'Locator Strategies',
        items: [
            { id: 'strategies', label: 'Supported Strategies' },
            { id: 'frameworks', label: 'Framework Support' }
        ]
    },
    {
        title: 'Guides',
        items: [
            { id: 'usage', label: 'Usage Guide' }
        ]
    }
];

const Documentation = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header / Hero */}
            <section className="relative py-16 px-6 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                        Help Center
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-4">
                        Documentation
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-xl">
                        Everything you need to integrate, scale, and master LocatorX locator generation.
                    </p>
                </div>
            </section>

            {/* Layout Wrapper */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* 1. Left Sidebar: Category Navigation */}
                    <aside className="w-full lg:w-60 shrink-0 lg:block hidden">
                        <div className="sticky top-28 space-y-8">
                            {docSections.map((group, gIdx) => (
                                <div key={gIdx} className="space-y-3">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider opacity-60">
                                        {group.title}
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        {group.items.map((item) => (
                                            <li key={item.id}>
                                                <a 
                                                    href={`#${item.id}`} 
                                                    className="block text-muted-foreground hover:text-white transition-colors py-1 pl-1 border-l border-white/5 hover:border-primary/40 pl-3 -ml-[1px]"
                                                >
                                                    {item.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* 2. Center Panel: Reading Content */}
                    <main className="flex-1 space-y-16">
                        
                        {/* Top Resource Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 text-primary">
                                    <ZapIcon size={18} />
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">Quick Start</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Get up and running with LocatorX in less than 5 minutes.
                                </p>
                                <Button variant="outline" size="sm" className="w-full">Read Guide</Button>
                            </div>

                            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 text-primary">
                                    <CodeIcon size={18} />
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">API Reference</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Detailed endpoints and object reference for developers.
                                </p>
                                <Button variant="outline" size="sm" className="w-full">View API</Button>
                            </div>

                            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 text-primary">
                                    <ShieldIcon size={18} />
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">Security</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Learn about how we handle data and authentication securely.
                                </p>
                                <Button variant="outline" size="sm" className="w-full">Security Policy</Button>
                            </div>
                        </div>

                        {/* Reading Sections */}
                        <div className="prose dark:prose-invert max-w-none space-y-16">
                            
                            <section id="introduction" className="scroll-mt-24">
                                <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Introduction</h2>
                                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                    LocatorX is a powerful browser extension designed to assist test automation engineers by automatically generating and managing robust web element locators.
                                    Whether you use Selenium, Playwright, or Cypress, LocatorX streamlines your workflow by providing instant, reliable selectors.
                                </p>
                            </section>

                            <section id="features" className="scroll-mt-24 border-t border-white/5 pt-10">
                                <h2 className="text-2xl font-black text-white mb-6">Key Features</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FeatureDocCard title="Dual Interface" desc="Seamlessly switch between rapid locator generation and managing your saved locator vault." />
                                    <FeatureDocCard title="Smart Filters" desc="Enable or disable specific locator types to reduce noise and focus on what you need." />
                                    <FeatureDocCard title="Persistent Storage" desc="Save your locators locally, manage history, and export data with persistent localStorage management." />
                                    <FeatureDocCard title="Theme System" desc="Built-in Light and Dark modes with smooth transitions to match your preference." />
                                </div>
                            </section>

                            <section id="strategies" className="scroll-mt-24 border-t border-white/5 pt-10">
                                <h2 className="text-2xl font-black text-white mb-6">Supported Strategies</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                    LocatorX generates over 15 distinct types of locators to ensure you always have the most robust option available:
                                </p>

                                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                                    <table className="w-full text-left border-collapse font-mono text-xs">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/3">
                                                <th className="py-3 px-4 font-bold text-white">Strategy Type</th>
                                                <th className="py-3 px-4 font-bold text-white">Example Selector Output</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-blue-400">ID</td>
                                                <td className="py-3 px-4 text-indigo-200">#element-id</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-blue-400">CSS Selector</td>
                                                <td className="py-3 px-4 text-indigo-200">div.container &gt; button.primary</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-purple-400">Relative XPath</td>
                                                <td className="py-3 px-4 text-indigo-200">//div[@class='btn']//span</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-purple-400">Text XPath</td>
                                                <td className="py-3 px-4 text-indigo-200">//button[text()='Submit']</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-green-400">Attributes</td>
                                                <td className="py-3 px-4 text-indigo-200">[data-testid="submit-btn"]</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-[11px] text-muted-foreground italic mt-3">* Includes support for Name, ClassName, TagName, LinkText, Partial LinkText, Absolute XPath, and more.</p>
                            </section>

                            <section id="frameworks" className="scroll-mt-24 border-t border-white/5 pt-10">
                                <h2 className="text-2xl font-black text-white mb-6">Framework Support</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-0 list-none">
                                    <FrameworkCard name="Selenium" desc="Full locator support (Java, Python, C#)" />
                                    <FrameworkCard name="Playwright" desc="Optimized for CSS and Text selectors" />
                                    <FrameworkCard name="Cypress" desc="Custom logic including cy.get validation" />
                                </ul>
                            </section>

                            <section id="usage" className="scroll-mt-24 border-t border-white/5 pt-10 pb-16">
                                <h2 className="text-2xl font-black text-white mb-6">Usage Guide</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/35 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm m-0">Install Extension</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Load the extension in Chrome/Edge Developer Mode or download from the Web Store.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/35 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm m-0">Open Sidepanel</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Click the extension icon to reveal the robust side panel interface.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/35 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm m-0">Start Scanning</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Click the "Inspect" button and hover over any element on the page to analyze it.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/35 flex items-center justify-center font-bold text-sm shrink-0">4</div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm m-0">Select & Manage</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Click an element to generate locators, then Copy or Save them to your vault.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </main>

                    {/* 3. Right Sidebar: Outline Tracker */}
                    <aside className="w-48 shrink-0 xl:block hidden">
                        <div className="sticky top-28 space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider opacity-60">On This Page</h3>
                            <ul className="space-y-2.5 text-xs text-muted-foreground border-l border-white/5 ml-1 pl-4">
                                <li><a href="#introduction" className="block hover:text-primary transition-colors">Introduction</a></li>
                                <li><a href="#features" className="block hover:text-primary transition-colors">Key Features</a></li>
                                <li><a href="#strategies" className="block hover:text-primary transition-colors">Strategies</a></li>
                                <li><a href="#frameworks" className="block hover:text-primary transition-colors">Frameworks</a></li>
                                <li><a href="#usage" className="block hover:text-primary transition-colors">Usage Guide</a></li>
                            </ul>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
};

const FeatureDocCard = ({ title, desc }) => {
    return (
        <div className="glass p-5 rounded-2xl border border-white/5 hover:border-primary/25 transition-all">
            <h3 className="text-sm font-bold text-white mb-1 mt-0">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    );
};

const FrameworkCard = ({ name, desc }) => {
    return (
        <li className="glass p-4 rounded-2xl text-center border border-white/5 hover:border-primary/25 transition-all list-none">
            <strong className="block text-white text-sm mb-0.5">{name}</strong>
            <span className="text-[11px] text-muted-foreground">{desc}</span>
        </li>
    );
};

export default Documentation;
