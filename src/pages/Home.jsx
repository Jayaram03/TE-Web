import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Clock, ArrowRight, Globe, MapPin, Star } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { destinations } from '../data/destinations';
import { googleReviews } from '../data/reviews';
import DestinationCard from '../components/DestinationCard';

const Home = () => {
    // Select specific trending destinations
    const trendingIds = ['alleppey', 'maldives', 'dubai', 'thailand', 'vietnam', 'manali'];
    // Filter and sort by the order of trendingIds to maintain specific order
    const trendingDestinations = trendingIds
        .map(id => destinations.find(d => d.id === id))
        .filter(Boolean); // Filter out any undefined if ID not found
    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    // Performance Optimized Spring-based Parallax
    const springConfig = { damping: 30, stiffness: 200, mass: 0.1 };

    const y1Raw = useTransform(scrollYProgress, [0, 1], [0, 400]);
    const scaleRaw = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
    const opacityRaw = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const textYRaw = useTransform(scrollYProgress, [0, 1], [0, 200]);

    const y1 = useSpring(y1Raw, springConfig);
    const scale = useSpring(scaleRaw, springConfig);
    const opacity = useSpring(opacityRaw, springConfig);
    const textY = useSpring(textYRaw, springConfig);

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            {/* Hero Section - Optimized Trendy Overhaul */}
            <section ref={heroRef} className="relative min-h-[100dvh] flex items-center justify-center text-white overflow-hidden bg-slate-950">
                {/* Parallax Background Layers with GPU Acceleration */}
                <motion.div
                    style={{ y: y1, scale }}
                    className="absolute inset-0 z-0 will-change-transform"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-950 z-10"></div>
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476900543704-4312b78632f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"
                    ></div>
                </motion.div>

                {/* Minimalist Accents (Optimized) - Hidden on mobile to prevent layout issues */}
                <div className="hidden md:block absolute top-1/4 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute animate-bounce bottom-10 md:bottom-20 left-1/2 -translate-x-1/2 z-30 opacity-50">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-1.5 h-1.5 bg-white rounded-full"
                        />
                    </div>
                </div>

                <motion.div
                    style={{ opacity, y: textY }}
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="container relative z-20 text-center px-4 pt-20"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="mb-8 md:mb-12"
                    >
                        <span className="inline-block py-0.5 md:py-1 px-3 md:px-4 rounded-sm bg-primary/20 border-l-2 border-primary text-primary-light text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.5em] uppercase">
                            Curating Travel Episodes
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl md:text-[9vw] font-black mb-8 md:mb-10 leading-[0.9] tracking-tighter drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)] flex flex-col items-center"
                        style={{ willChange: 'transform, opacity' }}
                    >
                        <span className="text-white">CRAFT YOUR</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-200 to-orange-500">STORY</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-sm md:text-xl text-slate-100 mb-10 md:mb-16 max-w-2xl mx-auto font-medium tracking-wide leading-relaxed drop-shadow-md opacity-90">
                        Every journey is a story waiting to be told. <br className="hidden md:block" /> Explore life's most extraordinary chapters with us.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center">
                        <Link to="/destinations" className="group w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-primary text-base md:text-xl px-8 py-3 md:px-12 md:py-5 rounded-2xl shadow-[0_0_30px_rgba(255,103,31,0.3)] hover:shadow-[0_0_50px_rgba(255,103,31,0.5)] transition-all flex items-center justify-center gap-2 md:gap-3"
                            >
                                Start Journey <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                            </motion.button>
                        </Link>
                        <Link to="/enquiry" className="w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white hover:text-slate-900 text-base md:text-xl px-8 py-3 md:px-12 md:py-5 rounded-2xl transition-all"
                            >
                                Request Custom Plan
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-surface bg-dot-pattern relative">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="section-title">Why Choose Travel Episodes?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto mt-4 text-lg">
                            We go beyond bookings to curate experiences. Here's why travelers trust us with their dream vacations.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-primary" />}
                            title="Trusted & Secure"
                            description="Your journey is in safe hands. We are a registered agency with verified partners ensuring a safe trip."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Globe className="w-8 h-8 text-secondary" />}
                            title="Global Connectivity"
                            description="Whether it's a domestic getaway or an international expedition, we have the best connections worldwide."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={<Clock className="w-8 h-8 text-accent" />}
                            title="24/7 Support"
                            description="We are with you every step of the way. Our dedicated support team is available round the clock."
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* Trending / Preview Section */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] translate-y-1/4"></div>

                <div className="container relative z-10 px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-20 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-center md:text-left"
                        >
                            <span className="text-orange-400 font-black uppercase tracking-[0.3em] text-xs mb-6 block drop-shadow-sm">Handpicked for you</span>
                            <h2 className="text-6xl md:text-8xl font-black mb-6 leading-none group">
                                <span className="text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-10 transition-transform duration-700 group-hover:translate-x-4 inline-block">Trending</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-300 to-yellow-200 drop-shadow-[0_15px_35px_rgba(251,146,60,0.4)] px-1 relative z-20 transition-transform duration-700 group-hover:-translate-x-4 inline-block">Getaways</span>
                            </h2>
                            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">Curated domestic and international favorites that our community loves right now.</p>
                        </motion.div>
                        <Link to="/destinations" className="btn btn-outline border-white/20 text-white hover:bg-primary hover:border-primary hover:text-white group px-8 py-4 rounded-xl transition-all shadow-2xl">
                            Explore All Destinations <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="relative w-full overflow-hidden pb-12">
                    <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent z-10 pointer-events-none"></div>

                    <div
                        className="flex gap-10 w-max hover:[animation-play-state:paused] py-10"
                        style={{
                            animation: "marquee 40s linear infinite",
                        }}
                    >
                        {/* Original Set */}
                        {trendingDestinations.map((dest) => (
                            <motion.div
                                key={dest.id}
                                whileHover={{ y: -20, scale: 1.05 }}
                                className="w-[260px] md:w-[420px] shrink-0 h-[380px] md:h-[500px] perspective-1000"
                            >
                                <div className="w-full h-full shadow-2xl shadow-black/50 rounded-3xl overflow-hidden hover:ring-2 hover:ring-orange-500/50 transition-all duration-500">
                                    <DestinationCard destination={dest} />
                                </div>
                            </motion.div>
                        ))}
                        {/* Duplicate Set for Seamless Loop */}
                        {trendingDestinations.map((dest) => (
                            <motion.div
                                key={`${dest.id}-duplicate`}
                                whileHover={{ y: -20, scale: 1.05 }}
                                className="w-[260px] md:w-[420px] shrink-0 h-[380px] md:h-[500px] perspective-1000"
                            >
                                <div className="w-full h-full shadow-2xl shadow-black/50 rounded-3xl overflow-hidden hover:ring-2 hover:ring-orange-500/50 transition-all duration-500">
                                    <DestinationCard destination={dest} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="container mt-12 text-center md:hidden">
                    <Link to="/destinations" className="btn btn-outline w-full border-white/20 text-white hover:bg-white hover:text-slate-900">
                        View All Destinations
                    </Link>
                </div>
            </section>

            {/* Testimonials Section - Bento Scroll Design */}
            <BentoTestimonials />

            {/* Google Review Interaction Section */}
            <GoogleReviewSection />

            {/* Parallax CTA Section */}
            <section className="py-32 bg-slate-900 text-white relative overflow-hidden attachment-fixed bg-fixed bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')" }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="container relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
                            Ready to Start Your Adventure?
                        </h2>
                        <p className="text-xl text-slate-100 mb-10 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            Tell us where you want to go. We handle the flights, hotels, and experiences so you can just enjoy.
                        </p>
                        <Link to="/enquiry" className="btn btn-secondary text-lg px-10 py-5 rounded-full shadow-2xl hover:scale-105 transition-transform">
                            Get a Free Quote
                        </Link>
                    </motion.div>
                </div>
            </section>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes kenburns {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 50, rotateX: 20 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        whileHover={{ scale: 1.02, rotateY: 5 }}
        className="p-8 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all border border-slate-100 hover:-translate-y-4 group perspective-1000"
    >
        <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
            className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl flex items-center justify-center mb-8 group-hover:from-primary group-hover:to-primary/80 group-hover:text-white transition-all duration-500"
        >
            {React.cloneElement(icon, { className: "w-10 h-10 group-hover:scale-110 transition-transform" })}
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-lg">{description}</p>
    </motion.div>
);

const BentoCard = ({ review, index }) => {
    // Generate a subtle background based on index
    const backgrounds = [
        'bg-white',
        'bg-slate-50',
        'bg-orange-50/50',
        'bg-blue-50/50',
        'bg-purple-50/50',
    ];
    const bg = backgrounds[index % backgrounds.length];

    return (
        <div className={`p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 w-[300px] md:w-[350px] flex-shrink-0 group ${bg}`}>
            <div className="flex items-center gap-3 mb-4">
                <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=random`;
                    }}
                />
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{review.name}</h4>
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{review.date}</span>
                    </div>
                </div>
                <img src="/google-logo.png" alt="Google" className="w-5 h-5 object-contain" />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                "{review.text}"
            </p>
        </div>
    );
};

const BentoTestimonials = () => {
    const row1 = googleReviews.slice(0, 10);
    const row2 = googleReviews.slice(10, 20);

    return (
        <section className="py-24 bg-background overflow-hidden relative">
            <div className="container relative z-10 mb-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center text-center"
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-orange-50 border border-orange-100 text-primary text-sm font-bold mb-6 shadow-sm">
                        <img src="/google-logo.png" alt="Google" className="w-5 h-5 object-contain" />
                        <Star className="w-4 h-4 fill-primary" />
                        <span>4.9/5 Average Google Rating</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Trusted by <span className="text-primary italic">1000+ Explorers</span></h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        Real stories from real travelers around the world. We take pride in crafting experiences that stay with you forever.
                    </p>
                </motion.div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Row 1: Left to Right */}
                <div className="relative flex">
                    <motion.div
                        className="flex gap-6 animate-scroll-left"
                        initial={{ x: 0 }}
                        animate={{ x: "-50%" }}
                        transition={{
                            duration: 50,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ width: "max-content" }}
                    >
                        {[...row1, ...row1].map((review, i) => (
                            <BentoCard key={`row1-${i}`} review={review} index={i} />
                        ))}
                    </motion.div>
                </div>

                {/* Row 2: Right to Left */}
                <div className="relative flex">
                    <motion.div
                        className="flex gap-6"
                        initial={{ x: "-50%" }}
                        animate={{ x: 0 }}
                        transition={{
                            duration: 50,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ width: "max-content" }}
                    >
                        {[...row2, ...row2].map((review, i) => (
                            <BentoCard key={`row2-${i}`} review={review} index={i} />
                        ))}
                    </motion.div>
                </div>
            </div>

            <div className="container mt-16 text-center">
                <a
                    href="https://www.google.com/search?q=travel+episodes&sca_esv=8ed44501168e219b&sxsrf=ANbL-n4qUXKmCzAXjRa9yke29GZN0SEePg%3A1769767074482&ei=ooB8aYuMHbrg4-EPo-Oh4QY&ved=0ahUKEwiL5byOgLOSAxU68DgGHaNxKGwQ4dUDCBE&uact=5&oq=travel+episodes&gs_lp=Egxnd3Mtd2l6LXNlcnAiD3RyYXZlbCBlcGlzb2RlczIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeMgYQABgHGB4yBhAAGAcYHjIGEAAYBxgeMgYQABgHGB4yBRAAGIAEMgYQABgHGB5I8g1QvwpYvwpwAngAkAEAmAGjA6ABmAWqAQcyLTEuMC4xuAEDyAEA-AEBmAIEoAKuBcICChAAGIAEGLADGA3CAgkQABiwAxgNGB6YAwCIBgGQBgeSBwkyLjAuMS4wLjGgB44LsgcHMi0xLjAuMbgHpgXCBwUwLjIuMsgHDoAIAA&sclient=gws-wiz-serp#mpd=~7405983415351859377/customers/reviews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn border-slate-200 text-slate-600 hover:bg-primary hover:text-white hover:border-primary px-10 py-4 shadow-xl hover:shadow-primary/30 transition-all rounded-2xl font-bold"
                >
                    View All 200+ Reviews on Google
                </a>
            </div>

            {/* Gradient Fades for Infinite Look */}
            <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        </section>
    );
};

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

                            <div className="flex gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.button
                                        key={i}
                                        onMouseEnter={() => setHoveredStar(i)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => window.open(googleReviewUrl, '_blank')}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative"
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

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div>
        </section>
    );
};

export default Home;
