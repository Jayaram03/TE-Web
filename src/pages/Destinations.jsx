import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { destinations } from '../data/destinations';
import { Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DestinationCard from '../components/DestinationCard';

const Destinations = () => {
    const [activeTab, setActiveTab] = useState('Domestic');
    const [selectedState, setSelectedState] = useState('All');

    // Extract unique states for the filter
    const domesticStates = useMemo(() => {
        const states = destinations
            .filter(d => d.category === 'Domestic')
            .map(d => d.state);
        return ['All', ...new Set(states)];
    }, []);

    // Filter destinations based on Tab and State
    const filteredDestinations = useMemo(() => {
        return destinations.filter(dest => {
            const matchesCategory = dest.category === activeTab;
            const matchesState = activeTab === 'International' || selectedState === 'All' || dest.state === selectedState;
            return matchesCategory && matchesState;
        });
    }, [activeTab, selectedState]);

    return (
        <div className="pt-36 md:pt-44 pb-20 min-h-screen bg-background bg-dot-pattern">
            <div className="container">
                <div className="text-center mb-12">
                    <h1 className="section-title">Explore {activeTab} Destinations</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto mt-4 text-lg">
                        {activeTab === 'Domestic'
                            ? "From snow-capped mountains to sun-kissed beaches, discover the diverse landscapes of India."
                            : "Embark on a global adventure. Experience new cultures, cuisines, and breathtaking sights."}
                    </p>
                </div>

                {/* Tabs & Filter */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
                    {/* Category Tabs */}
                    <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                        {['Domestic', 'International'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setSelectedState('All'); // Reset filter on switch
                                }}
                                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Domestic State Filter */}
                    {activeTab === 'Domestic' && (
                        <div className="relative group">
                            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 text-sm font-medium cursor-pointer hover:border-primary/50 transition-colors">
                                <Filter className="w-4 h-4 text-primary" />
                                <select
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="bg-transparent outline-none cursor-pointer appearance-none pr-8"
                                >
                                    {domesticStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredDestinations.map((dest) => (
                            <DestinationCard key={dest.id} destination={dest} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredDestinations.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-lg">No destinations found for the selected filter.</p>
                        <button
                            onClick={() => setSelectedState('All')}
                            className="text-primary font-bold mt-2 hover:underline"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Destinations;
