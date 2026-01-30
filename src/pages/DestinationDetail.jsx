import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { destinations } from '../data/destinations';
import ItineraryList from '../components/ItineraryList';
import AttractionsList from '../components/AttractionsList';
import { ArrowLeft, Clock, Calendar, Wallet, CheckCircle2, XCircle, Info, Star, ShieldCheck, Zap } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const DestinationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const destination = destinations.find(d => d.id === id);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

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
        <div className="min-h-screen bg-background pb-10 md:pb-20 overflow-x-hidden">
            {/* Hero Header */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
                <motion.div
                    style={{ y: y1, scale }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-background"></div>
                </motion.div>

                <motion.div
                    style={{ opacity }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-12 md:pt-0"
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
                        className="text-4xl md:text-8xl font-black mb-6 text-white drop-shadow-2xl tracking-tighter"
                    >
                        {destination.name}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-3xl font-medium text-white/90 drop-shadow-lg italic font-serif"
                    >
                        "{destination.tagline}"
                    </motion.p>
                </motion.div>

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-32 left-4 md:left-12 z-[60] bg-white/10 backdrop-blur-xl p-4 rounded-full border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center group shadow-xl"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="container -mt-32 relative z-20">
                <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-12 border border-slate-100/50">
                    {/* Glassmorphic Quick Info Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 pb-12 mb-12 border-b border-slate-100">
                        <div className="p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 md:gap-4">
                            <div className="w-9 h-9 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-400 text-[8px] md:text-[10px] uppercase font-bold tracking-wider">Duration</p>
                                <p className="font-bold text-xs md:text-base text-slate-800 truncate">{destination.duration}</p>
                            </div>
                        </div>
                        <div className="p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 md:gap-4">
                            <div className="w-9 h-9 md:w-12 md:h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 md:w-6 md:h-6 text-secondary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-400 text-[8px] md:text-[10px] uppercase font-bold tracking-wider">Best Time</p>
                                <p className="font-bold text-xs md:text-base text-slate-800 truncate">{destination.bestTime || 'Year Round'}</p>
                            </div>
                        </div>
                        <div className="p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 md:gap-4">
                            <div className="w-9 h-9 md:w-12 md:h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Wallet className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-400 text-[8px] md:text-[10px] uppercase font-bold tracking-wider">Starting</p>
                                <p className="font-bold text-xs md:text-base text-slate-800 truncate">{destination.price}</p>
                            </div>
                        </div>
                        <div className="p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 md:gap-4">
                            <div className="w-9 h-9 md:w-12 md:h-12 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4 md:w-6 md:h-6 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-slate-400 text-[8px] md:text-[10px] uppercase font-bold tracking-wider">Verified</p>
                                <p className="font-bold text-xs md:text-base text-slate-800 truncate">TE Certified</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Content */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* About */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">About the Place</h2>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {destination.description}
                                </p>
                            </section>

                            {/* Itinerary */}
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

                            {/* Inclusions & Exclusions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                                <section>
                                    <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                        Inclusions
                                    </h3>
                                    <ul className="space-y-4">
                                        {(destination.inclusions || [
                                            "Accommodation in deluxe hotels/resorts",
                                            "Daily breakfast and dinner",
                                            "Sightseeing in private AC vehicle",
                                            "Professional driver/guide support",
                                            "All toll taxes and parking fees"
                                        ]).map((inc, i) => (
                                            <li key={i} className="flex gap-3 text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                                {inc}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                                        <XCircle className="w-6 h-6 text-red-500" />
                                        Exclusions
                                    </h3>
                                    <ul className="space-y-4">
                                        {(destination.exclusions || [
                                            "Flight/Train tickets",
                                            "Entry tickets to monuments/parks",
                                            "Personal expenses (laundry, calls)",
                                            "Travel insurance",
                                            "Anything not mentioned in inclusions"
                                        ]).map((exc, i) => (
                                            <li key={i} className="flex gap-3 text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                                                {exc}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-8">
                            {/* Booking CTA Widget */}
                            <div className="sticky top-32">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl group-hover:bg-primary/40 transition-colors"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-primary-light font-bold text-xs tracking-widest uppercase mb-4">
                                            <Zap className="w-4 h-4 fill-primary-light" />
                                            Trending Destination
                                        </div>
                                        <h3 className="text-3xl font-black mb-2 text-white drop-shadow-sm">Live the Episode</h3>
                                        <p className="text-slate-400 text-sm mb-8">Customized packages for families, couples, and trend-seekers.</p>

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

                                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 italic">
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
        </div>
    );
};

export default DestinationDetail;
