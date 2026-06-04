import { useRef, useEffect } from 'react';

/**
 * Hook to apply an interactive 3D tilt effect to a React element.
 * Calculates cursor position relative to the element and applies transform rotations and reflection variables.
 * 
 * @param {Object} options Configuration parameters for the tilt effect
 * @param {number} options.max Maximum rotation angle in degrees (default: 12)
 * @param {number} options.perspective Perspective distance in px (default: 1000)
 * @param {number} options.scale Scale multiplier on hover (default: 1.03)
 * @param {number} options.speed Transition speed in ms (default: 200)
 */
export default function use3DTilt(options = {}) {
    const elementRef = useRef(null);
    const { max = 12, perspective = 1000, scale = 1.03, speed = 200, disabled = false } = options;

    useEffect(() => {
        if (disabled) return;
        const el = elementRef.current;
        if (!el) return;

        const onMouseEnter = () => {
            el.style.transition = `transform ${speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
        };

        const onMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Map mouse coordinates to range [-0.5, 0.5]
            const x = (mouseX / width) - 0.5;
            const y = (mouseY / height) - 0.5;

            // X rotation corresponds to Y offset, Y rotation corresponds to X offset
            const rotateX = (-y * max).toFixed(2);
            const rotateY = (x * max).toFixed(2);

            el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
            
            // Generate percentages for the dynamic glare effect
            const glareX = ((mouseX / width) * 100).toFixed(2);
            const glareY = ((mouseY / height) * 100).toFixed(2);
            el.style.setProperty('--glare-x', `${glareX}%`);
            el.style.setProperty('--glare-y', `${glareY}%`);
        };

        const onMouseLeave = () => {
            el.style.transition = `transform 600ms cubic-bezier(0.23, 1, 0.32, 1)`;
            el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            el.style.setProperty('--glare-x', `50%`);
            el.style.setProperty('--glare-y', `50%`);
        };

        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('mouseleave', onMouseLeave);

        // Set initial glare values
        el.style.setProperty('--glare-x', `50%`);
        el.style.setProperty('--glare-y', `50%`);

        return () => {
            el.removeEventListener('mouseenter', onMouseEnter);
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [max, perspective, scale, speed]);

    return elementRef;
}
