import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const DestinationCard = ({ destination }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <Link to={`/destinations/${destination.id}`} className="card group block h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
                <div className="relative overflow-hidden h-48 md:h-56 shrink-0 bg-slate-200">
                    <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none'; // Hide the broken image icon
                            e.target.parentElement.classList.remove('bg-slate-200'); // Remove the placeholder gray
                            e.target.parentElement.classList.add('bg-slate-800'); // Dark background for fallback
                        }}
                    />
                    {/* Gradient Overlay - Always present to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 transition-opacity group-hover:opacity-100"></div>

                    {/* State Tag */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm border border-white/50 z-10">
                        <MapPin className="w-3 h-3 text-primary" /> {destination.state}
                    </div>

                    {/* Name & Tagline */}
                    <div className="absolute bottom-4 left-4 p-2 z-10 w-full pr-4">
                        <h2 className="text-xl md:text-2xl font-bold mb-1 leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {destination.name}
                        </h2>
                        <p className="text-xs md:text-sm font-bold text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {destination.tagline}
                        </p>
                    </div>
                </div>
                <div className="p-4 md:p-5 flex flex-col flex-grow bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-y-3 text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                                <Clock className="w-3.5 h-3.5 text-orange-400" />
                                <span className="font-bold text-[10px] md:text-[11px] uppercase tracking-tight">{destination.duration}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-md">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span className="font-bold text-[10px] md:text-[11px] uppercase tracking-tight text-slate-700">{destination.bestTime || 'Year Round'}</span>
                            </div>
                        </div>
                        <div className="font-bold text-primary text-lg md:text-xl">{destination.price}</div>
                    </div>
                    <p className="text-slate-600 mb-6 line-clamp-2 text-sm leading-relaxed flex-grow">
                        {destination.description}
                    </p>
                    <div className="flex items-center justify-center w-full py-3 rounded-xl border border-primary/20 bg-orange-50 text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all shadow-sm hover:shadow-primary/20 mt-auto">
                        View Details
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default DestinationCard;
