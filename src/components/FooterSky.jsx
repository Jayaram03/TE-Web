import { useEffect, useId, useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import useMobileMotion from './useMobileMotion';
import './footerSky.css';

// Stable, seeded coordinates: no random values or state updates during motion.
const fraction = value => value - Math.floor(value);
const STARS = Array.from({ length: 72 }, (_, index) => ({
    left: `${3 + fraction(Math.sin((index + 1) * 127.1) * 43758.5453) * 94}%`,
    top: `${2 + fraction(Math.sin((index + 1) * 311.7) * 19642.349) * 91}%`,
    '--star-size': `${index % 11 === 0 ? 2 : 1}px`,
    '--star-opacity': 0.25 + (index % 6) * 0.09,
    animationDelay: `${-(index % 13)}s`,
    animationDuration: `${6 + index % 7}s`,
}));

const FooterCloud = ({ prefix, index }) => (
    <svg className={`footer-sky-cloud footer-sky-cloud-${index}`} viewBox="0 0 320 110" focusable="false">
        <defs>
            <linearGradient id={`${prefix}-cloud-${index}`} x2="0" y2="1">
                <stop stopColor="#fff" stopOpacity="0.86" />
                <stop offset="0.55" stopColor="#f3f9ff" stopOpacity="0.55" />
                <stop offset="1" stopColor="#aacde3" stopOpacity="0.08" />
            </linearGradient>
        </defs>
        <path d="M9 77C3 61 19 49 42 52C43 30 68 21 92 34C108 6 149 8 166 31C193 18 222 30 226 50C251 38 276 48 279 65C300 61 317 73 310 86C293 108 30 110 9 77Z" fill={`url(#${prefix}-cloud-${index})`} />
        <path d="M37 81Q66 60 94 70Q123 39 158 58Q194 39 216 69Q247 54 282 84" fill="none" stroke="#fff" strokeOpacity="0.28" />
    </svg>
);

const FooterSky = () => {
    const ref = useRef(null);
    const visible = useInView(ref);
    const mobile = useMobileMotion();
    const reduced = useReducedMotion();
    const prefix = `footer-sky-${useId().replace(/:/g, '')}`;
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const farY = useTransform(scrollYProgress, [0, 1], [12, -18]);
    const nearY = useTransform(scrollYProgress, [0, 1], [20, -32]);

    // One document-visibility subscription gates both sky and rotating earth.
    useEffect(() => {
        const footer = ref.current.closest('footer');
        const syncVisibility = () => { footer.dataset.documentVisible = String(!document.hidden); };
        syncVisibility();
        document.addEventListener('visibilitychange', syncVisibility);
        return () => {
            document.removeEventListener('visibilitychange', syncVisibility);
            delete footer.dataset.documentVisible;
        };
    }, []);

    const parallax = visible && !mobile && !reduced;
    return (
        <div ref={ref} className={`footer-sky ${visible ? 'is-active' : ''}`} aria-hidden="true">
            <div className="footer-sky-day">
                <span className="footer-sky-atmosphere" />
                <span className="footer-sky-sun"><span className="footer-sky-sun-disc" /></span>
                <motion.div className="footer-sky-cloud-layer" style={parallax ? { y: farY } : undefined}>
                    <FooterCloud prefix={prefix} index={1} /><FooterCloud prefix={prefix} index={2} />
                </motion.div>
                <motion.div className="footer-sky-cloud-layer footer-sky-clouds-near" style={parallax ? { y: nearY } : undefined}>
                    <FooterCloud prefix={prefix} index={3} />
                </motion.div>
            </div>
            <div className="footer-sky-night">
                <div className="footer-sky-stars">
                    {(mobile ? STARS.slice(0, 32) : STARS).map((style, index) => <span key={index} className="footer-sky-star" style={style} />)}
                </div>
                <svg className="footer-sky-moon" viewBox="0 0 120 120" focusable="false">
                    <defs>
                        <radialGradient id={`${prefix}-moon`} cx="72%" cy="30%" r="76%">
                            <stop stopColor="#f6f8fa" /><stop offset="0.55" stopColor="#cdd6df" /><stop offset="1" stopColor="#748698" />
                        </radialGradient>
                        <radialGradient id={`${prefix}-crater`} cx="65%" cy="70%">
                            <stop stopColor="#edf2f6" stopOpacity="0.12" /><stop offset="0.8" stopColor="#536779" stopOpacity="0.35" /><stop offset="1" stopColor="#eef4f8" stopOpacity="0.3" />
                        </radialGradient>
                        <radialGradient id={`${prefix}-shade`} cx="28%" cy="45%" r="72%">
                            <stop offset="0.55" stopColor="#091524" stopOpacity="0.94" /><stop offset="0.72" stopColor="#091524" stopOpacity="0.84" /><stop offset="0.88" stopColor="#091524" stopOpacity="0" />
                        </radialGradient>
                        <clipPath id={`${prefix}-disc`}><circle cx="60" cy="60" r="45" /></clipPath>
                    </defs>
                    <g clipPath={`url(#${prefix}-disc)`}>
                        <circle cx="60" cy="60" r="45" fill={`url(#${prefix}-moon)`} />
                        <path d="M69 23Q92 26 91 44T98 68Q76 82 70 64T52 46Q48 29 69 23M43 79Q59 66 66 86T87 96L59 103Z" fill="#64788a" opacity="0.18" />
                        {[[81, 37, 7], [90, 61, 5], [74, 81, 9], [56, 30, 4], [96, 78, 3], [62, 57, 6], [83, 94, 4]].map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={`url(#${prefix}-crater)`} />)}
                        <circle cx="60" cy="60" r="45" fill={`url(#${prefix}-shade)`} />
                    </g>
                    <circle cx="60" cy="60" r="44.7" fill="none" stroke="#dce8f0" strokeOpacity="0.13" strokeWidth="0.6" />
                </svg>
            </div>
        </div>
    );
};

export default FooterSky;