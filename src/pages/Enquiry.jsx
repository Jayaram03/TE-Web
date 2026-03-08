import React from 'react';
import { Sparkles, Bot, ArrowRight } from 'lucide-react';

const Enquiry = () => {
    const openChatbot = () => {
        window.dispatchEvent(new CustomEvent('open-te-chatbot'));
    };

    return (
        <div className="pt-36 md:pt-44 pb-20 min-h-screen bg-background">
            <div className="container max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="section-title">Plan Your Trip</h1>
                    <p className="text-slate-600 mx-auto mt-4 text-lg">
                        Choose how you'd like to plan your perfect getaway.
                    </p>
                </div>

                {/* AI Assistant CTA */}
                <div className="mb-12 bg-surface border border-primary/30 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none transition-transform group-hover:scale-110 duration-700 delay-100"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-dark text-sm font-bold mb-5 tracking-wide uppercase">
                                <Sparkles size={16} /> Highly Recommended
                            </div>
                            <h2 className="text-3xl md:text-4xl font-heading text-slate-900 font-bold mb-4 flex items-center justify-center md:justify-start gap-4">
                                Ask <span className="text-primary">Aria</span> <Bot size={36} className="text-primary" />
                            </h2>
                            <p className="text-slate-600 md:text-lg mb-0 leading-relaxed max-w-xl">
                                Don't want to fill out a long form? Chat with our intelligent travel assistant to generate a personalised sample itinerary and get a quote in just <strong>2 minutes</strong>!
                            </p>
                        </div>
                        
                        <div className="w-full md:w-auto flex flex-col items-center shrink-0">
                            <button 
                                onClick={openChatbot}
                                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(249,115,22,0.35)] hover:-translate-y-1"
                            >
                                Chat with Aria <ArrowRight size={20} />
                            </button>
                            <span className="text-sm text-slate-500 mt-4 flex items-center gap-1.5 font-medium">
                                <Sparkles size={14} className="text-accent" /> Instant AI Itinerary
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-12 opacity-60">
                    <div className="flex-1 h-px bg-slate-300"></div>
                    <span className="text-slate-500 font-semibold tracking-wide text-sm">OR FILL THE TRADITIONAL FORM</span>
                    <div className="flex-1 h-px bg-slate-300"></div>
                </div>

                {/* Google Form */}
                <div className="bg-surface rounded-3xl shadow-lg overflow-hidden border border-slate-100 p-2">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLScgsRCJAg1ZbXQ1Uk4GbL5fWShnkAWq7gLtA9POBUUpYnX4Pg/viewform?embedded=true"
                        width="100%"
                        height="1200"
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

