import React from 'react';
import { motion } from 'framer-motion';

/**
 * Decorative floating travel-themed icon "doodles". Purely visual, hidden on
 * mobile (md:block) to keep the mobile experience light and fast — these use
 * continuous framer-motion animations which are cheap (transform-only) but
 * we still avoid them on small screens to reduce clutter and GPU usage.
 *
 * `items` is an array of { Icon, className, size, duration, delay, rotate }
 * describing each doodle's position (via className, e.g. "top-20 left-10")
 * and its floating animation parameters.
 */
const Doodle = ({ Icon, className = '', size = 28, duration = 6, delay = 0, rotate = 10, opacityClass = 'text-white/20' }) => (
    <motion.div
        aria-hidden="true"
        className={`hidden md:block absolute pointer-events-none select-none ${opacityClass} ${className}`}
        initial={{ y: 0, rotate: 0, opacity: 0 }}
        animate={{ y: [0, -18, 0], rotate: [0, rotate, 0], opacity: 1 }}
        transition={{
            opacity: { duration: 1, delay },
            y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
            rotate: { duration: duration * 1.3, repeat: Infinity, ease: 'easeInOut', delay },
        }}
    >
        <Icon style={{ width: size, height: size }} strokeWidth={1.5} />
    </motion.div>
);

export default Doodle;
