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

                {/* Map Section */}
                <div className="mt-20">
                    <div className="bg-surface rounded-3xl overflow-hidden shadow-xl border border-slate-100 p-2">
                        <div className="relative h-[450px] w-full rounded-2xl overflow-hidden group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8431791678345!2d80.0917911!3d13.0456522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a528b9a1b2cf29b%3A0x97f1cec8db27adb4!2sTravel%20Episodes!5e0!3m2!1sen!2sin!4v1769772460834!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerpolicy="no-referrer-when-downgrade"
                                title="Travel Episodes Location"
                                className="w-full h-full"
                            ></iframe>

                            <div className="absolute bottom-6 right-6">
                                <a
                                    href="https://www.google.com/maps/place/Travel+Episodes/@13.0456522,80.0917911,17z/data=!3m1!4b1!4m6!3m5!1s0x3a528b9a1b2cf29b:0x97f1cec8db27adb4!8m2!3d13.0456522!4d80.0917911!16s%2Fg%2F11tdj9kr2w"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary shadow-2xl flex items-center justify-center gap-3 px-8 py-4 w-full md:w-auto"
                                >
                                    <img src="/google-logo.png" alt="Google" className="w-5 h-5 object-contain" />
                                    Open in Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 font-medium">Located in Poonamallee, Chennai – Visit us for a personal consultation!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
