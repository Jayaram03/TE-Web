import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Plane, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { destinations } from '../data/destinations';

const AdventureCTA = () => {
    const reducedMotion = useReducedMotion();
    const image = destinations.find(destination => destination.id === 'manali')?.image;
    return (
        <section aria-labelledby="adventure-title" className="bg-[#f5f1e9] py-10 md:py-20">
            <div className="container">
                <div className="grid lg:grid-cols-[1.2fr_0.8fr] rounded-4xl overflow-hidden bg-orange-200 border border-orange-300/50">
                    <div className="relative p-6 sm:p-8 md:p-12">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-900 mb-6"><Sparkles className="h-4 w-4" /> Ready to start your adventure?</p>
                        <motion.h2 id="adventure-title" initial={reducedMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-[clamp(38px,5.5vw,76px)] font-black tracking-[-0.05em] leading-[1.03] text-orange-950">Your next<br />“remember when?”<br /><span className="text-primary-dark">starts here.</span></motion.h2>
                        <p className="mt-6 max-w-md text-sm md:text-base leading-relaxed text-orange-950/70">The mountain morning. The unexpected detour. The story you’ll tell for years. Bring us your ideas — we’ll take care of the details.</p>
                        <div className="flex flex-col sm:flex-row gap-3 mt-7">
                            <Link to="/enquiry" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-orange-950 transition-colors focus-visible:outline-2 focus-visible:outline-primary-dark">Plan my next chapter <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></Link>
                            <Link to="/destinations" className="inline-flex min-h-12 items-center justify-center gap-2 px-3 text-sm font-bold text-orange-950 underline underline-offset-4">Still dreaming? Explore <Compass className="h-4 w-4" /></Link>
                        </div>
                        <p className="text-[10px] text-orange-900/70 mt-5">A free quote. A real conversation. No pressure.</p>
                    </div>
                    <div className="relative min-h-72 lg:min-h-full bg-slate-900 overflow-hidden">
                        <img src={image} alt="Mountain scenery in Manali" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/10 to-slate-950/20" />
                        <div className="absolute inset-x-5 top-5 flex justify-between items-center text-white"><span className="text-[9px] uppercase tracking-widest rounded-full border border-white/40 px-3 py-2 bg-slate-900/20">One ticket to possibility</span><Plane className="h-5 w-5 -rotate-12" /></div>
                        <motion.div initial={reducedMotion ? false : { y: 25, rotate: -4, opacity: 0 }} whileInView={{ y: 0, rotate: -2, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className="absolute left-5 right-5 bottom-6 bg-[#fffaf0] text-slate-900 rounded-xl shadow-xl p-5">
                            <div className="flex items-center justify-between border-b border-dashed border-orange-300 pb-3 mb-3"><span className="text-[9px] uppercase tracking-[0.18em] font-bold text-primary-dark">Your next episode</span><Plane className="h-4 w-4 text-primary-dark" /></div>
                            <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] uppercase tracking-widest text-slate-500">From</p><p className="text-xl font-black">Someday</p></div><span className="flex-1 border-t border-dashed border-orange-300 mx-1" aria-hidden="true" /><div><p className="text-[9px] uppercase tracking-widest text-slate-500">To</p><p className="text-xl font-black text-primary-dark">Let’s go.</p></div></div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AdventureCTA;