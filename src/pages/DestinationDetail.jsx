import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { destinations } from '../data/destinations';
import { ArrowLeft } from 'lucide-react';
import ItineraryList from '../components/ItineraryList';
import AttractionsList from '../components/AttractionsList';

const DestinationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const destination = destinations.find(d => d.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!destination) {
        return (
            <div className="pt-32 text-center bg-background min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Destination Not Found</h2>
                <Link to="/destinations" className="text-primary hover:underline">Back to Destinations</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Header */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
                        {destination.name}
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {destination.tagline}
                    </p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-24 left-4 md:left-8 bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 text-white transition-all"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="container -mt-20 relative z-10">
                <div className="bg-surface rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
                    {/* Quick Info Bar */}
                    <div className="flex flex-wrap gap-8 justify-between border-b border-slate-100 pb-8 mb-8">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Duration</p>
                            <p className="font-semibold text-lg">{destination.duration}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Best Time to Visit</p>
                            <p className="font-semibold text-lg">{destination.bestTime || 'Year Round'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm mb-1">Starting Price</p>
                            <p className="font-semibold text-lg text-secondary">{destination.price}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Content */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* About */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4 text-slate-900">About the Place</h2>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {destination.description}
                                </p>
                            </section>

                            {/* Itinerary */}
                            {destination.itinerary ? (
                                <ItineraryList itinerary={destination.itinerary} />
                            ) : (
                                <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
                                    <h3 className="font-bold text-lg text-primary mb-2">Detailed Itinerary</h3>
                                    <p className="text-slate-600">
                                        We offer fully customizable itineraries for {destination.name}.
                                        Please contact us to get a day-wise plan tailored to your preferences.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Must Visit */}
                            <AttractionsList attractions={destination.attractions} />

                            {/* Booking CTA */}
                            <div className="bg-surface border border-slate-200 rounded-xl p-6 text-center sticky top-24">
                                <h3 className="font-bold text-xl mb-2">Interested in this Trip?</h3>
                                <p className="text-slate-500 mb-6"> customized packages available for families, couples, and groups.</p>
                                <Link to="/enquiry" className="btn btn-secondary w-full py-4 text-lg shadow-lg hover:shadow-xl mb-4">
                                    Book Now
                                </Link>
                                <Link to="/contact" className="text-slate-500 text-sm hover:text-secondary">
                                    Talk to an expert first
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationDetail;
