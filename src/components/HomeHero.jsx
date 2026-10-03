import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Compass, MapPin, Plane } from 'lucide-react';
import { destinations } from '../data/destinations';

const HeroPostcard = ({ destination, className, style, caption }) => (
    <motion.div className={`hero-postcard ${className}`} style={style}>
        <Link to={`/destinations/${destination.id}`} className="block rounded-2xl bg-white p-2 md:p-3 shadow-xl focus-visible:outline-2 focus-visible:outline-orange-400">
            <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-slate-700">
                <img src={destination.image} alt={destination.name} decoding="async" width="320" height="400" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white"><MapPin className="h-3 w-3 mb-2" /><p className="font-bold text-base md:text-2xl">{destination.name}</p></div>
            </div>
            <p className="px-1 pt-2 text-[9px] md:text-xs font-semibold text-slate-500">{caption}</p>
        </Link>
    </motion.div>
);

const HomeHero = () => {
    const ref = useRef(null);
    const reducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
    const textY = useTransform(scrollYProgress, [0, 1], [0, -36]);
    const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
    const firstX = useTransform(scrollYProgress, [0, 1], ['0%', '-24%']);
    const firstY = useTransform(scrollYProgress, [0, 1], [0, -52]);
    const firstRotate = useTransform(scrollYProgress, [0, 1], [-9, -20]);
    const secondX = useTransform(scrollYProgress, [0, 1], ['0%', '24%']);
    const secondY = useTransform(scrollYProgress, [0, 1], [0, 24]);
    const secondRotate = useTransform(scrollYProgress, [0, 1], [8, 20]);
    const centerScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
    const orbitRotate = useTransform(scrollYProgress, [0, 1], [-20, 55]);
    const backdropY = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const progress = useTransform(scrollYProgress, [0, 1], [0.04, 1]);
    const planeX = useTransform(scrollYProgress, [0, 1], ['5%', '82%']);
    const picks = ['manali', 'maldives', 'alleppey'].map(id => destinations.find(destination => destination.id === id) || destinations[0]);

    return (
        <section ref={ref} className={`home-hero ${reducedMotion ? 'home-hero-static' : ''}`}>
            <div className="home-hero-stage">
                <motion.div className="hero-topography" aria-hidden="true" style={reducedMotion ? undefined : { y: backdropY }} />
                <div className="container hero-layout relative z-10">
                    <motion.div className="hero-copy" style={reducedMotion ? undefined : { y: textY, scale: textScale }}>
                        <p className="flex items-center gap-2 text-orange-300 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4"><Compass className="w-4 h-4" /> Not just a trip. Your next episode.</p>
                        <h1 className="text-[clamp(42px,7vw,98px)] leading-[0.96] tracking-[-0.05em] font-black text-white mb-5">Go somewhere<br /><span className="text-orange-300">you’ll never</span><br />stop talking about.</h1>
                        <p className="text-sm md:text-lg text-slate-300 leading-relaxed max-w-md mb-6">Mountain air. Island time. A different kind of everyday. We’ll plan the details. You make the memories.</p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/destinations" className="btn btn-primary gap-2 px-5 py-3.5 text-sm">Find my escape <ArrowUpRight className="w-4 h-4" /></Link>
                            <Link to="/enquiry" className="btn border border-white/25 text-white hover:bg-white/10 px-5 py-3.5 text-sm">Make it personal</Link>
                        </div>
                        <p className="hidden lg:flex items-center gap-2 mt-8 text-xs text-slate-400"><ArrowDown className="w-4 h-4" /> Scroll to open up your world</p>
                    </motion.div>
                    <div className="hero-photo-stack">
                        <motion.div className="hero-orbit" aria-hidden="true" style={reducedMotion ? undefined : { rotate: orbitRotate }}><span className="absolute -top-2 left-1/2 h-4 w-4 rounded-full bg-orange-300" /><span className="absolute bottom-0 right-1/4 text-orange-300"><Plane className="h-6 w-6" /></span></motion.div>
                        <HeroPostcard destination={picks[0]} caption="01 / A little mountain magic" className="hero-postcard-left" style={reducedMotion ? { rotate: -9 } : { x: firstX, y: firstY, rotate: firstRotate }} />
                        <HeroPostcard destination={picks[2]} caption="03 / Take the scenic route" className="hero-postcard-right" style={reducedMotion ? { rotate: 8 } : { x: secondX, y: secondY, rotate: secondRotate }} />
                        <HeroPostcard destination={picks[1]} caption="02 / Somewhere worth slowing down" className="hero-postcard-center" style={reducedMotion ? undefined : { scale: centerScale }} />
                        <div className="absolute right-0 -top-2 md:top-1 rounded-full bg-orange-300 text-slate-950 px-4 py-2 text-[10px] md:text-xs font-bold rotate-6 shadow-md z-30">Your out-of-office starts here.</div>
                    </div>
                </div>
                <div className="container hero-flight-line relative" aria-hidden="true">
                    <div className="h-px bg-white/10"><motion.div className="h-full bg-orange-300/60 origin-left" style={reducedMotion ? undefined : { scaleX: progress }} /></div>
                    <motion.div className="absolute -top-2 w-full" style={reducedMotion ? { x: '50%' } : { x: planeX }}><Plane className="w-4 h-4 rotate-45 text-orange-300" /></motion.div>
                </div>
            </div>
        </section>
    );
};

export default HomeHero;