import React, { useState, useMemo, useRef } from 'react';
import { destinations } from '../data/destinations';
import { getMonthlyFeatures } from '../data/monthlyFeatures';
import { Filter, Search, ArrowUpRight, ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DestinationCollectionCard from '../components/DestinationCollectionCard';

const Destinations = () => {
    const [activeTab, setActiveTab] = useState('Domestic');
    const [selectedState, setSelectedState] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const resultsRef = useRef(null);
    const pageSize = 6;

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

    const pageCount = Math.ceil(filteredDestinations.length / pageSize);
    const visibleDestinations = filteredDestinations.slice((page - 1) * pageSize, page * pageSize);
    const cover = getMonthlyFeatures().editor[activeTab];
    const changePage = next => {
        setPage(next);
        resultsRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
        resultsRef.current?.focus({ preventScroll: true });
    };

    return (
        <div className="pt-28 md:pt-40 pb-16 md:pb-20 min-h-screen bg-[#faf8f4] relative overflow-x-clip">
            <div className="container px-4 relative z-10">
                <header className="grid lg:grid-cols-[1fr_1.2fr] mb-8 rounded-3xl overflow-hidden bg-slate-900">
                    <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-300 mb-5"><Compass className="h-4 w-4" /> The destination edit</p>
                        <h1 className="text-4xl md:text-6xl text-white leading-[1.02] tracking-tight mb-4">A world of places.<br /><span className="text-orange-300">One perfect escape.</span></h1>
                        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-md mb-6">Browse a few great ideas at a time. Find your favourite, explore the details, then let us make it yours.</p>
                        <p className="text-xs text-slate-400">{destinations.length} destinations / curated for your next chapter</p>
                    </div>
                    <Link to={`/destinations/${cover.id}`} className="relative min-h-56 md:min-h-80 group overflow-hidden">
                        <img src={cover.image} alt={cover.name} width="720" height="440" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className="absolute top-5 left-5 bg-white/90 text-slate-800 rounded-full text-xs font-bold px-3 py-2">This month’s editor’s pick</span>
                        <div className="absolute bottom-6 inset-x-6 text-white flex justify-between items-end gap-4"><div><p className="text-xs text-white/70 mb-2">{activeTab === 'Domestic' ? 'Closer to home. Far from ordinary.' : 'Your next passport memory.'}</p><p className="font-black text-3xl md:text-4xl">{cover.name}</p></div><ArrowUpRight className="h-7 w-7 shrink-0" /></div>
                    </Link>
                </header>

                {/* Discovery Controls */}
                <div className="space-y-5 mb-8 p-4 md:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            aria-label="Search destinations by name, state or region"
                            placeholder="Search by destination, state, or region..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base font-medium placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex flex-col items-start gap-4 pt-2">
                        {/* Category Tabs */}
                        <div className="flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/60 shadow-inner w-full lg:w-auto">
                            {['Domestic', 'International'].map((tab) => (
                                <button
                                    key={tab}
                                    aria-pressed={activeTab === tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setSelectedState('All');
                                        setPage(1);
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
                        <div className="flex items-center gap-2 w-full overflow-x-auto pb-2 no-scrollbar">
                            <div className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-700 font-bold shrink-0">
                                <Filter className="w-4 h-4 text-primary" />
                                <span className="text-xs uppercase tracking-widest text-slate-400">Filter By</span>
                            </div>

                            {(activeTab === 'Domestic' ? domesticStates : internationalRegions).map(item => (
                                <button
                                    key={item}
                                    aria-pressed={selectedState === item}
                                    onClick={() => { setSelectedState(item); setPage(1); }}
                                    className={`min-h-11 px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0 ${selectedState === item
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
                <div ref={resultsRef} tabIndex={-1} className="flex items-center justify-between gap-4 mb-5 scroll-mt-40 focus:outline-none">
                    <h2 className="text-xl md:text-2xl font-bold">Your {activeTab.toLowerCase()} escapes</h2>
                    <p className="text-xs sm:text-sm text-slate-500 shrink-0" role="status">{filteredDestinations.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredDestinations.length)} of ${filteredDestinations.length}` : '0 places'}</p>
                </div>
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
                >
                    <AnimatePresence mode='popLayout'>
                        {visibleDestinations.map((dest, index) => (
                            <motion.div
                                key={dest.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <DestinationCollectionCard destination={dest} index={(page - 1) * pageSize + index} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {pageCount > 1 && <nav aria-label="Destination collection pages" className="flex flex-wrap items-center justify-center gap-2 mt-7">
                    <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1} aria-label="Previous collection page" className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button>
                    {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" onClick={() => changePage(number)} aria-label={`Collection page ${number}`} aria-current={page === number ? 'page' : undefined} className={`h-11 w-11 rounded-xl text-sm font-bold ${page === number ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{number}</button>)}
                    <button type="button" onClick={() => changePage(page + 1)} disabled={page === pageCount} aria-label="Next collection page" className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button>
                </nav>}

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
                                setPage(1);
                            }}
                            className="btn btn-primary px-10 py-4 shadow-xl shadow-primary/20"
                        >
                            Reset Discovery
                        </button>
                    </motion.div>
                )}
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-3xl bg-slate-900 px-6 py-8 md:p-10 text-white">
                    <div><p className="text-xl md:text-2xl font-bold mb-2">Somewhere else on your wishlist?</p><p className="text-sm text-slate-300">Tell us your idea. We’ll help you build the journey.</p></div>
                    <Link to="/enquiry" className="btn btn-primary shrink-0 gap-2">Plan a custom trip <ArrowUpRight className="h-4 w-4" /></Link>
                </div>
            </div>
        </div>
    );
};

export default Destinations;
