import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import CountdownTimer from "@/components/ui/Countdown";
import { useState } from "react";

const PromoBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    // Set countdown from environment variable or fallback to 24 hours from now
    const envDate = import.meta.env.VITE_PROMO_TARGET_DATE;
    const targetDate = new Date();

    if (envDate && !isNaN(Date.parse(envDate))) {
        targetDate.setTime(Date.parse(envDate));
    } else {
        targetDate.setHours(targetDate.getHours() + 24);
    }

    if (!isVisible) return null;

    return (
        <div className="relative bg-gradient-to-r from-primary via-purple-600 to-primary background-animate text-white px-4 py-2 flex items-center justify-between sm:justify-center gap-4 text-xs sm:text-sm shadow-lg z-50">
            <div className="flex items-center gap-3">
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-white/20 backdrop-blur-sm">Flash Sale</span>
                <p className="hidden sm:inline">
                    Get <span className="font-bold text-yellow-300">50% OFF</span> Pro Plan. Limited time offer!
                </p>
                <p className="sm:hidden">
                    <span className="font-bold text-yellow-300">50% OFF</span> Pro Plan
                </p>
                <div className="h-4 w-[1px] bg-white/20 mx-1"></div>
                <CountdownTimer targetDate={targetDate} className="text-yellow-100" />
            </div>

            <Link
                to="/pricing"
                className="hidden sm:flex items-center gap-1 bg-white text-primary px-3 py-1 rounded-full text-xs font-bold hover:bg-yellow-100 transition-colors shadow-sm"
            >
                Claim Offer <ArrowRight size={12} />
            </Link>

            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default PromoBanner;
