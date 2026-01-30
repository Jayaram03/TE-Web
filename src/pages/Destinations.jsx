import React, { useState, useMemo } from 'react';
import { destinations } from '../data/destinations';
import { Filter, Search, Globe, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DestinationCard from '../components/DestinationCard';

const Destinations = () => {
    const [activeTab, setActiveTab] = useState('Domestic');
    const [selectedState, setSelectedState] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Extract unique regions/states for the filter
    const domesticStates = useMemo(() => {
        const states = destinations
            .filter(d => d.category === 'Domestic')
            .map(d => d.state);
        return ['All', ...new Set(states)];
    }, []);

    const internationalRegions = useMemo(() => {
        const regions = destinations
            .filter(d => d.category === 'International')
            .map(d => d.region)
            .filter(Boolean);
        return ['All', ...new Set(regions)];
    }, []);

    // Filter destinations based on Tab, State/Region, and Search
    const filteredDestinations = useMemo(() => {
        return destinations.filter(dest => {
            const matchesCategory = dest.category === activeTab;

            // For Domestic, we filter by 'state'. For International, we filter by 'region'.
            let matchesFilter = true;
            if (activeTab === 'Domestic') {
                matchesFilter = selectedState === 'All' || dest.state === selectedState;
            } else {
                matchesFilter = selectedState === 'All' || dest.region === selectedState;
            }

            const matchesSearch = searchQuery === '' ||
                dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (dest.state && dest.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (dest.region && dest.region.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesFilter && matchesSearch;
        });
    }, [activeTab, selectedState, searchQuery]);

    return (
        <div className="pt-36 md:pt-44 pb-20 min-h-screen bg-background bg-dot-pattern">
            <div className="container px-4">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-widest uppercase mb-6"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        Explore Our World
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
                        Discover <span className="text-primary italic">{activeTab}</span> Gems
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
                        {activeTab === 'Domestic'
                            ? "From the majestic peaks of the Himalayas to the golden sands of the Kerala coast."
                            : "Venture beyond borders. Curated international episodes that redefine luxury and adventure."}
                    </p>
                </div>

                {/* Discovery Controls */}
                <div className="max-w-6xl mx-auto space-y-6 mb-16">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by destination, state, or region..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 md:py-6 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg font-medium placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-2">
                        {/* Category Tabs */}
                        <div className="flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/60 shadow-inner w-full lg:w-auto">
                            {['Domestic', 'International'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setSelectedState('All');
                                    }}
                                    className={`flex-1 lg:flex-none px-6 py-2.5 md:px-10 md:py-3.5 rounded-xl text-sm font-black tracking-wide transition-all duration-300 ${activeTab === tab
                                        ? 'bg-white text-slate-900 shadow-xl border border-slate-200/50 scale-[1.02]'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            <div className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-700 font-bold shrink-0">
                                <Filter className="w-4 h-4 text-primary" />
                                <span className="text-xs uppercase tracking-widest text-slate-400">Filter By</span>
                            </div>

                            {(activeTab === 'Domestic' ? domesticStates : internationalRegions).map(item => (
                                <button
                                    key={item}
                                    onClick={() => setSelectedState(item)}
                                    className={`px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0 ${selectedState === item
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredDestinations.map((dest) => (
                            <motion.div
                                key={dest.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <DestinationCard destination={dest} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredDestinations.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200"
                    >
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Search className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">No Destinations Found</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">We couldn't find any episodes matching "<span className="text-primary font-bold">{searchQuery}</span>". Try a different search or clear your filters.</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedState('All');
                            }}
                            className="btn btn-primary px-10 py-4 shadow-xl shadow-primary/20"
                        >
                            Reset Discovery
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Destinations;
