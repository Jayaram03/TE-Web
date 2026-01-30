import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const ItineraryList = ({ itinerary }) => {
    if (!itinerary) return null;

    return (
        <section className="relative">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-1 h-1 bg-primary rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Day-wise Narrative</h2>
            </div>

            <div className="relative">
                {/* Vertical Line Lineage */}
                <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-slate-200 to-transparent"></div>

                <div className="space-y-12">
                    {itinerary.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-12 md:pl-20 group"
                        >
                            {/* Marker */}
                            <div className="absolute left-0.5 md:left-2 top-0 flex items-center justify-center">
                                <div className="w-7 h-7 md:w-9 md:h-9 bg-white border-4 border-primary rounded-full z-10 shadow-sm group-hover:scale-125 transition-transform duration-300"></div>
                            </div>

                            <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        {item.day}
                                    </span>
                                    <h3 className="font-black text-xl md:text-2xl text-slate-800 leading-none">
                                        {item.title}
                                    </h3>
                                </div>

                                <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                    {item.desc}
                                </p>

                                <div className="mt-6 flex items-center gap-2 text-primary/60 text-xs font-bold uppercase tracking-wider">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Experience the Spotlight
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ItineraryList;
