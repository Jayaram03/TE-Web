import { useRef } from 'react';
import { useInView } from 'framer-motion';

// Fixed seeded positions: natural distribution without random rerender flicker.
const stars = Array.from({ length: 72 }, (_, index) => {
    const seed = Math.sin((index + 1) * 127.1) * 43758.5453;
    const seedY = Math.sin((index + 1) * 311.7) * 19642.349;
    return {
        left: `${(seed - Math.floor(seed)) * 100}%`,
        top: `${(seedY - Math.floor(seedY)) * 100}%`,
        width: index % 9 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
        height: index % 9 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
        opacity: 0.25 + (index % 6) * 0.1,
        animationDelay: `${-(index % 11)}s`,
        animationDuration: `${5 + index % 7}s`,
    };
});

const NightSky = () => {
    const ref = useRef(null);
    const visible = useInView(ref);

    return (
        <div ref={ref} aria-hidden="true" className={`night-sky ${visible ? 'is-active' : ''}`}>
            {stars.map((style, index) => <span key={index} className={`night-star ${index % 4 === 0 ? 'night-star-twinkle' : ''}`} style={style} />)}
            <svg viewBox="0 0 80 80" className="night-moon" focusable="false">
                <path d="M58 11A30 30 0 1 0 69 61A30 30 0 0 1 58 11Z" fill="#fef3c7" />
            </svg>
            <span className="shooting-star shooting-star-one" />
            <span className="shooting-star shooting-star-two" />
        </div>
    );
};

export default NightSky;