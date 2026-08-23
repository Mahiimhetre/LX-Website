import { useState, useRef, useEffect } from 'react';
import {  MessageSquare, X, Send, Bot, User, Loader2  } from '@/components/icons';
import apiClient from '@/api/client';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hi! I\'m your Locator-X assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiMetadata, setAiMetadata] = useState({ provider: 'Google Gemini', model: 'gemini-2.5-flash' });
    const scrollRef = useRef(null);
    const widgetRef = useRef(null);

    useOutsideClick(widgetRef, () => {
        if (isOpen) setIsOpen(false);
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const { data } = await apiClient.post('/ai/chat', { message: userMessage });

            if (!data.success) throw new Error(data.message || 'Error communicating with AI');

            setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);

            if (data.meta) {
                setAiMetadata(data.meta);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Add default model to generic name function
    const gptName = aiMetadata.model && aiMetadata.model.includes('gemini')
        ? `Powered by ${aiMetadata.provider} (${aiMetadata.model})`
        : 'Powered by AI';

    return (
        <div ref={widgetRef} className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[450px] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden hover:translate-y-0 hover:transform-none hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="p-4 bg-white/3 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Bot size={18} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground leading-none">Locator-X AI</h3>
                                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} aria-label="Close Chat" className="text-muted-foreground hover:text-foreground transition-colors p-1">
                            <X size={18} />
                        </button>
                    </div>
 
                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                        {messages.map((msg, i) => (
                            <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white/5",
                                    msg.role === 'user' ? "bg-secondary" : "bg-primary/20"
                                )}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-primary" />}
                                </div>
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-primary/85 backdrop-blur-md text-white border border-primary/20 rounded-tr-none shadow-md shadow-primary/10"
                                        : "glass-dark text-foreground border border-white/5 rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-white/5">
                                    <Bot size={14} className="text-primary" />
                                </div>
                                <div className="glass-dark text-foreground border border-white/5 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs">
                                    <Loader2 size={14} className="animate-spin opacity-50" />
                                </div>
                            </div>
                        )}
                    </div>
 
                    {/* Input Area */}
                    <div className="p-3 border-t border-white/5 bg-white/2">
                        <div className="relative flex items-center gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="w-full bg-black/40 border border-white/8 rounded-full px-4 py-2.5 text-xs outline-none focus:border-primary/50 focus:bg-black/60 transition-all pr-10 text-white placeholder:text-muted-foreground/50"
                            />
                            <button
                                onClick={handleSendMessage}
                                aria-label="Send Message"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-1.5 p-1.5 bg-primary text-white rounded-full disabled:opacity-40 hover:scale-105 transition-transform flex items-center justify-center"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                        <p className="text-[9px] text-center text-muted-foreground mt-2 opacity-50">
                            {aiMetadata.model
                                ? `Powered by ${aiMetadata.provider} (${aiMetadata.model})`
                                : 'Powered by Google Gemini (gemini-2.5-flash)'
                            }
                        </p>
                    </div>
                </div>
            )}
 
            {/* Bubble Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
                className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border glass",
                    isOpen
                        ? "bg-secondary/40 text-foreground border-white/12 -rotate-90"
                        : "bg-primary/25 text-white border-primary/45 hover:bg-primary/35 hover:border-primary/60 shadow-[0_8px_24px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_28px_rgba(99,102,241,0.5)]"
                )}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                )}
            </button>
        </div>
    );
};

export default AIChatWidget;
