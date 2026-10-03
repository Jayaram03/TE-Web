import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { destinations } from '../data/destinations';
import ItineraryList from '../components/ItineraryList';
import AttractionsList from '../components/AttractionsList';
import { ArrowLeft, Clock, Calendar, Wallet, CheckCircle2, XCircle, Info, Star, ShieldCheck, Zap, ChevronRight, MessageCircle, Compass, ListChecks, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const DestinationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const destination = destinations.find(d => d.id === id);

    // Scope the parallax scroll tracking to just the hero element (not the
    // whole page). This avoids recalculating transforms on every scroll
    // frame across the entire document, which was causing jank/slowness
    // when scrolling through the long itinerary content below.
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const springConfig = { damping: 30, stiffness: 220, mass: 0.2 };
    const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 120]), springConfig);
    const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.15]), springConfig);
    const opacity = useSpring(useTransform(scrollYProgress, [0, 1], [1, 0]), springConfig);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!destination) {
        return (
            <div className="pt-32 text-center bg-background min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Destination Not Found</h2>
                <Link to="/destinations" className="text-primary hover:underline">Back to Destinations</Link>
            </div>
        );
    }

    return (
        <div className="destination-detail min-h-screen bg-background pb-24 md:pb-20 overflow-x-clip">
            {/* Hero Header */}
            <div ref={heroRef} className="relative h-[70svh] md:h-[75vh] w-full overflow-hidden bg-slate-950">
                <motion.div
                    style={{ y: y1, scale }}
                    className="absolute inset-0 w-full h-full will-change-transform"
                >
                    <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                        fetchPriority="high"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-background"></div>
                    {/* Extra top shade so the fixed navbar always reads clearly over any image */}
                    <div className="absolute top-0 inset-x-0 h-40 md:h-56 bg-gradient-to-b from-black/70 to-transparent"></div>
                </motion.div>

                {/* Breadcrumb + Back Bar — uses the same top offset as every other page's
                    content wrapper (pt-28 md:pt-40) so it reliably clears the fixed navbar
                    at every breakpoint, instead of guessing a shorter custom value. */}
                <div className="relative z-40 pt-28 md:pt-40 px-4 md:px-12">
                    <div className="container !px-0 flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            aria-label="Go back"
                            className="shrink-0 bg-white/15 backdrop-blur-xl p-2.5 md:p-3 rounded-full border border-white/30 text-white hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center group shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <nav className="flex items-center gap-1.5 text-[11px] md:text-sm font-semibold text-white/70 overflow-hidden">
                            <Link to="/" className="hover:text-white transition-colors shrink-0">Home</Link>
                            <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                            <Link to="/destinations" className="hover:text-white transition-colors shrink-0">Destinations</Link>
                            <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                            <span className="text-white truncate">{destination.name}</span>
                        </nav>
                    </div>
                </div>

                <motion.div
                    style={{ opacity }}
                    className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end text-center px-6 pb-10 md:pb-14"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase"
                    >
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        Top Rated Destination
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 text-white drop-shadow-2xl tracking-tighter leading-[0.95]"
                    >
                        {destination.name}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-2xl lg:text-3xl font-medium text-white/90 drop-shadow-lg italic font-serif max-w-3xl"
                    >
                        "{destination.tagline}"
                    </motion.p>
                </motion.div>
            </div>

            {/* Sticky Section Tabs — quick-jump navigation for long content */}
            <div className="detail-section-toolbar sticky z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="container">
                    <nav aria-label="Destination sections" className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-3 px-1">
                        {[
                            { href: '#overview', label: 'Overview', icon: Info },
                            { href: '#itinerary', label: 'Itinerary', icon: Compass },
                            { href: '#inclusions', label: 'Inclusions', icon: ListChecks },
                            { href: '#attractions', label: 'Attractions', icon: Sparkles },
                        ].map((tab) => (
                            <a
                                key={tab.href}
                                href={tab.href}
                                className="shrink-0 min-h-11 flex items-center gap-1.5 px-3.5 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-primary"
                            >
                                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                {tab.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="container pt-6 md:pt-10 relative z-20">
                <div className="bg-white rounded-[2rem] shadow-2xl p-5 sm:p-6 md:p-12 border border-slate-100/50">
                    {/* Quick Info Strip — vivid gradient badges for an instantly scannable, premium feel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pb-10 md:pb-12 mb-10 md:mb-12 border-b border-slate-100">
                        <div className="relative p-4 md:p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 flex flex-col gap-2 md:gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-400 text-[9px] md:text-[10px] uppercase font-black tracking-wider">Duration</p>
                                <p className="font-black text-sm md:text-lg text-slate-900 truncate">{destination.duration}</p>
                            </div>
                        </div>
                        <div className="relative p-4 md:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex flex-col gap-2 md:gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-secondary to-indigo-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-secondary/20">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-400 text-[9px] md:text-[10px] uppercase font-black tracking-wider">Best Time</p>
                                <p className="font-black text-sm md:text-lg text-slate-900 truncate">{destination.bestTime || 'Year Round'}</p>
                            </div>
                        </div>
                        <div className="relative p-4 md:p-5 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 flex flex-col gap-2 md:gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                                <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-400 text-[9px] md:text-[10px] uppercase font-black tracking-wider">Starting</p>
                                <p className="font-black text-sm md:text-lg text-slate-900 truncate">{destination.price}</p>
                            </div>
                        </div>
                        <div className="relative p-4 md:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 flex flex-col gap-2 md:gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-400 text-[9px] md:text-[10px] uppercase font-black tracking-wider">Verified</p>
                                <p className="font-black text-sm md:text-lg text-slate-900 truncate">TE Certified</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
                        {/* Left Content */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* About */}
                            <section id="overview" className="scroll-mt-32">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-1 bg-primary rounded-full"></div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Overview</h2>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black mb-4 text-slate-900 tracking-tight">About {destination.name}</h3>
                                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                                    {destination.description}
                                </p>
                            </section>

                            {/* Itinerary */}
                            <div id="itinerary" className="scroll-mt-32">
                                {destination.itinerary ? (
                                    <ItineraryList itinerary={destination.itinerary} />
                                ) : (
                                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
                                        <h3 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
                                            <Info className="w-5 h-5" />
                                            Detailed Itinerary
                                        </h3>
                                        <p className="text-slate-600">
                                            We offer fully customizable itineraries for {destination.name}.
                                            Please contact us to get a day-wise plan tailored to your preferences.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Inclusions & Exclusions */}
                            <div id="inclusions" className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 scroll-mt-32">
                                <section className="bg-gradient-to-br from-green-50/70 to-white rounded-2xl border border-green-100 p-6">
                                    <h3 className="text-lg font-black mb-5 text-slate-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Inclusions
                                    </h3>
                                    <ul className="space-y-3.5">
                                        {(destination.inclusions || [
                                            "Accommodation in deluxe hotels/resorts",
                                            "Daily breakfast and dinner",
                                            "Sightseeing in private AC vehicle",
                                            "Professional driver/guide support",
                                            "All toll taxes and parking fees"
                                        ]).map((inc, i) => (
                                            <li key={i} className="flex gap-3 text-slate-700 text-sm md:text-base">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                {inc}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="bg-gradient-to-br from-red-50/70 to-white rounded-2xl border border-red-100 p-6">
                                    <h3 className="text-lg font-black mb-5 text-slate-900 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-500" />
                                        Exclusions
                                    </h3>
                                    <ul className="space-y-3.5">
                                        {(destination.exclusions || [
                                            "Flight/Train tickets",
                                            "Entry tickets to monuments/parks",
                                            "Personal expenses (laundry, calls)",
                                            "Travel insurance",
                                            "Anything not mentioned in inclusions"
                                        ]).map((exc, i) => (
                                            <li key={i} className="flex gap-3 text-slate-700 text-sm md:text-base">
                                                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                {exc}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-8">
                            {/* Booking CTA Widget */}
                            <div className="detail-booking-panel lg:sticky">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-slate-900 rounded-3xl p-7 md:p-8 text-white relative overflow-hidden group shadow-2xl border border-white/10"
                                >
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-3xl group-hover:bg-primary/40 transition-colors"></div>
                                    <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-300 to-primary"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-primary-light font-bold text-xs tracking-widest uppercase mb-4">
                                            <Zap className="w-4 h-4 fill-primary-light" />
                                            Trending Destination
                                        </div>
                                        <h3 className="text-3xl font-black mb-2 text-white drop-shadow-sm">Live the Episode</h3>
                                        <p className="text-slate-400 text-sm mb-6">Customized packages for families, couples, and trend-seekers.</p>

                                        {/* Trust strip */}
                                        <div className="flex items-center gap-4 mb-6 py-3 px-4 bg-white/5 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                                                <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Secure
                                            </div>
                                            <div className="w-px h-3 bg-white/20"></div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 4.9 Rated
                                            </div>
                                            <div className="w-px h-3 bg-white/20"></div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                                                <Clock className="w-3.5 h-3.5 text-primary-light" /> 24/7
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                                <span className="text-slate-400">Standard Pack</span>
                                                <span className="font-bold">{destination.price}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                                                <span className="text-slate-400">Duration</span>
                                                <span className="font-bold">{destination.duration}</span>
                                            </div>
                                        </div>

                                        <Link to="/enquiry" className="btn btn-primary w-full py-5 text-lg font-black rounded-2xl shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 group/btn mb-4">
                                            Book Now
                                            <ArrowLeft className="w-5 h-5 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>

                                        <Link to="/contact" className="block text-slate-400 text-xs text-center border border-white/10 py-3 rounded-xl hover:bg-white/5 transition-colors">
                                            Need Help? Talk to an Expert
                                        </Link>
                                    </div>
                                </motion.div>

                                <div id="attractions" className="mt-8 p-6 bg-gradient-to-br from-amber-50/70 to-white rounded-2xl border border-amber-100 scroll-mt-32">
                                    <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                                        <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                        Top Attractions
                                    </h4>
                                    <AttractionsList attractions={destination.attractions} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Bottom CTA — the sidebar booking card isn't reachable
                without a long scroll on small screens, so mirror its key action here. */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-4 py-3 flex items-center gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Starting at</p>
                    <p className="font-black text-lg text-slate-900 truncate">{destination.price}</p>
                </div>
                <Link to="/enquiry" className="btn btn-primary flex-1 py-3 text-sm font-black rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    Book Now <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
                <a
                    href="https://wa.me/919841844977"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="shrink-0 p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                    <MessageCircle className="w-5 h-5" />
                </a>
            </div>
        </div>
    );
};

export default DestinationDetail;
