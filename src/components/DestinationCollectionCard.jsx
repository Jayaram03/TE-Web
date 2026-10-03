import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, MapPin } from 'lucide-react';

const DestinationCollectionCard = ({ destination, index }) => (
    <Link to={`/destinations/${destination.id}`} className="group grid h-full grid-cols-[104px_minmax(0,1fr)] sm:grid-cols-1 rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-primary">
        <div className="relative h-full min-h-40 sm:h-52 bg-slate-200 overflow-hidden">
            <img src={destination.image} alt={destination.name} loading="lazy" decoding="async" width="400" height="260" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-700">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="p-4 sm:p-5 min-w-0 flex flex-col">
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500 mb-2"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{destination.state || destination.region}</span></p>
            <h3 className="text-xl sm:text-2xl leading-tight tracking-tight mb-2 group-hover:text-primary transition-colors">{destination.name}</h3>
            <p className="hidden sm:block text-sm text-slate-500 line-clamp-2 mb-4">{destination.tagline}</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-3"><Clock className="h-3 w-3 shrink-0" />{destination.duration}</p>
            <div className="mt-auto flex items-end justify-between gap-2"><div><p className="text-[9px] uppercase tracking-widest text-slate-400">Starting from</p><p className="text-sm sm:text-lg font-bold text-primary">{destination.price}</p></div><ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-primary shrink-0" aria-hidden="true" /></div>
        </div>
    </Link>
);

export default DestinationCollectionCard;