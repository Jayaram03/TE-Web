import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

const ImageLightbox = ({ photo, position, count, onClose, onPrevious, onNext, onError, restoreTarget }) => {
    const dialogRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const fallbackFocus = restoreTarget.current;
        const root = document.getElementById('root');
        const previousInert = root?.inert;
        if (root) root.inert = true;
        document.body.style.overflow = 'hidden';
        dialogRef.current?.querySelector('button')?.focus({ preventScroll: true });
        const trapFocus = event => {
            if (event.key === 'Escape') { event.preventDefault(); onClose(); }
            if (event.key !== 'Tab') return;
            const buttons = [...dialogRef.current.querySelectorAll('button:not([disabled])')];
            const first = buttons[0], last = buttons.at(-1);
            if (!dialogRef.current.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
            else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', trapFocus);
        return () => {
            if (root) root.inert = previousInert;
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', trapFocus);
            const target = previousFocus?.isConnected ? previousFocus : fallbackFocus?.isConnected ? fallbackFocus : root?.querySelector('a, button');
            target?.focus({ preventScroll: true });
        };
    }, [onClose, restoreTarget]);

    return createPortal(
        <div className="trip-lightbox-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
            <div ref={dialogRef} className="trip-lightbox" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={event => {
                if (count > 1 && event.key === 'ArrowLeft') { event.preventDefault(); onPrevious(); }
                if (count > 1 && event.key === 'ArrowRight') { event.preventDefault(); onNext(); }
            }}>
                <header className="trip-lightbox-header">
                    <h2 id={titleId}>{photo.caption}</h2>
                    <button type="button" onClick={onClose} aria-label="Close photo"><X size={22} aria-hidden="true" /></button>
                </header>
                <div className="trip-lightbox-image">
                    <img key={photo.id} src={photo.src} alt={photo.alt} decoding="async" onError={() => onError(photo.id)} />
                </div>
                <footer className="trip-lightbox-footer">
                    {count > 1 && <button type="button" onClick={onPrevious} aria-label="Previous photo"><ArrowLeft size={22} aria-hidden="true" /></button>}
                    <p role="status" aria-live="polite" aria-atomic="true">{position} of {count}</p>
                    {count > 1 && <button type="button" onClick={onNext} aria-label="Next photo"><ArrowRight size={22} aria-hidden="true" /></button>}
                </footer>
            </div>
        </div>, document.body,
    );
};

export default ImageLightbox;