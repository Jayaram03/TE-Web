import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const whatsappNumber = useMemo(() => {
        const numbers = ['919841844977', '918939718676', '919551933805'];
        return numbers[Math.floor(Math.random() * numbers.length)];
    }, []);

    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Socials */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Travel Episodes" className="h-28 w-auto" />
                        </Link>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            Crafting unforgettable journeys. Experience the beauty of the world with Travel Episodes.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/travel_episodes_/?hl=en" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1" title="Follow us on Instagram">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-green-500 hover:text-white transition-all transform hover:-translate-y-1" title="Chat with an Agent on WhatsApp">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                            </a>
                            <a href="mailto:travelepisodeschennai@gmail.com" className="bg-slate-800 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:-translate-y-1" title="Send us an Email">
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Explore</h3>
                        <ul className="space-y-4">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/destinations" className="hover:text-primary transition-colors">Destinations</Link></li>
                            <li><Link to="/enquiry" className="hover:text-primary transition-colors">Enquiry</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                                <span className="text-sm">No.1, Etti Annal Nagar, Poonamallee,<br />Chennai, Tamil Nadu 600056</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0 mt-1" />
                                <div className="flex flex-col text-sm">
                                    <a href="tel:+919841844977" className="hover:text-white">+91 98418 44977</a>
                                    <a href="tel:+918939718676" className="hover:text-white">+91 89397 18676</a>
                                    <a href="tel:+919551933805" className="hover:text-white">+91 95519 33805</a>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Mini Map */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Find Us</h3>
                        <a
                            href="https://www.google.com/maps/place/Travel+Episodes/@13.0456522,80.0917911,17z/data=!3m1!4b1!4m6!3m5!1s0x3a528b9a1b2cf29b:0x97f1cec8db27adb4!8m2!3d13.0456522!4d80.0917911!16s%2Fg%2F11tdj9kr2w"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative group overflow-hidden rounded-2xl border border-slate-700 h-48 md:h-auto md:aspect-square"
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8431791678345!2d80.0917911!3d13.0456522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a528b9a1b2cf29b%3A0x97f1cec8db27adb4!2sTravel%20Episodes!5e0!3m2!1sen!2sin!4v1769772460834!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0, pointerEvents: 'none' }}
                                allowFullScreen=""
                                loading="lazy"
                                title="Travel Episodes Map Preview"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                            ></iframe>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex flex-col items-center justify-center gap-3">
                                <img src="/google-logo.png" alt="Google" className="w-10 h-10 object-contain drop-shadow-lg transform transition-transform group-hover:scale-110" />
                                <span className="bg-white/95 text-slate-900 px-5 py-2 rounded-full text-sm font-bold shadow-xl transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                                    Open in Maps
                                </span>
                            </div>
                        </a>
                        <p className="mt-3 text-[10px] text-slate-500 text-center italic">Click to view on Google Maps</p>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Travel Episodes Private Limited. All rights reserved.</p>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
