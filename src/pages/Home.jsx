import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Clock, ArrowRight, Globe, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { destinations } from '../data/destinations';
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

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
                {/* Background Overlay - Dynamic Gradient & Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black opacity-90 z-10"></div>
                    <div
                        className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1476900543704-4312b78632f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center animate-kenburns"
                        style={{ animation: 'kenburns 20s infinite alternate' }}
                    ></div>
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="container relative z-20 text-center px-4"
                >
                    <motion.div variants={fadeInUp}>
                        <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-300 text-sm font-semibold mb-6 tracking-wide uppercase">
                            Domestic & International Tours
                        </span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
                        Find Your Next <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-200 to-orange-400">Adventure</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
                        Discover the world's most mesmerizing destinations with Travel Episodes.
                        From the heart of India to global wonders, we craft journeys that inspire.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link to="/destinations" className="btn btn-primary text-lg px-8 py-4 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40">
                            Explore Destinations
                        </Link>
                        <Link to="/enquiry" className="btn bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 text-lg px-8 py-4 hover:border-white/50">
                            Plan Custom Trip
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
            <section className="py-24 bg-background bg-grid-pattern overflow-hidden">
                <div className="container">
                    <div className="flex justify-between items-end mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Trending Getaways</h2>
                            <p className="text-slate-600">Handpicked domestic and international favorites</p>
                        </motion.div>
                        <Link to="/destinations" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                            View All <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Infinite Carousel */}
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

                    <motion.div
                        className="flex gap-8 px-4"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 40 // Adjust speed here
                        }}
                        whileHover={{ animationPlayState: "paused" }} // This doesn't work directly with framer motion animate prop, need CSS or motion value manipulation. 
                        // Simpler approach for pause on hover with Framer Motion loop is tricky without managing motion values.
                        // switching to style-based animation for easy pause support
                        style={{ width: "max-content" }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.animationPlayState = 'paused';
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.animationPlayState = 'running';
                        }}
                    >
                        {/* We will insert the style tag for animation below or use Tailwind arbitrary values if config allows, 
                            but standard style prop is safest for keyframes here without cluttering global css 
                         */}
                    </motion.div>

                    {/* 
                       Re-implementing with a cleaner pure-React standard approach for the Marquee 
                       because Framer Motion 'animate' prop overrides CSS hover states often.
                    */}
                    <div
                        className="flex gap-8 w-max hover:[animation-play-state:paused]"
                        style={{
                            animation: "marquee 40s linear infinite",
                        }}
                    >
                        {/* Original Set */}
                        {trendingDestinations.map((dest) => (
                            <div key={dest.id} className="w-[320px] md:w-[380px] shrink-0 h-[450px]">
                                <DestinationCard destination={dest} />
                            </div>
                        ))}
                        {/* Duplicate Set for Seamless Loop */}
                        {trendingDestinations.map((dest) => (
                            <div key={`${dest.id}-duplicate`} className="w-[320px] md:w-[380px] shrink-0 h-[450px]">
                                <DestinationCard destination={dest} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container mt-12 text-center md:hidden">
                    <Link to="/destinations" className="btn btn-outline w-full">
                        View All Destinations
                    </Link>
                </div>

                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-slate-50 bg-dot-pattern relative overflow-hidden">
                <div className="container relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
                            </span>
                            <span className="font-bold text-slate-800 text-lg">4.9/5</span>
                        </div>
                        <h2 className="section-title">Loved by Travelers</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto mt-4 text-lg">
                            Don't just take our word for it. Here is what our happy travelers have to say about their journeys with us.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <TestimonialCard
                            name="Riya Sharma"
                            location="Bangalore, India"
                            text="Absolutely polished experience! The team at Travel Episodes planned our Kerala trip to perfection. Every hotel was stunning and the driver was very professional."
                            delay={0.2}
                        />
                        <TestimonialCard
                            name="Arjun Mehta"
                            location="Mumbai, India"
                            text="Planned a surprise anniversary trip to Maldives with them. It was flawless. The recommendations for water villas were spot on. Highly recommended!"
                            delay={0.4}
                        />
                        <TestimonialCard
                            name="Sneha & Rahul"
                            location="Delhi, India"
                            text="Great support throughout the trip. We faced a small issue with our flight, but their team handled it immediately. That's the kind of service you need."
                            delay={0.6}
                        />
                    </div>

                    <div className="text-center">
                        <a
                            href="https://g.page/r/CbStJ9vIzvGXEAE/review"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all border-b-2 border-primary/20 hover:border-primary pb-1"
                        >
                            Read all reviews on Google <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" onError={(e) => e.target.style.display = 'none'} />
                        </a>
                    </div>
                </div>
            </section>

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
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 hover:-translate-y-2 group"
    >
        <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
            className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors"
        >
            {icon}
        </motion.div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
);

const TestimonialCard = ({ name, location, text, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all"
    >
        <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
        </div>
        <p className="text-slate-600 mb-6 italic leading-relaxed">"{text}"</p>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-bold">
                {name.charAt(0)}
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm">{name}</h4>
                <p className="text-slate-400 text-xs">{location}</p>
            </div>
        </div>
    </motion.div>
);

export default Home;
