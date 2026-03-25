import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const CountdownTimer = ({ targetDate, className }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const format = (num) => num?.toString().padStart(2, '0') || "00";

    return (
        <div className={cn("flex items-center gap-1 font-mono text-sm font-bold tracking-wider", className)}>
            <span>{format(timeLeft.h)}</span>
            <span className="animate-pulse">:</span>
            <span>{format(timeLeft.m)}</span>
            <span className="animate-pulse">:</span>
            <span>{format(timeLeft.s)}</span>
        </div>
    );
};

export default CountdownTimer;
