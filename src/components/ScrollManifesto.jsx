import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue } from 'framer-motion';
import { Compass, Plane, Sparkles } from 'lucide-react';
import useMobileMotion from './useMobileMotion';

const ManifestoScene = ({ sceneRef, scrollYProgress, reducedMotion, mobile = false }) => {
    const fill = useTransform(scrollYProgress, [0, 0.9], ['0% 100%, 100% 100%', '100% 100%, 100% 100%']);
    const leftX = useTransform(scrollYProgress, [0, 1], mobile ? [-4, 0] : [-30, 12]);
    const rightX = useTransform(scrollYProgress, [0, 1], mobile ? [4, 0] : [30, -12]);
    const rotate = useTransform(scrollYProgress, [0, 1], mobile ? [-2, 0] : [-12, 6]);
    const planeX = useTransform(scrollYProgress, [0, 1], ['0%', '90%']);

    return (
        <section ref={sceneRef} className="relative bg-[#f5f1e9] py-16 md:py-24 overflow-hidden">
            <div className="container text-center">
                <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[0.25em] mb-8">Some things can’t be bookmarked. They have to be lived.</p>
                <motion.h2 className="scroll-ink mx-auto max-w-5xl text-[clamp(36px,6.5vw,86px)] leading-[1.08] tracking-[-0.04em] font-black" style={reducedMotion || mobile ? { backgroundSize: '100% 100%' } : { backgroundSize: fill }} initial={mobile ? { opacity: 0, y: 20 } : false} whileInView={mobile ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true }} transition={{ duration: 0.5 }}>Take the long way.<br />Stay for the sunset.<br />Bring home a story.</motion.h2>
                <div className="manifesto-tags flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-8 md:mt-12">
                    <motion.span style={reducedMotion ? undefined : { x: leftX, rotate }} className="manifesto-tag inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-100 px-4 py-3 text-xs font-bold text-primary-dark"><Compass className="h-4 w-4 shrink-0" /> Less routine</motion.span>
                    <span className="manifesto-tag-caption inline-flex items-center gap-2 text-xs text-slate-500"><Sparkles className="h-4 w-4 shrink-0 text-primary" /> More remember-this-forever</span>
                    <motion.span style={reducedMotion ? undefined : { x: rightX, rotate }} className="manifesto-tag inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-700"><Plane className="h-4 w-4 shrink-0" /> More discovery</motion.span>
                </div>
                <div className="relative mt-10 mx-auto max-w-lg h-7 text-primary/60" aria-hidden="true">
                    <svg viewBox="0 0 500 24" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="none" stroke="currentColor"><path d="M0 20Q125 -12 250 12T500 5" strokeDasharray="3 7" /></svg>
                    <motion.div className="absolute top-0 w-full" style={reducedMotion ? { x: '45%' } : { x: planeX }}><Plane className="h-5 w-5 rotate-45" /></motion.div>
                </div>
            </div>
        </section>
    );
};

const DesktopManifesto = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
    return <ManifestoScene sceneRef={ref} scrollYProgress={scrollYProgress} reducedMotion={false} />;
};

const StaticManifesto = () => {
    const progress = useMotionValue(1);
    return <ManifestoScene scrollYProgress={progress} reducedMotion />;
};

const MobileManifesto = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
    return <ManifestoScene sceneRef={ref} scrollYProgress={scrollYProgress} reducedMotion={false} mobile />;
};

const ScrollManifesto = () => {
    const mobile = useMobileMotion();
    const reducedMotion = useReducedMotion();
    return reducedMotion ? <StaticManifesto /> : mobile ? <MobileManifesto /> : <DesktopManifesto />;
};

export default ScrollManifesto;