import { ArrowUpRight, Check } from 'lucide-react';
import { trendingDestinations } from '../data/trendingDestinations';
import './travelEditorial.css';

const TrendingTripPicker = ({ selected, onSelect }) => (
    <div className="enquiry-trending-picker" role="group" aria-labelledby="enquiry-trending-title">
        {trendingDestinations.map(destination => {
            const isSelected = selected === destination.name;
            return (
                <button key={destination.id} type="button" className="editorial-trip-choice" aria-label={destination.name} aria-pressed={isSelected} onClick={() => onSelect(destination.name)}>
                    <span className="editorial-trip-photo">
                        <img src={destination.image} alt="" width="320" height="240" loading="lazy" decoding="async" />
                        {isSelected && <span className="editorial-trip-check" aria-hidden="true"><Check size={16} /></span>}
                    </span>
                    <span className="editorial-trip-ticket"><span className="editorial-trip-name">{destination.name}</span><span className="editorial-trip-status">{isSelected ? 'Selected' : 'Choose destination'}{isSelected ? <Check size={13} aria-hidden="true" /> : <ArrowUpRight size={13} aria-hidden="true" />}</span></span>
                </button>
            );
        })}
    </div>
);

export default TrendingTripPicker;