import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { ArrowUpRight, Compass, MapPin } from 'lucide-react';
import { getMonthlyFeatures } from '../data/monthlyFeatures';
import useMobileMotion from './useMobileMotion';

const JourneyContent = ({ sceneRef, imageRef, scrollYProgress, reducedMotion, mobile = false }) => {
    const destination = getMonthlyFeatures().journey;
    const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
    const rotate = useTransform(scrollYProgress, [0, 0.75], [-5, 0]);
    // On phones, the photo and its frame open together rather than counter-zooming.
    const imageScale = useTransform(scrollYProgress, [0, 1], mobile ? [1, 1.08] : [1.25, 1]);
    const clipPath = useTransform(scrollYProgress, [0, 0.8], ['inset(8% 12% 8% 12% round 80px)', 'inset(0% 0% 0% 0% round 24px)']);
    const textY = useTransform(scrollYProgress, [0, 1], [24, -12]);
    const lineScale = useTransform(scrollYProgress, [0, 1], [0.1, 1]);

    return (
        <section ref={sceneRef} className={`journey-scene relative bg-[#f5f1e9] ${reducedMotion ? 'journey-scene-static' : ''}`}>
            <div className="journey-scene-stage container grid items-center gap-5 lg:grid-cols-2 lg:gap-16">
                <motion.div style={reducedMotion ? undefined : { y: textY }} className="relative z-10">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3 flex items-center gap-2"><Compass className="w-4 h-4" /> A new perspective</p>
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-4">Less ordinary.<br /><span className="text-primary">More out there.</span></h2>
                    <p className="max-w-md text-sm md:text-lg leading-relaxed text-slate-600 mb-4 md:mb-6">Swap your everyday view for somewhere extraordinary. We turn your travel ideas into a journey that feels like you.</p>
                    <Link to="/destinations" className="inline-flex min-h-11 items-center gap-3 font-bold text-slate-900 border-b border-slate-300 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">Find your next chapter <ArrowUpRight className="w-5 h-5" /></Link>
                    <div className="mt-5 h-0.5 bg-slate-200 max-w-48 overflow-hidden" aria-hidden="true"><motion.div className="h-full bg-primary origin-left" style={reducedMotion ? undefined : { scaleX: lineScale }} /></div>
                </motion.div>
                <div ref={imageRef} className="journey-image-anchor relative h-[34svh] sm:h-[40svh] lg:h-[58svh] min-h-44">
                    <motion.div className="journey-image-frame absolute inset-0" style={reducedMotion ? undefined : { scale, rotate }}>
                        <motion.div className="absolute inset-0 overflow-hidden rounded-3xl bg-slate-200" style={reducedMotion || mobile ? undefined : { clipPath }}>
                            <motion.img src={destination.image} alt={`${destination.name}: your next escape`} loading="lazy" decoding="async" className="h-full w-full object-cover" style={reducedMotion ? undefined : { scale: imageScale }} />
                            <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-white"><p className="text-xs uppercase tracking-widest mb-2">Wish you were here</p><p className="text-2xl md:text-4xl font-black">{destination.name}</p></div>
                        </motion.div>
                        <div className="absolute right-0 top-0 md:-right-3 md:-top-3 rotate-6 rounded-2xl bg-white px-4 py-3 shadow-lg border border-orange-100 flex items-center gap-2 text-xs font-bold text-slate-800"><MapPin className="h-4 w-4 text-primary" /> Your next happy place</div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const DesktopJourney = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
    return <JourneyContent sceneRef={ref} scrollYProgress={scrollYProgress} reducedMotion={false} />;
};

const StaticJourney = () => {
    const progress = useMotionValue(1);
    return <JourneyContent scrollYProgress={progress} reducedMotion />;
};

const MobileJourney = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.35'] });
    return <JourneyContent imageRef={ref} scrollYProgress={scrollYProgress} reducedMotion={false} mobile />;
};

const JourneyScene = () => {
    const mobile = useMobileMotion();
    const reducedMotion = useReducedMotion();
    return reducedMotion ? <StaticJourney /> : mobile ? <MobileJourney /> : <DesktopJourney />;
};

export default JourneyScene;