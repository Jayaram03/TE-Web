import { useState, useCallback } from 'react';
import { ArrowUpRight, Quote, Star } from 'lucide-react';
import { googleReviews } from '../data/reviews';
import AutoScrollMarquee from './AutoScrollMarquee';
import ReviewDialog from './ReviewDialog';
import { googleBusiness } from '../data/googleBusiness';
import './travelEditorial.css';

const ReviewCard = ({ review, onOpen }) => {
    const [imageFailed, setImageFailed] = useState(false);
    return (
        <button type="button" onClick={() => onOpen(review)} aria-label={`Read full review by ${review.name}`} className="editorial-review-card">
            <div className="editorial-review-top">
                <span className="editorial-review-stars" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} aria-hidden="true" className={index < review.rating ? 'editorial-star-filled' : ''} />)}</span>
                <Quote size={22} className="editorial-review-quote" aria-hidden="true" />
            </div>
            <span className="editorial-review-excerpt line-clamp-4">“{review.text}”</span>
            <span className="editorial-review-read">Read full review <ArrowUpRight size={14} aria-hidden="true" /></span>
            <div className="editorial-review-author">
                {imageFailed ? <span className="editorial-review-avatar editorial-review-initial" aria-hidden="true">{review.name.slice(0, 1).toUpperCase()}</span> : <img src={review.image} alt="" width="32" height="32" loading="lazy" decoding="async" className="editorial-review-avatar" onError={() => setImageFailed(true)} />}
                <div className="editorial-review-name"><p>{review.name}</p><span>{review.date}</span></div>
                <img src="/google-logo.png" alt="Google review" width="18" height="18" className="editorial-google-icon" />
            </div>
        </button>
    );
};

const TravelTestimonials = () => {
    const [selectedReview, setSelectedReview] = useState(null);
    const closeReview = useCallback(() => setSelectedReview(null), []);
    const reviews = googleReviews;
    const columns = Array.from({ length: Math.ceil(reviews.length / 2) }, (_, index) => reviews.slice(index * 2, index * 2 + 2));
    return (
        <section aria-labelledby="testimonials-title" className="editorial-testimonials theme-section">
            <div className="container">
                <p className="editorial-eyebrow">The stories they brought home</p>
                <div className="editorial-review-heading">
                    <h2 id="testimonials-title">Traveller reviews</h2>
                    <div className="editorial-rating" aria-label="Google rating snapshot: 4.9 out of 5. Not a live rating.">
                        <span className="editorial-rating-value">4.9<span>/5</span></span>
                        <div className="editorial-rating-source"><span className="editorial-google-brand"><img src="/google-logo.png" alt="" width="18" height="18" /> Google reviews</span><span>Rating snapshot · not live</span></div>
                    </div>
                </div>
            </div>
            <AutoScrollMarquee label="Traveler testimonials" speed={38} paused={Boolean(selectedReview)}>
                {columns.map(column => <div key={column[0].name} className="editorial-review-column">
                    {column.map(review => <ReviewCard key={review.name} review={review} onOpen={setSelectedReview} />)}
                </div>)}
            </AutoScrollMarquee>
            <div className="container editorial-review-actions">
                <a href={googleBusiness.mapsUrl} target="_blank" rel="noopener noreferrer" className="editorial-action">Google reviews <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
            </div>
            <div className="container">
                <div className="google-review-invite">
                    <div><h3>How was your trip?</h3><p>Share your experience on Google.</p></div>
                    <div className="google-review-star-links" role="group" aria-label="Write a Google review">
                        {[1, 2, 3, 4, 5].map(value => <a key={value} href={googleBusiness.reviewUrl} target="_blank" rel="noopener noreferrer" aria-label={`Rate ${value} ${value === 1 ? 'star' : 'stars'} on Google (opens in a new tab)`}><Star size={26} aria-hidden="true" /></a>)}
                    </div>
                </div>
            </div>
            {selectedReview && <ReviewDialog review={selectedReview} onClose={closeReview} />}
        </section>
    );
};

export default TravelTestimonials;