import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Compass, Globe, Headphones, Plane, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const reasons = [
    { icon: ShieldCheck, title: 'Good hands. Great holidays.', text: 'A registered agency and verified travel partners. Less second-guessing, more going.', label: 'Peace of mind', className: 'bg-white', iconClass: 'bg-orange-50 text-primary' },
    { icon: Globe, title: 'Local know-how. A world of possibilities.', text: 'From a weekend close to home to a faraway first, our connections bring your plans to life.', label: 'Near & far', className: 'bg-indigo-50/70', iconClass: 'bg-white text-secondary' },
    { icon: Headphones, title: 'A real crew in your corner.', text: 'Plans change. Questions happen. Our round-the-clock support means you never travel alone.', label: '24/7 support', className: 'bg-slate-900 text-white', iconClass: 'bg-white/10 text-orange-300' },
];

const WhyChoose = () => {
    const reducedMotion = useReducedMotion();
    const reveal = index => ({
        initial: reducedMotion ? false : { opacity: 0, y: 35, rotate: index % 2 ? 2 : -2 },
        whileInView: { opacity: 1, y: 0, rotate: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.65, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] },
    });

    return (
        <section aria-labelledby="why-choose-title" className="pt-12 pb-6 md:py-24 bg-[#f5f1e9] relative">
            <div className="container">
                <motion.div {...reveal(0)} className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 md:mb-10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Why choose Travel Episodes?</p>
                        <h2 id="why-choose-title" className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">More feeling.<br /><span className="text-primary">Less figuring it out.</span></h2>
                    </div>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-sm">Not just a booking. A thoughtfully planned journey, with people who care about every little detail.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div {...reveal(0)} className="md:row-span-2 rounded-4xl bg-orange-200 p-6 md:p-8 relative overflow-hidden flex flex-col min-h-96">
                        <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-900 border border-orange-900/20 rounded-full px-3 py-2">The TE way / 01</span><Compass className="h-7 w-7 text-orange-800" /></div>
                        <h3 className="text-3xl md:text-4xl tracking-tight leading-tight mt-7 mb-3">Your kind of trip.<br />Not a copy-paste itinerary.</h3>
                        <p className="text-sm text-orange-950/70 leading-relaxed max-w-xs">Your pace, your people, your wish list. We join the dots so you can collect the moments.</p>
                        <div className="relative my-6 flex-1 min-h-24" aria-hidden="true">
                            <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible" fill="none">
                                <path d="M15 76 C80 76 35 12 115 25 S205 106 281 24" stroke="#9a3412" strokeOpacity=".2" strokeWidth="2" strokeDasharray="4 6" />
                                <motion.path d="M15 76 C80 76 35 12 115 25 S205 106 281 24" stroke="#9a3412" strokeWidth="2" initial={reducedMotion ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, delay: 0.3 }} />
                                <circle cx="15" cy="76" r="5" fill="#9a3412" />
                                <circle cx="281" cy="24" r="7" fill="#ffedd5" stroke="#9a3412" strokeWidth="2" />
                            </svg>
                            <span className="absolute left-0 bottom-0 text-[9px] font-bold tracking-widest uppercase text-orange-900">Your idea</span>
                            <Plane className="absolute right-1 top-0 h-6 w-6 text-orange-900 -rotate-12" />
                            <span className="absolute right-0 bottom-0 text-[9px] font-bold tracking-widest uppercase text-orange-900">Your story</span>
                        </div>
                        <Link to="/enquiry" className="group min-h-11 flex items-center justify-between gap-3 border-t border-orange-900/20 pt-4 text-sm font-bold text-orange-950 focus-visible:outline-2 focus-visible:outline-orange-900">Let’s make it yours <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></Link>
                    </motion.div>

                    {reasons.map((reason, index) => (
                        <motion.article key={reason.title} {...reveal(index + 1)} whileHover={reducedMotion ? undefined : { y: -5 }} className={`group rounded-4xl border border-slate-900/5 p-6 md:p-7 ${reason.className} ${index === 2 ? 'md:col-span-2' : ''}`}>
                            <div className="flex items-center justify-between gap-4 mb-5"><span className={`h-11 w-11 flex items-center justify-center rounded-2xl ${reason.iconClass}`}><reason.icon className="h-5 w-5 group-hover:rotate-6 transition-transform" /></span><span className={`text-[9px] uppercase tracking-[0.15em] font-bold ${index === 2 ? 'text-orange-300' : 'text-slate-500'}`}>0{index + 2} / {reason.label}</span></div>
                            <h3 className={`text-xl font-bold leading-tight mb-3 ${index === 2 ? 'text-white' : 'text-slate-900'}`}>{reason.title}</h3>
                            <p className={`text-sm leading-relaxed max-w-lg ${index === 2 ? 'text-slate-400' : 'text-slate-600'}`}>{reason.text}</p>
                            {index === 2 && <p className="flex items-center gap-2 text-xs text-orange-200 mt-5"><Check className="h-4 w-4" /> Before take-off. Along the way. Back home.</p>}
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChoose;