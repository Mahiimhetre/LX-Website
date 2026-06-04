import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * TiltCard - Wraps children in a div with the 3D mouse-over tilt effect.
 * Includes a spotlight glare overlay on hover.
 */
const TiltCard = ({ className, children, glare = true, max = 6, scale = 1.015, speed = 300 }) => {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onMouseEnter = () => {
            el.style.transition = `transform ${speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
        };
        const onMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
            el.style.setProperty('--glare-x', `${((x + 0.5) * 100).toFixed(2)}%`);
            el.style.setProperty('--glare-y', `${((y + 0.5) * 100).toFixed(2)}%`);
        };
        const onMouseLeave = () => {
            el.style.transition = `transform 600ms cubic-bezier(0.23, 1, 0.32, 1)`;
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            el.style.setProperty('--glare-x', '50%');
            el.style.setProperty('--glare-y', '50%');
        };

        el.style.setProperty('--glare-x', '50%');
        el.style.setProperty('--glare-y', '50%');
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('mouseleave', onMouseLeave);

        return () => {
            el.removeEventListener('mouseenter', onMouseEnter);
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [max, scale, speed]);

    return (
        <div
            ref={ref}
            className={cn('relative overflow-hidden transform-gpu group', className)}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {glare && (
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
                    style={{ background: `radial-gradient(350px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.06), transparent 60%)` }}
                />
            )}
            {children}
        </div>
    );
};

export default TiltCard;
