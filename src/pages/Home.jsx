import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, MapPin, Star, Plane, Camera, Users } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { destinations } from '../data/destinations';
import DestinationCard from '../components/DestinationCard';
import Doodle from '../components/Doodle';
import AutoScrollMarquee from '../components/AutoScrollMarquee';
import TravelAtmosphere from '../components/TravelAtmosphere';
import ScrollReveal from '../components/ScrollReveal';
import JourneyScene from '../components/JourneyScene';
import HomeHero from '../components/HomeHero';
import ScrollManifesto from '../components/ScrollManifesto';
import WhyChoose from '../components/WhyChoose';
import TravelTestimonials from '../components/TravelTestimonials';
import AdventureCTA from '../components/AdventureCTA';

const Home = () => {
    // Select specific trending destinations
    const trendingIds = ['alleppey', 'maldives', 'dubai', 'thailand', 'vietnam', 'manali'];
    // Filter and sort by the order of trendingIds to maintain specific order
    const trendingDestinations = trendingIds
        .map(id => destinations.find(d => d.id === id))
        .filter(Boolean); // Filter out any undefined if ID not found
    return (
        <div className="min-h-screen bg-background overflow-x-clip">
            <HomeHero />

            {/* Stats Strip */}
            <StatsStrip />

            <ScrollManifesto />

            <section className="bg-[#f5f1e9] pt-12 md:pt-20">
                <div className="container">
                    <div className="flex items-end justify-between gap-4 mb-6"><div><p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Follow your feeling</p><h2 className="text-2xl md:text-4xl tracking-tight">What kind of escape are you?</h2></div><Link to="/destinations" className="hidden sm:inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-600">See the collection <ArrowRight className="h-4 w-4" /></Link></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
                        {[
                            { id: 'manali', title: 'Chase the mountain air.', label: 'For the adventure seekers' },
                            { id: 'maldives', title: 'Find your island time.', label: 'For the slow-living lovers' },
                            { id: 'dubai', title: 'Get lost in city lights.', label: 'For the curious explorers' },
                        ].map((escape, index) => {
                            const destination = destinations.find(item => item.id === escape.id);
                            if (!destination) return null;
                            return <ScrollReveal key={escape.id} tilt={index === 1 ? 2 : -2}><Link to={`/destinations/${escape.id}`} className="relative group block h-40 md:h-64 overflow-hidden rounded-2xl bg-slate-800 focus-visible:outline-2 focus-visible:outline-primary"><img src={destination.image} alt={destination.name} width="480" height="320" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" /><div className="absolute inset-x-5 bottom-5 text-white"><p className="text-[10px] uppercase tracking-widest text-orange-200 mb-2">{escape.label}</p><p className="text-xl md:text-2xl font-bold leading-tight pr-5">{escape.title}</p><ArrowRight className="h-4 w-4 absolute right-0 bottom-1" /></div></Link></ScrollReveal>;
                        })}
                    </div>
                </div>
            </section>

            <WhyChoose />

            <JourneyScene />

            {/* Trending / Preview Section */}
            <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
                <TravelAtmosphere />
                {/* Dynamic Background Elements (hidden on mobile for performance) */}
                <div className="hidden md:block absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2"></div>
                <div className="hidden md:block absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] translate-y-1/4"></div>
                <Doodle Icon={Plane} className="top-[10%] right-[8%] rotate-12" size={38} duration={8} opacityClass="text-orange-300/15" />
                <Doodle Icon={Camera} className="bottom-[14%] left-[6%]" size={32} duration={7} delay={0.6} opacityClass="text-orange-300/15" />

                <div className="container relative z-10 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-20 gap-6 md:gap-8">
                        <ScrollReveal className="text-center md:text-left" tilt={-3}>
                            <span className="text-orange-400 font-black uppercase tracking-[0.3em] text-xs mb-4 md:mb-6 block drop-shadow-sm">Handpicked for you</span>
                            <h2 className="text-5xl md:text-8xl font-black mb-4 md:mb-6 leading-none group">
                                <span className="text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-10 transition-transform duration-700 group-hover:translate-x-4 inline-block">Trending</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-300 to-yellow-200 drop-shadow-[0_15px_35px_rgba(251,146,60,0.4)] px-1 relative z-20 transition-transform duration-700 group-hover:-translate-x-4 inline-block">Getaways</span>
                            </h2>
                            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">Curated domestic and international favorites that our community loves right now.</p>
                        </ScrollReveal>
                        <Link to="/destinations" className="btn btn-outline border-white/20 text-white hover:bg-primary hover:border-primary hover:text-white group px-8 py-4 rounded-xl transition-all shadow-2xl">
                            Explore All Destinations <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="relative z-10">
                    <AutoScrollMarquee label="Trending getaways" speed={56}>
                        {trendingDestinations.map((dest) => (
                            <div key={dest.id} className="w-[min(84vw,340px)] md:w-[380px] shrink-0 text-slate-900">
                                <DestinationCard destination={dest} />
                            </div>
                        ))}
                    </AutoScrollMarquee>
                </div>

                <div className="container relative z-10 mt-6 text-center md:hidden">
                    <Link to="/destinations" className="btn btn-outline w-full border-white/20 text-white hover:bg-white hover:text-slate-900">
                        View All Destinations
                    </Link>
                </div>
            </section>

            {/* Testimonials Section - Bento Scroll Design */}
            <TravelTestimonials />

            {/* Google Review Interaction Section */}
            <GoogleReviewSection />

            <AdventureCTA />

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                @keyframes kenburns {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

const CountUpNumber = ({ value, suffix = '', duration = 1.8 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.6 });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        let start = null;
        const target = value;
        let frame;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / (duration * 1000), 1);
            // easeOutQuad for a satisfying deceleration
            const eased = 1 - (1 - progress) * (1 - progress);
            setDisplay(Math.floor(eased * target));
            if (progress < 1) frame = requestAnimationFrame(step);
            else setDisplay(target);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [isInView, value, duration]);

    return (
        <span ref={ref}>{display.toLocaleString()}{suffix}</span>
    );
};

const statsData = [
    { icon: Users, value: 1000, suffix: '+', label: 'Happy Travellers' },
    { icon: MapPin, value: 50, suffix: '+', label: 'Destinations Curated' },
    { icon: Star, value: 4.9, suffix: '/5', label: 'Average Google Rating', decimal: true },
    { icon: Globe, value: 12, suffix: '+', label: 'Years of Experience' },
];

const StatsStrip = () => (
    <section className="relative bg-slate-900 text-white border-t border-white/10" aria-label="Travel Episodes in numbers">
        <div className="container py-8 md:py-10">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-orange-300 font-bold mb-6">Small team. A world of happy stories.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {statsData.map((stat) => (
                    <div key={stat.label} className="border-l border-white/15 pl-4 md:pl-6">
                        <div className="flex items-center gap-3 mb-2"><stat.icon className="w-4 h-4 text-orange-300 shrink-0" /><div className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {stat.decimal ? '4.9' : <CountUpNumber value={stat.value} suffix={stat.suffix} />}
                            {stat.decimal && stat.suffix}
                        </div></div>
                        <div className="text-[10px] md:text-xs font-medium text-slate-400 leading-relaxed">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const GoogleReviewSection = () => {
    const [hoveredStar, setHoveredStar] = React.useState(0);
    const googleReviewUrl = "https://search.google.com/local/writereview?placeid=ChIJm_IsG5qLUjoRtK0n28jO8Zc";

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                How was your <span className="text-primary italic">Adventure?</span>
                            </h2>
                            <p className="text-slate-600 mb-8 text-lg">
                                Your feedback helps us create better journeys for everyone. Share your experience and rate us on Google!
                            </p>
                            <div className="flex flex-col gap-4">
                                <a
                                    href={googleReviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary flex items-center justify-center gap-3 px-8 py-4 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 group"
                                >
                                    Write a Review on Google
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <a
                                    href="https://www.google.com/search?q=travel+episodes&sca_esv=8ed44501168e219b&sxsrf=ANbL-n4qUXKmCzAXjRa9yke29GZN0SEePg%3A1769767074482&ei=ooB8aYuMHbrg4-EPo-Oh4QY&ved=0ahUKEwiL5byOgLOSAxU68DgGHaNxKGwQ4dUDCBE&uact=5&oq=travel+episodes&gs_lp=Egxnd3Mtd2l6LXNlcnAiD3RyYXZlbCBlcGlzb2RlczIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeMgYQABgHGB4yBRAAGIAEMgYQABgHGB5I8g1QvwpYvwpwAngAkAEAmAGjA6ABmAWqAQcyLTEuMC4xuAEDyAEA-AEBmAIEoAKuBcICChAAGIAEGLADGA3CAgkQABiwAxgNGB6YAwCIBgGQBgeSBwkyLjAuMS4wLjGgB44LsgcHMi0xLjAuMbgHpgXCBwUwLjIuMsgHDoAIAA&sclient=gws-wiz-serp#mpd=~7405983415351859377/customers/reviews"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-500 hover:text-primary transition-colors text-center text-sm font-semibold underline underline-offset-4 flex items-center justify-center gap-2"
                                >
                                    <img src="/google-logo.png" alt="Google" className="w-4 h-4 object-contain" />
                                    See all Google reviews
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-8 shadow-inner border border-slate-50">
                            <div className="text-center mb-6">
                                <div className="text-5xl font-extrabold text-slate-900 mb-1">4.9</div>
                                <div className="text-slate-400 text-sm font-medium uppercase tracking-widest">Average Rating</div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-1 mb-8">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.button
                                        key={i}
                                        type="button"
                                        aria-label={`Rate your trip ${i} out of 5 on Google`}
                                        onMouseEnter={() => setHoveredStar(i)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => window.open(googleReviewUrl, '_blank', 'noopener,noreferrer')}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative min-h-11 min-w-11 flex items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-all duration-300 ${i <= (hoveredStar || 5)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-slate-200'
                                                }`}
                                        />
                                        {hoveredStar === i && (
                                            <motion.div
                                                layoutId="star-glow"
                                                className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full -z-10"
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                <img src="/google-logo.png" alt="Google" className="w-6 h-6 object-contain" />
                                Trustworthy reviews from Google
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative elements (hidden on mobile for performance) */}
            <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
            <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div>
        </section>
    );
};

export default Home;
