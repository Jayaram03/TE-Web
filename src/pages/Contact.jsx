import React, { useMemo } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
    const whatsappNumber = useMemo(() => {
        const numbers = ['919841844977', '918939718676', '919551933805'];
        return numbers[Math.floor(Math.random() * numbers.length)];
    }, []);

    return (
        <div className="pt-36 md:pt-44 pb-20 min-h-screen bg-background">
            <div className="container">
                <div className="text-center mb-16">
                    <h1 className="section-title">Get in Touch</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto mt-4">
                        Have questions about a trip? Want to customize your itinerary? We are here to help. Reach out to us through any of the following channels.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-surface p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-1">Our Office</h4>
                                        <p className="text-slate-600">No.1, Etti Annal Nagar, Poonamallee,<br />Chennai, Tamil Nadu 600056</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-1">Phone</h4>
                                        <p className="text-slate-600 mb-1"><a href="tel:+919841844977" className="hover:text-primary transition-colors">+91 98418 44977</a></p>
                                        <p className="text-slate-600 mb-1"><a href="tel:+918939718676" className="hover:text-primary transition-colors">+91 89397 18676</a></p>
                                        <p className="text-slate-600 mb-1"><a href="tel:+919551933805" className="hover:text-primary transition-colors">+91 95519 33805</a></p>
                                        <p className="text-slate-500 text-sm mt-2">Working Hours: 24/7</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                                        <p className="text-slate-600"><a href="mailto:travelepisodeschennai@gmail.com" className="hover:text-primary transition-colors">travelepisodeschennai@gmail.com</a></p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl text-white">
                            <h3 className="text-xl font-bold mb-4">Need Immediate Assistance?</h3>
                            <p className="text-slate-300 mb-6">Our travel experts are just a WhatsApp message away.</p>
                            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
                                Chat on WhatsApp (Agent)
                            </a>
                        </div>
                    </div>

                    {/* Quick Form (Visual only, leads to enquiry mainly) */}
                    <div className="bg-surface p-8 rounded-2xl shadow-lg border border-slate-100">
                        <h3 className="text-xl font-bold mb-6">Send us a Message</h3>
                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            const name = e.target.name.value;
                            const email = e.target.email.value;
                            const message = e.target.message.value;
                            const subject = `Enquiry from ${name}`;
                            const body = `Message: \n${message} \n\nName: ${name} \nEmail: ${email}`;
                            // Construct mailto link
                            // Requirement: Send TO travelepisodeschennai, CC travelepisodeschennai (redundant but requested), Body with message & name.
                            window.location.href = `mailto:travelepisodeschennai@gmail.com?cc=travelepisodeschennai@gmail.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        }}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input name="name" type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Your Name" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input name="email" type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="your@email.com" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea name="message" rows="4" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="How can we help you?" required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">
                                Send Message (via Email App)
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
