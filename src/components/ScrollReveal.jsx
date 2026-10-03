import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import useMobileMotion from './useMobileMotion';

const DesktopReveal = ({ children, tilt }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.96', 'start 0.58'] });
    const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
    const rotate = useTransform(scrollYProgress, [0, 1], [tilt, 0]);
    const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(0% 0% 18% 0% round 16px)', 'inset(0% 0% 0% 0% round 0px)']);

    return (
        <div ref={ref}>
            <motion.div className="h-full" style={{ y, scale, rotate, clipPath }}>
                {children}
            </motion.div>
        </div>
    );
};

const ScrollReveal = ({ children, className = '', tilt = 3 }) => {
    const mobile = useMobileMotion();
    const reducedMotion = useReducedMotion();
    return (
        <div className={className}>
            {reducedMotion ? children : mobile ? (
                <motion.div className="h-full" initial={{ opacity: 0, y: 24, scale: 0.96, rotate: tilt }} whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                    {children}
                </motion.div>
            ) : <DesktopReveal tilt={tilt}>{children}</DesktopReveal>}
        </div>
    );
};

export default ScrollReveal;