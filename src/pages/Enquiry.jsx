import React from 'react';

const Enquiry = () => {
    return (
        <div className="pt-36 md:pt-44 pb-20 min-h-screen bg-background">
            <div className="container">
                <div className="text-center mb-12">
                    <h1 className="section-title">Plan Your Trip</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto mt-4">
                        Fill out the form below with your travel details, and our experts will get back to you with a customized itinerary within 24 hours.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-surface rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLScgsRCJAg1ZbXQ1Uk4GbL5fWShnkAWq7gLtA9POBUUpYnX4Pg/viewform?embedded=true"
                        width="100%"
                        height="800"
                        frameBorder="0"
                        marginHeight="0"
                        marginWidth="0"
                        title="Enquiry Form"
                        className="w-full"
                    >
                        Loading form...
                    </iframe>
                </div>
            </div>
        </div>
    );
};

export default Enquiry;
