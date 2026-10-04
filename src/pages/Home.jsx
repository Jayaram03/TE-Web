import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Plane } from 'lucide-react';
import { trendingDestinations } from '../data/trendingDestinations';
import HomeHero from '../components/HomeHero';
import TravelTestimonials from '../components/TravelTestimonials';
import TripGallery from '../components/TripGallery';
import '../components/travelEditorial.css';

const Home = () => (
    <div className="home-page min-h-screen bg-background overflow-x-clip">
        <HomeHero />
        <section aria-labelledby="trending-title" className="home-trending editorial-trending theme-section">
            <div className="container">
                <div className="editorial-heading">
                    <div><p className="editorial-eyebrow">The getaway edit</p><h2 id="trending-title">Trending destinations</h2></div>
                    <Link to="/destinations" className="editorial-view-all">View all <ArrowUpRight size={18} aria-hidden="true" /></Link>
                </div>
                <div className="editorial-mosaic">
                    {trendingDestinations.map((destination, index) => (
                        <Link key={destination.id} to={`/destinations/${destination.id}`} className={`editorial-destination editorial-destination--${index + 1}`} aria-label={`Explore ${destination.name}, ${destination.duration}`}>
                            <img src={destination.image} alt="" width="800" height="600" loading="lazy" decoding="async" />
                            <span className="editorial-duration">{destination.duration}</span>
                            <div className="editorial-photo-caption">
                                <div>{index === 0 && <span className="editorial-feature-label">Slow days, beautiful places</span>}<h3>{destination.name}</h3>{index === 0 && <p>{destination.tagline}</p>}</div>
                                <span className="editorial-photo-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
        <TripGallery />
        <TravelTestimonials />
        <section className="editorial-enquiry theme-section" aria-labelledby="home-enquiry-title">
            <div className="container"><div className="home-enquiry-cta editorial-boarding-pass">
                <div className="editorial-ticket-body">
                    <p className="editorial-eyebrow"><Plane size={16} aria-hidden="true" /> Your next departure</p>
                    <h2 id="home-enquiry-title">Good trips start here.</h2>
                    <p className="editorial-ticket-copy">Your destination. Your dates. A trip made for you.</p>
                </div>
                <div className="editorial-ticket-stub">
                    <span className="editorial-ticket-label">Admit one adventure</span>
                    <Link to="/enquiry" className="editorial-quote-link">Get a quote <ArrowRight size={20} aria-hidden="true" /></Link>
                    <span className="editorial-ticket-barcode" aria-hidden="true" />
                </div>
            </div></div>
        </section>
    </div>
);

export default Home;
