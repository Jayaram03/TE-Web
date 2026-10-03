import { Compass, MapPin, Plane } from 'lucide-react';
import { destinations } from '../data/destinations';

const TravelPageHeader = ({ eyebrow, title, accent, description, destinationId = 'alleppey', note, children }) => {
    const destination = destinations.find(item => item.id === destinationId) || destinations[0];

    return (
        <header className="travel-page-header mb-8 md:mb-12">
            <svg viewBox="0 0 1000 450" className="travel-header-map" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">
                <path d="M-60 390C60 100 300 500 400 200S800 10 1070 220M-40 410C90 120 310 520 440 240S810 60 1040 250M-20 450C110 160 310 570 480 280S840 100 1080 300" />
                <path d="M570 310C650 150 820 410 1000 130" strokeDasharray="5 9" />
                <circle cx="660" cy="235" r="10" /><circle cx="960" cy="170" r="7" />
            </svg>
            <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
                <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-primary-dark mb-4"><Compass className="h-4 w-4" aria-hidden="true" />{eyebrow}</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.06] font-black tracking-tight text-slate-900 mb-4">{title}<br /><span className="text-primary">{accent}</span></h1>
                    <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">{description}</p>
                    {children && <div className="mt-6">{children}</div>}
                </div>
                <div className="travel-postcard relative mx-auto w-full max-w-sm lg:max-w-none">
                    <div className="rounded-2xl border border-white bg-white p-2.5 shadow-xl shadow-slate-900/10 rotate-2">
                        <div className="relative h-36 sm:h-44 lg:h-60 overflow-hidden rounded-xl bg-slate-200">
                            <img src={destination.image} alt={`${destination.name} travel inspiration`} width="480" height="300" decoding="async" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-linear-to-t from-slate-950/50 to-transparent" />
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm font-semibold text-white"><MapPin className="h-4 w-4" aria-hidden="true" />{destination.name}</div>
                        </div>
                        <div className="flex items-center justify-between gap-3 px-2 pt-3 pb-1 text-[10px] sm:text-xs font-bold tracking-wide text-slate-500"><span>TRAVEL EPISODES / FIELD NOTES</span><Plane className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /></div>
                    </div>
                    <div className="absolute -left-2 -bottom-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 -rotate-3 text-xs font-bold text-primary-dark shadow-sm">{note || 'Collect moments, not things.'}</div>
                    <div aria-hidden="true" className="absolute -right-2 -top-3 rotate-12 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-orange-50 text-primary"><Compass className="h-7 w-7" /></div>
                </div>
            </div>
        </header>
    );
};

export default TravelPageHeader;