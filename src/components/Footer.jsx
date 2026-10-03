import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Mail, MapPin, MessageCircle, Phone, Plane } from 'lucide-react';
import LandmarkSkyline from './LandmarkSkyline';
import NightSky from './NightSky';
import ScrollReveal from './ScrollReveal';

const Footer = () => {
    const [whatsappNumber] = useState(() => {
        const numbers = ['919841844977', '918939718676', '919551933805'];
        return numbers[Math.floor(Math.random() * numbers.length)];
    });

    return (
        <footer className="bg-slate-950 text-slate-300 relative overflow-x-clip">
            <div className="relative isolate overflow-hidden bg-linear-to-b from-slate-900 via-indigo-950/30 to-slate-950 pt-14 md:pt-24">
                <NightSky />
                <div className="container relative z-10">
                    <div className="flex items-center justify-between gap-4 text-[10px] md:text-xs uppercase tracking-[0.2em] text-orange-300 mb-7"><span className="inline-flex items-center gap-2"><Plane className="h-4 w-4" /> The departure lounge</span><span className="hidden sm:block">Next stop: your next chapter</span></div>
                    <ScrollReveal tilt={-2}>
                        <Link to="/enquiry" className="group block border-y border-white/15 py-8 md:py-12 focus-visible:outline-2 focus-visible:outline-orange-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"><p className="text-[clamp(42px,8vw,112px)] font-black text-white leading-[0.95] tracking-[-0.05em]">See you<br /><span className="text-orange-300">somewhere new.</span></p><span className="shrink-0 flex items-center justify-center h-14 w-14 md:h-24 md:w-24 rounded-full border border-white/30 group-hover:bg-orange-300 group-hover:text-slate-950 transition-colors"><ArrowUpRight className="h-7 w-7 md:h-12 md:w-12" /></span></div>
                            <p className="mt-6 text-sm md:text-base text-slate-400 flex items-center gap-3">Your ideas. Our expertise. One unforgettable trip.<span className="hidden md:inline text-orange-300 font-bold">Let’s plan it →</span></p>
                        </Link>
                    </ScrollReveal>
                    <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 md:gap-12 pb-8">
                        <div>
                            <Link to="/" aria-label="Travel Episodes home" className="inline-flex rounded-2xl bg-white p-3 mb-5 hover:-rotate-2 transition-transform focus-visible:outline-2 focus-visible:outline-orange-300"><img src="/logo.png" alt="Travel Episodes" width="176" height="80" loading="lazy" className="h-16 md:h-20 w-auto max-w-44 object-contain" /></Link>
                            <div className="flex items-center gap-3 mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-300"><span>Chennai roots</span><span className="flex items-center gap-1.5 text-white/30" aria-hidden="true"><span className="w-5 border-t border-dashed border-current" /><Plane className="h-3.5 w-3.5 -rotate-12" /><span className="w-5 border-t border-dashed border-current" /></span><span>Limitless horizons</span></div>
                            <p className="text-sm leading-relaxed text-slate-400 max-w-sm mb-5">Trips worth taking. Stories worth keeping. A real travel crew to make it all happen.</p>
                            <div className="flex gap-2">
                                {[
                                    { label: 'Instagram', href: 'https://www.instagram.com/travel_episodes_/?hl=en', icon: Instagram, external: true },
                                    { label: 'WhatsApp', href: `https://wa.me/${whatsappNumber}`, icon: MessageCircle, external: true },
                                    { label: 'Email', href: 'mailto:travelepisodeschennai@gmail.com', icon: Mail },
                                ].map(social => <a key={social.label} href={social.href} aria-label={social.label} target={social.external ? '_blank' : undefined} rel={social.external ? 'noopener noreferrer' : undefined} className="h-11 w-11 flex items-center justify-center rounded-full border border-white/15 hover:border-orange-300 hover:text-orange-300 transition-colors"><social.icon className="h-4 w-4" /></a>)}
                            </div>
                            <address aria-label="Call our travel team" className="not-italic mt-5 grid gap-2 max-w-xs">
                                {[
                                    ['+919841844977', '+91 98418 44977'],
                                    ['+918939718676', '+91 89397 18676'],
                                    ['+919551933805', '+91 95519 33805'],
                                ].map(([number, label]) => <a key={number} href={`tel:${number}`} className="group flex min-h-11 items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm leading-6 tabular-nums text-slate-300 hover:border-orange-300/40 hover:text-orange-300 transition-colors focus-visible:outline-2 focus-visible:outline-orange-300"><Phone className="h-4 w-4 shrink-0 text-orange-300" aria-hidden="true" /><span>{label}</span><ArrowUpRight className="ml-auto h-3.5 w-3.5 text-slate-500 group-hover:text-orange-300" aria-hidden="true" /></a>)}
                            </address>
                        </div>
                        <div>
                            <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-6">
                                {[
                                    { name: 'Find your escape', path: '/destinations' },
                                    { name: 'Make it personal', path: '/enquiry' },
                                    { name: 'Our home', path: '/' },
                                    { name: 'Say hello', path: '/contact' },
                                ].map((link, index) => <Link key={link.path} to={link.path} className="flex items-center justify-between gap-2 border-b border-white/10 py-5 hover:text-orange-300 transition-colors"><span><span className="block text-[9px] text-slate-500 mb-2">0{index + 1} / EXPLORE</span><span className="font-semibold text-sm md:text-lg">{link.name}</span></span><ArrowUpRight className="h-4 w-4 shrink-0" /></Link>)}
                            </nav>
                            <a href="https://www.google.com/maps/search/?api=1&query=Travel+Episodes+Poonamallee+Chennai" target="_blank" rel="noopener noreferrer" className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-orange-300/40 transition-colors"><MapPin className="h-5 w-5 text-orange-300 shrink-0" /><span className="flex-1 text-xs leading-relaxed text-slate-400"><span className="block text-white font-semibold mb-1">Drop by the planning room</span>No.1, Etti Annal Nagar, Poonamallee,<br />Chennai, Tamil Nadu 600056</span><ArrowUpRight className="h-4 w-4 shrink-0" /></a>
                        </div>
                    </div>
                </div>
                <LandmarkSkyline />
            </div>
            <div className="container py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 text-[10px] md:text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} Travel Episodes Private Limited. All rights reserved.</p>
                <p className="uppercase tracking-[0.15em]">One world. Endless episodes.</p>
            </div>
        </footer>
    );
};

export default Footer;
