import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const ScrollReveal = ({ children, className = '', tilt = 3 }) => {
    const ref = useRef(null);
    const reducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.96', 'start 0.58'] });
    const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
    const rotate = useTransform(scrollYProgress, [0, 1], [tilt, 0]);
    const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(0% 0% 18% 0% round 16px)', 'inset(0% 0% 0% 0% round 0px)']);

    return (
        <div ref={ref} className={className}>
            <motion.div className="h-full" style={reducedMotion ? undefined : { y, scale, rotate, clipPath }}>
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;