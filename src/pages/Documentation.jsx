import { Book, Code, Globe, Shield, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Documentation = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        Documentation
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        Everything you need to integrate and use LocatorX effectively.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Quick Start */}
                        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Quick Start</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Get up and running with LocatorX in less than 5 minutes.
                            </p>
                            <Button variant="outline" className="w-full">Read Guide</Button>
                        </div>

                        {/* API Reference */}
                        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                                <Code className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">API Reference</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Detailed endpoints and object reference for developers.
                            </p>
                            <Button variant="outline" className="w-full">View API</Button>
                        </div>

                        {/* Security */}
                        <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Security</h3>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Learn about how we handle data and authentication.
                            </p>
                            <Button variant="outline" className="w-full">Security Policy</Button>
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col md:flex-row gap-12">
                        {/* Table of Contents / Sidebar */}
                        <aside className="hidden md:block w-64 space-y-6 shrink-0">
                            <div className="sticky top-24 space-y-4">
                                <h3 className="font-bold text-foreground">On this page</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground border-l border-white/10 ml-2">
                                    <li><a href="#introduction" className="block pl-4 hover:text-primary transition-colors hover:border-l-2 border-primary -ml-[1px]">Introduction</a></li>
                                    <li><a href="#features" className="block pl-4 hover:text-primary transition-colors hover:border-l-2 border-primary -ml-[1px]">Key Features</a></li>
                                    <li><a href="#strategies" className="block pl-4 hover:text-primary transition-colors hover:border-l-2 border-primary -ml-[1px]">Locator Strategies</a></li>
                                    <li><a href="#frameworks" className="block pl-4 hover:text-primary transition-colors hover:border-l-2 border-primary -ml-[1px]">Framework Support</a></li>
                                    <li><a href="#usage" className="block pl-4 hover:text-primary transition-colors hover:border-l-2 border-primary -ml-[1px]">Usage Guide</a></li>
                                </ul>
                            </div>
                        </aside>

                        {/* Main Documentation Content */}
                        <div className="flex-1 prose dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">

                            <section id="introduction">
                                <h2 className="text-3xl font-bold mb-4">Introduction</h2>
                                <p className="text-lg leading-relaxed">
                                    LocatorX is a powerful browser extension designed to assist test automation engineers by automatically generating and managing robust web element locators.
                                    Whether you use Selenium, Playwright, or Cypress, LocatorX streamlines your workflow by providing instant, reliable selectors.
                                </p>
                            </section>

                            <section id="features" className="mt-12 pt-8 border-t border-white/5">
                                <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-2 mt-0">Dual Interface</h3>
                                        <p className="text-sm">Separate tabs for <strong>Home</strong> (rapid locator generation) and <strong>POM</strong> (Page Object Model management).</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-2 mt-0">Smart Filters</h3>
                                        <p className="text-sm">Enable or disable specific locator types to reduce noise and focus on what you need.</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-2 mt-0">Persistent Storage</h3>
                                        <p className="text-sm">Save your locators locally, manage history, and export data with persistent <code>localStorage</code> management.</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-2 mt-0">Theme System</h3>
                                        <p className="text-sm">Built-in Light and Dark modes with smooth transitions to match your preference.</p>
                                    </div>
                                </div>
                            </section>

                            <section id="strategies" className="mt-12 pt-8 border-t border-white/5">
                                <h2 className="text-2xl font-bold mb-6">Locator Strategies</h2>
                                <p>LocatorX generates over 15 distinct types of locators to ensure you always have the most robust option available:</p>

                                <div className="overflow-x-auto mt-6">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="py-3 px-4 font-semibold text-white">Type</th>
                                                <th className="py-3 px-4 font-semibold text-white">Example</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            <tr className="border-b border-white/5 bg-white/5">
                                                <td className="py-3 px-4 font-medium text-blue-400">ID</td>
                                                <td className="py-3 px-4 font-mono">#element-id</td>
                                            </tr>
                                            <tr className="border-b border-white/5">
                                                <td className="py-3 px-4 font-medium text-blue-400">CSS Selector</td>
                                                <td className="py-3 px-4 font-mono">div.container &gt; button.primary</td>
                                            </tr>
                                            <tr className="border-b border-white/5 bg-white/5">
                                                <td className="py-3 px-4 font-medium text-purple-400">Relative XPath</td>
                                                <td className="py-3 px-4 font-mono">//div[@class='btn']//span</td>
                                            </tr>
                                            <tr className="border-b border-white/5">
                                                <td className="py-3 px-4 font-medium text-purple-400">Text XPath</td>
                                                <td className="py-3 px-4 font-mono">//button[text()='Submit']</td>
                                            </tr>
                                            <tr className="border-b border-white/5 bg-white/5">
                                                <td className="py-3 px-4 font-medium text-green-400">Attributes</td>
                                                <td className="py-3 px-4 font-mono">[data-testid="submit-btn"]</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm italic mt-4">* Includes support for Name, ClassName, TagName, LinkText, Partial LinkText, Absolute XPath, and more.</p>
                            </section>

                            <section id="frameworks" className="mt-12 pt-8 border-t border-white/5">
                                <h2 className="text-2xl font-bold mb-6">Framework Support</h2>
                                <ul className="grid md:grid-cols-3 gap-4 list-none pl-0">
                                    <li className="bg-secondary/20 border border-white/5 p-4 rounded-lg text-center">
                                        <strong className="block text-white text-lg mb-1">Selenium</strong>
                                        <span className="text-xs">Full locator support (Java, Python, C#)</span>
                                    </li>
                                    <li className="bg-secondary/20 border border-white/5 p-4 rounded-lg text-center">
                                        <strong className="block text-white text-lg mb-1">Playwright</strong>
                                        <span className="text-xs">Optimized for CSS and Text selectors</span>
                                    </li>
                                    <li className="bg-secondary/20 border border-white/5 p-4 rounded-lg text-center">
                                        <strong className="block text-white text-lg mb-1">Cypress</strong>
                                        <span className="text-xs">Custom logic including <code>cy.get</code> validation</span>
                                    </li>
                                </ul>
                            </section>

                            <section id="usage" className="mt-12 pt-8 border-t border-white/5 pb-20">
                                <h2 className="text-2xl font-bold mb-6">How to Usage</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white shrink-0">1</div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg m-0">Install Extension</h4>
                                            <p className="m-1">Load the extension in Chrome/Edge Developer Mode or download from the Web Store.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white shrink-0">2</div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg m-0">Open Sidepanel</h4>
                                            <p className="m-1">Click the extension icon to reveal the robust side panel interface.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white shrink-0">3</div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg m-0">Start Scanning</h4>
                                            <p className="m-1">Click the "Inspect" button and hover over any element on the page to analyze it.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white shrink-0">4</div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg m-0">Select & Manage</h4>
                                            <p className="m-1">Click an element to generate locators, then Copy or Save them to your Project.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Documentation;
