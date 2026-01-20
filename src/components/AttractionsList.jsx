import React from 'react';
import { MapPin, CheckCircle } from 'lucide-react';

const AttractionsList = ({ attractions }) => {
    if (!attractions) return null;

    return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="text-secondary w-5 h-5" />
                Must Visit Attractions
            </h3>
            <ul className="space-y-3">
                {attractions.map((attraction, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <span>{attraction}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AttractionsList;
