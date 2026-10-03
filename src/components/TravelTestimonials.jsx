import { useState } from 'react';
import { ArrowUpRight, Quote, Star } from 'lucide-react';
import { googleReviews } from '../data/reviews';
import AutoScrollMarquee from './AutoScrollMarquee';
import ScrollReveal from './ScrollReveal';

const ReviewCard = ({ review, tall, tone }) => {
    const [expanded, setExpanded] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    return (
        <article className={`rounded-2xl border border-slate-900/5 p-4 flex flex-col transition-shadow hover:shadow-lg ${tall ? 'min-h-56' : 'min-h-48'} ${tone}`}>
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`h-3 w-3 ${index < review.rating ? 'fill-primary text-primary' : 'text-slate-300'}`} />)}</div>
                <Quote className="h-5 w-5 text-slate-900/15" aria-hidden="true" />
            </div>
            <p className={`text-xs md:text-[13px] leading-relaxed text-slate-700 flex-1 ${expanded ? '' : tall ? 'line-clamp-4' : 'line-clamp-3'}`}>“{review.text}”</p>
            <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="self-start min-h-11 text-[11px] font-bold text-primary-dark focus-visible:outline-2 focus-visible:outline-primary rounded">{expanded ? 'Less of the story −' : 'The full story +'}</button>
            <div className="flex items-center gap-2.5 border-t border-slate-900/5 pt-3">
                {imageFailed ? <span className="h-8 w-8 shrink-0 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-900" aria-hidden="true">{review.name.slice(0, 1).toUpperCase()}</span> : <img src={review.image} alt="" loading="lazy" decoding="async" className="h-8 w-8 shrink-0 rounded-full object-cover" onError={() => setImageFailed(true)} />}
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-900">{review.name}</p><p className="text-[9px] text-slate-500 mt-0.5">{review.date}</p></div>
                <img src="/google-logo.png" alt="Google review" width="16" height="16" className="h-4 w-4 object-contain" />
            </div>
        </article>
    );
};

const TravelTestimonials = () => {
    const reviews = googleReviews.slice(0, 20);
    const columns = Array.from({ length: Math.ceil(reviews.length / 2) }, (_, index) => reviews.slice(index * 2, index * 2 + 2));
    return (
        <section aria-labelledby="testimonials-title" className="py-14 md:py-20 bg-[#f5f1e9] overflow-hidden relative">
            <div className="container mb-5 md:mb-8">
                <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6" tilt={1}>
                    <div><p className="text-xs uppercase tracking-[0.2em] font-bold text-primary mb-3">The post-trip glow</p><h2 id="testimonials-title" className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">Good trips.<br /><span className="text-primary">Even better stories.</span></h2><p className="text-sm text-slate-600 mt-4 max-w-md">A little wall of happy memories, straight from our travellers.</p></div>
                    <div className="flex items-center gap-4 rounded-2xl bg-white border border-orange-200 p-4 md:p-5"><span className="text-5xl md:text-6xl font-black tracking-tight text-slate-900">4.9<span className="text-base text-slate-400">/5</span></span><div><div className="flex gap-1 mb-2" aria-label="Five stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-3 w-3 text-primary fill-primary" aria-hidden="true" />)}</div><p className="text-xs font-semibold text-slate-600">Average Google rating</p><p className="text-[10px] text-slate-500 mt-1">1000+ explorers. Countless memories.</p></div></div>
                </ScrollReveal>
            </div>
            <AutoScrollMarquee label="Traveler testimonials" speed={38}>
                {columns.map((column, index) => <div key={column[0].name} className="w-[min(76vw,260px)] md:w-72 shrink-0 flex flex-col gap-3">
                    {column.map((review, row) => <ReviewCard key={review.name} review={review} tall={(index + row) % 2 === 0} tone={(index + row) % 3 === 0 ? 'bg-orange-100/70' : (index + row) % 3 === 1 ? 'bg-white' : 'bg-indigo-50'} />)}
                </div>)}
            </AutoScrollMarquee>
            <div className="container mt-5 flex justify-center"><a href="https://www.google.com/search?q=Travel+Episodes+Chennai+reviews" target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 items-center gap-3 text-sm font-bold text-slate-700 hover:text-primary-dark rounded-full border border-slate-300 px-5 py-3 transition-colors"><img src="/google-logo.png" alt="" className="h-4 w-4" />More stories on Google <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></a></div>
        </section>
    );
};

export default TravelTestimonials;