import React, { useMemo, useRef } from 'react';
import { destinations } from '../data/destinations';
import { getMonthlyFeatures } from '../data/monthlyFeatures';
import { Search, ArrowUpRight, ArrowLeft, ArrowRight, Clock, MapPin, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DestinationRegionPicker from '../components/DestinationRegionPicker';
import './destinationFilters.css';

const Destinations = () => {
    const [params, setParams] = useSearchParams();
    const activeTab = params.get('category') === 'International' ? 'International' : 'Domestic';
    const searchQuery = params.get('search') || '';
    const resultsRef = useRef(null);
    const pageSize = 6;

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

    const regions = activeTab === 'Domestic' ? domesticStates : internationalRegions;
    const categoryDestinations = destinations.filter(destination => destination.category === activeTab);
    const regionOptions = regions.map(region => ({
        value: region,
        label: region === 'All' ? `All ${activeTab === 'Domestic' ? 'states' : 'regions'}` : region,
        count: region === 'All' ? categoryDestinations.length : categoryDestinations.filter(destination =>
            (activeTab === 'Domestic' ? destination.state : destination.region) === region).length,
    }));
    const selectedState = regions.includes(params.get('region')) ? params.get('region') : 'All';
    const updateFilters = (changes, replace = false) => {
        setParams(() => {
            // Read the current URL so rapid filter/search changes do not use
            // a previous render's parameters and erase another selection.
            const next = new URLSearchParams(window.location.search);
            Object.entries(changes).forEach(([key, value]) => {
                if (value === '' || value === 'All' || (key === 'page' && value === 1)) next.delete(key);
                else next.set(key, String(value));
            });
            return next;
        }, { replace });
    };
    const resetFilters = () => updateFilters({ region: 'All', search: '', page: 1 });

    const filteredDestinations = useMemo(() => {
        return destinations.filter(dest => {
            const matchesCategory = dest.category === activeTab;

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
    const requestedPage = Number(params.get('page') || 1);
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? Math.min(requestedPage, Math.max(1, pageCount)) : 1;
    const visibleDestinations = filteredDestinations.slice((page - 1) * pageSize, page * pageSize);
    const cover = getMonthlyFeatures().editor[activeTab];
    const collectionParams = new URLSearchParams({ category: activeTab, region: selectedState, search: searchQuery, page: String(page) });
    const collectionSearch = `?${collectionParams.toString()}`;
    const detailLink = destination => `/destinations/${destination.id}${collectionSearch}`;
    const changePage = next => {
        updateFilters({ page: next });
        resultsRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
        resultsRef.current?.focus({ preventScroll: true });
    };

    return (
        <div className="pt-28 md:pt-40 pb-16 md:pb-20 min-h-screen bg-[#faf8f4] relative overflow-x-clip">
            <div className="container px-4 relative z-10">
                <header className="grid lg:grid-cols-[1fr_1.2fr] mb-8 rounded-3xl overflow-hidden bg-slate-900">
                    <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                        <h1 className="text-4xl md:text-6xl text-white leading-[1.02] tracking-tight mb-4">Destinations</h1>
                        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-md mb-6">Search destinations, compare itineraries and request a quote.</p>
                        <p className="text-xs text-slate-400">{destinations.length} destinations</p>
                    </div>
                    <Link to={detailLink(cover)} state={{ destinationsSearch: collectionSearch }} className="relative min-h-56 md:min-h-80 group overflow-hidden">
                        <img src={cover.image} alt={cover.name} width="720" height="440" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className="absolute top-5 left-5 bg-white/90 text-slate-800 rounded-full text-xs font-bold px-3 py-2">Featured this month</span>
                        <div className="absolute bottom-6 inset-x-6 text-white flex justify-between items-end gap-4"><p className="font-black text-3xl md:text-4xl">{cover.name}</p><ArrowUpRight className="h-7 w-7 shrink-0" /></div>
                    </Link>
                </header>

                {/* Discovery Controls */}
                <section aria-label="Filter destinations" className="destination-filters">
                    <div className="destination-filter-top">
                        <div className="destination-category-switch" role="group" aria-label="Destination category">
                            {['Domestic', 'International'].map(tab => <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => updateFilters({ category: tab, region: 'All', page: 1 })}>{tab}<span aria-hidden="true">{destinations.filter(destination => destination.category === tab).length}</span></button>)}
                        </div>
                        <span className="destination-filter-total" role="status">{filteredDestinations.length} {filteredDestinations.length === 1 ? 'place' : 'places'} to explore</span>
                    </div>
                    <div className="destination-filter-fields">
                        <div className="destination-search">
                            <Search size={18} aria-hidden="true" />
                            <input
                                type="search"
                                aria-label="Search destinations by name, state or region"
                                placeholder="Where would you like to go?"
                                value={searchQuery}
                                onChange={(e) => updateFilters({ search: e.target.value, page: 1 }, true)}
                            />
                            {searchQuery && <button type="button" aria-label="Clear destination search" onClick={() => updateFilters({ search: '', page: 1 }, true)}><X size={16} /></button>}
                        </div>
                        <DestinationRegionPicker
                            key={activeTab}
                            label={activeTab === 'Domestic' ? 'State' : 'Region'}
                            options={regionOptions}
                            value={selectedState}
                            onChange={value => updateFilters({ region: value, page: 1 })}
                        />
                    </div>
                    {(searchQuery || selectedState !== 'All') && <div className="destination-active-filters" aria-label="Active filters">
                        {selectedState !== 'All' && <button type="button" onClick={() => updateFilters({ region: 'All', page: 1 })} aria-label={`Remove ${selectedState} filter`}>{selectedState}<X size={13} aria-hidden="true" /></button>}
                        {searchQuery && <button type="button" onClick={() => updateFilters({ search: '', page: 1 }, true)} aria-label="Remove search filter"><span>“{searchQuery}”</span><X size={13} aria-hidden="true" /></button>}
                        <button type="button" onClick={resetFilters} className="destination-clear-all">Clear all</button>
                    </div>}
                </section>

                {/* Grid */}
                <div ref={resultsRef} tabIndex={-1} className="flex items-center justify-between gap-4 mb-5 scroll-mt-40 focus:outline-none">
                    <h2 className="text-xl md:text-2xl font-bold">{activeTab} destinations</h2>
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
                                <Link to={detailLink(dest)} state={{ destinationsSearch: collectionSearch }} className="group grid h-full grid-cols-[104px_minmax(0,1fr)] sm:grid-cols-1 rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-primary">
                                    <div className="relative h-full min-h-40 sm:h-52 bg-slate-200 overflow-hidden">
                                        <img src={dest.image} alt={dest.name} loading="lazy" decoding="async" width="400" height="260" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-700">{String((page - 1) * pageSize + index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className="p-4 sm:p-5 min-w-0 flex flex-col">
                                        <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500 mb-2"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{dest.state || dest.region}</span></p>
                                        <h3 className="text-xl sm:text-2xl leading-tight tracking-tight mb-2 group-hover:text-primary transition-colors">{dest.name}</h3>
                                        <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-3"><Clock className="h-3 w-3 shrink-0" />{dest.duration}</p>
                                        <div className="mt-auto flex items-end justify-between gap-2"><div><p className="text-[9px] uppercase tracking-widest text-slate-400">Pricing</p><p className="text-sm sm:text-lg font-bold text-primary">Request a quote</p></div><ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-primary shrink-0" aria-hidden="true" /></div>
                                    </div>
                                </Link>
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
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">No destinations match these filters. Try another search or clear your filters.</p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="btn btn-primary px-10 py-4 shadow-xl shadow-primary/20"
                        >
                            Clear filters
                        </button>
                    </motion.div>
                )}
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-3xl bg-slate-900 px-6 py-8 md:p-10 text-white">
                    <div><p className="text-xl md:text-2xl font-bold mb-2">Need another destination?</p><p className="text-sm text-slate-300">Request a custom itinerary.</p></div>
                    <Link to="/enquiry" className="btn btn-primary shrink-0 gap-2">Plan a custom trip <ArrowUpRight className="h-4 w-4" /></Link>
                </div>
            </div>
        </div>
    );
};

export default Destinations;
