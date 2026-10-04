import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Expand } from 'lucide-react';
import AutoScrollMarquee from './AutoScrollMarquee';
import ImageLightbox from './ImageLightbox';
import { adjacentTripPhoto, createTripPhotos, groupTripPhotos } from '../data/tripGallery';
import './tripGallery.css';

const files = import.meta.glob('/src/assets/trips/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
    eager: true, query: '?url', import: 'default',
});
const discoveredPhotos = createTripPhotos(files);

const TripGallery = () => {
    const [failedIds, setFailedIds] = useState(() => new Set());
    const [selectedId, setSelectedId] = useState(null);
    const [overflowing, setOverflowing] = useState(false);
    const trackRef = useRef(null);
    const sectionRef = useRef(null);
    const reducedMotion = useReducedMotion();
    const photos = discoveredPhotos.filter(photo => !failedIds.has(photo.id));
    const groups = groupTripPhotos(photos);
    const selected = photos.find(photo => photo.id === selectedId);
    const close = useCallback(() => setSelectedId(null), []);
    const removeFailed = useCallback(id => {
        setFailedIds(previous => previous.has(id) ? previous : new Set([...previous, id]));
        setSelectedId(previous => previous === id ? null : previous);
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const measure = () => {
            const bentos = [...track.querySelectorAll('.trip-gallery-bento')].slice(0, Math.ceil(photos.length / 3));
            const width = bentos.reduce((sum, bento) => sum + bento.getBoundingClientRect().width, 0)
                + Math.max(0, bentos.length - 1) * 16 + 32;
            const style = getComputedStyle(track);
            const available = track.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            setOverflowing(photos.length > 1 && width > available + 1);
            // AutoScrollMarquee owns one visual copy. Keep it out of the
            // accessibility tree and keyboard order; originals remain usable.
            const copy = track.querySelector('.trip-gallery-marquee > div > div > div > div:nth-child(2)');
            if (copy) {
                copy.setAttribute('aria-hidden', 'true');
                copy.querySelectorAll('button').forEach(button => { button.tabIndex = -1; });
            }
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(track);
        return () => observer.disconnect();
    }, [photos.length, overflowing, reducedMotion]);

    if (!photos.length) return null;

    const tiles = groups.map((group, index) => (
        <div key={group[0].id} className={`trip-gallery-bento trip-gallery-bento--${group.length} trip-gallery-bento--pattern-${index % 3}`}>
            {group.map(photo => (
                <button key={photo.id} data-trip-photo={photo.id} type="button" className="trip-gallery-photo" onClick={event => {
                    // Copies remain clickable, but restore focus to the original.
                    if (event.currentTarget.closest('[aria-hidden="true"]')) {
                        [...trackRef.current.querySelectorAll('button[data-trip-photo]')].find(button => button.dataset.tripPhoto === photo.id)?.focus({ preventScroll: true });
                    }
                    setSelectedId(photo.id);
                }} aria-label={`View ${photo.caption}`} aria-haspopup="dialog">
                    <img src={photo.src} alt={photo.alt} width="900" height="675" loading="lazy" decoding="async" onError={() => removeFailed(photo.id)} />
                    <span className="trip-gallery-caption">{photo.caption}</span>
                    <span className="trip-gallery-expand" aria-hidden="true"><Expand size={18} /></span>
                </button>
            ))}
        </div>
    ));

    return (
        <section ref={sectionRef} tabIndex={-1} className="trip-gallery theme-section" aria-labelledby="trip-gallery-title">
            <div className="container editorial-heading">
                <div><p className="editorial-eyebrow">Previous trips</p><h2 id="trip-gallery-title">Moments from our trips</h2></div>
                <p className="trip-gallery-count">{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</p>
            </div>
            <div ref={trackRef} className="trip-gallery-track container">
                {overflowing ? (
                    <div className="trip-gallery-marquee"><AutoScrollMarquee label="Previous trip photos" speed={28} paused={Boolean(selected)}>{tiles}</AutoScrollMarquee></div>
                ) : <div className="trip-gallery-static">{tiles}</div>}
            </div>
            {selected && <ImageLightbox photo={selected} position={photos.indexOf(selected) + 1} count={photos.length} onClose={close} onPrevious={() => setSelectedId(adjacentTripPhoto(photos, selectedId, -1))} onNext={() => setSelectedId(adjacentTripPhoto(photos, selectedId, 1))} onError={removeFailed} restoreTarget={sectionRef} />}
        </section>
    );
};

export default TripGallery;