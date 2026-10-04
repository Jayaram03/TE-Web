import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Star, X } from 'lucide-react';
import { googleBusiness } from '../data/googleBusiness';

const ReviewDialog = ({ review, onClose }) => {
    const ref = useRef(null);
    useEffect(() => {
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const root = document.getElementById('root');
        const previousInert = root.inert;
        root.inert = true;
        document.body.style.overflow = 'hidden';
        document.documentElement.dataset.reviewOpen = 'true';
        ref.current?.querySelector('button')?.focus({ preventScroll: true });
        const keyDown = event => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'Tab') {
                const elements = [...ref.current.querySelectorAll('button, a[href]')];
                if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements.at(-1).focus(); }
                else if (!event.shiftKey && document.activeElement === elements.at(-1)) { event.preventDefault(); elements[0].focus(); }
            }
        };
        document.addEventListener('keydown', keyDown);
        return () => {
            root.inert = previousInert;
            document.body.style.overflow = previousOverflow;
            delete document.documentElement.dataset.reviewOpen;
            document.removeEventListener('keydown', keyDown);
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-[150] bg-slate-950/70 px-4 py-8 flex items-center justify-center" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
            <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="review-dialog-title" className="theme-card w-full max-w-xl max-h-[85svh] overflow-y-auto overscroll-contain rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex items-start justify-between gap-4 mb-4"><div><h2 id="review-dialog-title" className="text-xl font-bold">{review.name}</h2><p className="text-xs text-slate-500 mt-1">{review.date}</p></div><button type="button" onClick={onClose} aria-label="Close review" className="h-11 w-11 shrink-0 rounded-full border border-slate-200 grid place-items-center"><X size={20} /></button></div>
                <div className="flex gap-1 mb-5" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} aria-hidden="true" className={index < review.rating ? 'fill-primary text-primary' : 'text-slate-400'} />)}</div>
                <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{review.text}</p>
                <a href={googleBusiness.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary mt-5"><img src="/google-logo.png" alt="" width="16" height="16" />Google reviews</a>
            </div>
        </div>, document.body,
    );
};

export default ReviewDialog;