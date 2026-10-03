import { useRef, useId } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Compass, MapPin, Plane } from 'lucide-react';
import { getMonthlyFeatures } from '../data/monthlyFeatures';
import useMobileMotion from './useMobileMotion';

const flightStars = Array.from({ length: 40 }, (_, index) => ({
    left: `${(index * 37 + 11) % 100}%`,
    top: `${(index * 23 + 7) % 100}%`,
    size: index % 5 === 0 ? 4 : 2,
}));

const SkyCloud = ({ className }) => {
    const id = useId();
    return (
        <svg className={`flight-cloud ${className}`} viewBox="0 0 400 160" fill="none">
            <defs>
                <linearGradient id={id} x1="200" y1="15" x2="200" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e2e8f0" stopOpacity="0.34" /><stop offset="0.5" stopColor="#c7d2fe" stopOpacity="0.13" /><stop offset="1" stopColor="#94a3b8" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d="M12 116C5 94 25 79 49 82C48 52 78 33 110 47C126 6 187 0 217 39C250 21 293 38 299 70C331 58 354 76 351 95C378 91 398 107 389 126C376 151 39 158 12 116Z" fill={`url(#${id})`} />
            <path d="M37 117C69 90 92 109 110 90C139 61 178 86 197 70C226 47 261 69 271 90C309 76 341 103 363 116C320 140 95 146 37 117Z" fill={`url(#${id})`} opacity="0.55" />
        </svg>
    );
};

const routeX = progress => 7 * Math.sin(progress * Math.PI * 4);
const flightRoute = Array.from({ length: 101 }, (_, index) => {
    const progress = index / 100;
    return `${index ? 'L' : 'M'}${18 + routeX(progress)} ${progress * 400}`;
}).join(' ');

const FlightAtmosphere = ({ progress, reducedMotion }) => {
    const ref = useRef(null);
    const mobile = useMobileMotion();
    const visible = useInView(ref);
    const cloudX = useTransform(progress, [0, 1], [-24, 48]);
    const cloudY = useTransform(progress, [0, 1], [24, -90]);
    const cloudOpacity = useTransform(progress, [0, 0.06, 0.2, 0.5, 1], mobile ? [0, 0, 0.75, 0.6, 0.3] : [0.12, 0.2, 0.75, 0.6, 0.3]);
    const nearCloudY = useTransform(progress, [0, 1], [40, -150]);
    const starsY = useTransform(progress, [0, 1], [0, -36]);
    const starsOpacity = useTransform(progress, [0, 0.35, 0.8, 1], [0.4, 0.65, 0.95, 0.85]);
    return (
        <div ref={ref} className={`hero-flight-atmosphere ${visible && !reducedMotion ? 'is-active' : ''}`} aria-hidden="true">
            <div className="hero-sky-viewport">
                <div className="hero-sky-horizon" />
                <motion.div className="hero-flight-stars" style={reducedMotion ? undefined : { y: starsY, opacity: starsOpacity }}>
                    {flightStars.map((star, index) => <span key={index} className={star.size === 4 ? 'flight-star flight-star-spark' : 'flight-star'} style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: `${index * -0.7}s` }} />)}
                </motion.div>
                <motion.div className="hero-flight-clouds" style={reducedMotion ? undefined : { x: cloudX, y: cloudY, opacity: cloudOpacity }}>
                    <SkyCloud className="flight-cloud-one" /><SkyCloud className="flight-cloud-two" />
                </motion.div>
                <motion.div className="hero-flight-clouds hero-clouds-near" style={reducedMotion ? undefined : { y: nearCloudY, opacity: cloudOpacity }}>
                    <SkyCloud className="flight-cloud-three" /><SkyCloud className="flight-cloud-four" />
                </motion.div>
            </div>
        </div>
    );
};

const FlightDestination = ({ destination, index, progress, reducedMotion }) => {
    const arrival = 0.08 + index * 0.16;
    const range = [Math.max(0, arrival - 0.14), arrival + 0.1];
    const y = useTransform(progress, range, [28, 0]);
    const x = useTransform(progress, range, [index % 2 ? 10 : -10, 0]);
    const scale = useTransform(progress, range, [0.84, 1]);
    const rotate = useTransform(progress, range, [index % 2 ? 7 : -7, index % 2 ? 1.5 : -1.5]);
    const opacity = useTransform(progress, range, [0.38, 1]);
    const imageScale = useTransform(progress, range, [1.2, 1]);
    const glintX = useTransform(progress, range, ['-130%', '150%']);
    return (
        <motion.div className="hero-flight-card" style={reducedMotion ? undefined : { x, y, scale, rotate, opacity }}>
            <Link to={`/destinations/${destination.id}`} className="hero-flight-card-link" aria-label={`Explore ${destination.name}`}>
                <motion.img src={destination.image} alt={destination.name} width="360" height="240" decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} style={reducedMotion ? undefined : { scale: imageScale }} />
                <div className="hero-flight-card-shade" />
                {!reducedMotion && <motion.div className="hero-flight-card-glint" aria-hidden="true" style={{ x: glintX }} />}
                <span className="hero-flight-stop">{String(index + 1).padStart(2, '0')} <MapPin size={10} /></span>
                <div className="hero-flight-card-copy"><p>{destination.name}</p><span>{destination.tagline}</span></div>
                <ArrowUpRight className="hero-flight-card-arrow" size={14} aria-hidden="true" />
            </Link>
        </motion.div>
    );
};

const HeroScene = ({ visualRef, progress, reducedMotion }) => {
    // All scroll choreography is transform/opacity only, with no scroll setState.
    const planeY = useTransform(progress, [0, 1], ['0%', '100%']);
    const planeX = useTransform(progress, routeX);
    const bank = useTransform(progress, value => 135 - Math.atan(7 * Math.PI * 4 * Math.cos(value * Math.PI * 4) / 400) * 180 / Math.PI);
    const routeOpacity = useTransform(progress, [0, 1], [0.35, 0.85]);
    const ticketScale = useTransform(progress, [0.8, 1], [0.94, 1]);
    const ticketOpacity = useTransform(progress, [0.8, 1], [0.45, 1]);
    const picks = getMonthlyFeatures().hero;

    return (
        <section className={`home-hero ${reducedMotion ? 'home-hero-static' : ''}`}>
            <div className="home-hero-stage">
                <FlightAtmosphere progress={progress} reducedMotion={reducedMotion} />
                <div className="container hero-layout relative z-10">
                    <div className="hero-copy">
                        <p className="hero-eyebrow flex items-center gap-2 text-orange-300 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4"><Compass className="w-4 h-4 shrink-0" /> Not just a trip. Your next episode.</p>
                        <h1 className="text-[clamp(42px,7vw,98px)] leading-[0.96] tracking-[-0.05em] font-black text-white mb-5"><span className="md:hidden"><span className="block">Go somewhere</span><span className="block text-orange-300">you’ll never stop</span><span className="block">talking about.</span></span><span className="hidden md:inline">Go somewhere<br /><span className="text-orange-300">you’ll never</span><br />stop talking about.</span></h1>
                        <p className="text-sm md:text-lg text-slate-300 leading-relaxed max-w-md mb-6">A different kind of everyday.<br className="md:hidden" /> We’ll plan the details. You make the memories.</p>
                        <div className="hero-actions flex flex-wrap gap-3">
                            <Link to="/destinations" className="btn btn-primary gap-2 px-5 py-3.5 text-sm">Find my escape <ArrowUpRight className="w-4 h-4" /></Link>
                            <Link to="/enquiry" className="btn border border-white/25 text-white hover:bg-white/10 px-5 py-3.5 text-sm">Make it personal</Link>
                        </div>
                        {!reducedMotion && <p className="hero-scroll-hint"><ArrowDown className="w-4 h-4" /> Scroll to fly somewhere new</p>}
                    </div>
                    <div ref={visualRef} className={`hero-visual-track ${reducedMotion ? 'hero-visual-static' : ''}`}>
                        <div className="hero-visual-stage">
                            <div className="hero-flight-heading"><span><span className="hero-flight-live-dot" /> This month’s flight plan</span><span>05 places / endless possibilities</span></div>
                            <div className="hero-flight-scene">
                                <div className="hero-flight-route" aria-hidden="true">
                                    <motion.svg className="hero-flight-route-curve" viewBox="0 0 36 400" preserveAspectRatio="none" fill="none" style={reducedMotion ? undefined : { opacity: routeOpacity }}>
                                        <path d={flightRoute} stroke="#fdba74" strokeWidth="1.2" strokeDasharray="3 6" vectorEffect="non-scaling-stroke" />
                                    </motion.svg>
                                    <motion.div className="hero-flight-plane-carrier" style={reducedMotion ? { y: '100%' } : { y: planeY, x: planeX }}>
                                        <span className="hero-plane-wake" />
                                        <motion.div className="hero-flight-plane" style={reducedMotion ? { rotate: 135 } : { rotate: bank }}><Plane size={24} strokeWidth={1.8} /></motion.div>
                                    </motion.div>
                                    {[0, 1, 2].map(stop => <span key={stop} className={`hero-flight-waypoint hero-flight-waypoint-${stop}`} />)}
                                </div>
                                <div className="hero-flight-grid">
                                    {picks.map((destination, index) => <FlightDestination key={destination.id} destination={destination} index={index} progress={progress} reducedMotion={reducedMotion} />)}
                                    <motion.div className="hero-flight-ticket" style={reducedMotion ? undefined : { scale: ticketScale, opacity: ticketOpacity }}>
                                        <span className="hero-ticket-label">Next departure</span>
                                        <p>You. Somewhere<br /><span>extraordinary.</span></p>
                                        <Link to="/enquiry">Let’s make it happen <ArrowUpRight size={13} /></Link>
                                    </motion.div>
                                </div>
                            </div>
                            <p className="hero-monthly-note"><span>Your out-of-office starts here.</span>{!reducedMotion && <span className="flex items-center gap-1"><ArrowDown className="h-3 w-3" /> Keep flying</span>}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const AnimatedHero = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.25', 'end 0.85'] });
    const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 26, mass: 0.25 });
    return <HeroScene visualRef={ref} progress={progress} reducedMotion={false} />;
};

const StaticHero = () => {
    const progress = useMotionValue(1);
    return <HeroScene progress={progress} reducedMotion />;
};

const HomeHero = () => {
    const reducedMotion = useReducedMotion();
    return reducedMotion ? <StaticHero /> : <AnimatedHero />;
};

export default HomeHero;