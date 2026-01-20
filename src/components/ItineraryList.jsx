import React from 'react';

const ItineraryList = ({ itinerary }) => {
    if (!itinerary) return null;

    return (
        <section>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Itinerary</h2>
            <div className="space-y-6">
                {itinerary.map((item, index) => (
                    <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                {item.day}
                            </div>
                            {index !== itinerary.length - 1 && (
                                <div className="w-0.5 h-full bg-slate-200 my-2"></div>
                            )}
                        </div>
                        <div className="pb-6">
                            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ItineraryList;
