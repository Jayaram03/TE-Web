import { useRef } from 'react';
import { useInView } from 'framer-motion';
import NightSky from './NightSky';

const TravelAtmosphere = ({ light = false }) => {
    const ref = useRef(null);
    const visible = useInView(ref);

    return (
        <div ref={ref} aria-hidden="true" className={`travel-atmosphere ${visible ? 'is-active' : ''} ${light ? 'travel-atmosphere-light' : ''}`}>
            {!light && <NightSky />}
            <svg viewBox="0 0 1200 500" preserveAspectRatio="none" className="travel-route" focusable="false">
                <path d="M-50 360C140 120 260 490 460 290S730 50 850 220S1110 470 1250 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 12" />
            </svg>
            <div className="travel-orbit">
                <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" stroke="currentColor" focusable="false">
                    <circle cx="50" cy="50" r="46" strokeDasharray="2 7" />
                    <circle cx="50" cy="50" r="34" />
                    <path d="M50 18V27M50 73V82M18 50H27M73 50H82M59 41L54 54L41 59L46 46Z" />
                </svg>
            </div>
        </div>
    );
};

export default TravelAtmosphere;