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
                    {/* Brand */}
                    <div className="space-y-2">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Travel Episodes" className="h-32 w-auto" />
                        </Link>
                        <p className="text-slate-400 leading-relaxed">
                            Crafting unforgettable journeys. Experience the beauty of the world with Travel Episodes.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
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
                            <li className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <span>No.1, Etti Annal Nagar, Poonamallee,<br />Chennai, Tamil Nadu 600056</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="w-6 h-6 text-primary shrink-0" />
                                <div className="flex flex-col">
                                    <a href="tel:+919841844977" className="hover:text-white">+91 98418 44977</a>
                                    <a href="tel:+918939718676" className="hover:text-white">+91 89397 18676</a>
                                    <a href="tel:+919551933805" className="hover:text-white">+91 95519 33805</a>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-primary shrink-0" />
                                <a href="mailto:travelepisodeschennai@gmail.com" className="hover:text-white">travelepisodeschennai@gmail.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/travel_episodes_/?hl=en" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-3 rounded-full hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1" title="Follow us on Instagram">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-3 rounded-full hover:bg-green-500 hover:text-white transition-all transform hover:-translate-y-1" title="Chat with an Agent on WhatsApp">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                            </a>
                            <a href="mailto:travelepisodeschennai@gmail.com" className="bg-slate-800 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:-translate-y-1" title="Send us an Email">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Travel Episodes Private Limited. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
