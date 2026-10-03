import { useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/**
 * Decorative travel icons use transform-only CSS animation on all screens.
 * Off-screen icons pause; reduced-motion users get a static decoration.
 */
const Doodle = ({ Icon, className = '', size = 28, duration = 6, delay = 0, rotate = 10, opacityClass = 'text-white/20' }) => {
    const ref = useRef(null);
    const visible = useInView(ref);
    const reducedMotion = useReducedMotion();
    return (
        <div
            ref={ref}
            aria-hidden="true"
            className={`absolute pointer-events-none select-none ${opacityClass} ${className}`}
            style={{ '--doodle-rotate': `${rotate}deg`, animation: reducedMotion ? 'none' : `doodle-float ${duration}s ease-in-out ${delay}s infinite`, animationPlayState: visible ? 'running' : 'paused' }}
        >
            <Icon style={{ width: size, height: size }} strokeWidth={1.5} />
        </div>
    );
};

export default Doodle;
