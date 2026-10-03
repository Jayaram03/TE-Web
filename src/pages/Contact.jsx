import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight, Plane } from 'lucide-react';

const Contact = () => {
    const [whatsappNumber] = useState(() => {
        const numbers = ['919841844977', '918939718676', '919551933805'];
        return numbers[Math.floor(Math.random() * numbers.length)];
    });

    return (
        <div className="pt-28 md:pt-40 pb-16 md:pb-20 min-h-screen bg-[#faf8f4] relative overflow-x-clip">
            <div className="container relative z-10">
                <header className="grid md:grid-cols-[1.2fr_1fr] items-center gap-8 md:gap-16 mb-10 md:mb-14 py-4 md:py-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Good trips start with good conversations.</p>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-5">Hello,<br /><span className="text-primary">fellow explorer.</span></h1>
                        <p className="text-slate-600 text-sm md:text-lg leading-relaxed max-w-lg">Got a question or a destination you can’t stop thinking about? You’re in the right place. Let’s talk travel.</p>
                    </div>
                    <div className="relative max-w-sm w-full mx-auto rounded-3xl border border-orange-200 bg-orange-50 p-6 md:p-8 rotate-2">
                        <div className="absolute top-4 right-4 h-12 w-12 border-2 border-dashed border-primary/40 flex items-center justify-center text-primary" aria-hidden="true"><Plane className="h-6 w-6 -rotate-12" /></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-dark mb-8">A note from your travel crew</p>
                        <p className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-slate-800">Big dreams?<br />We’re all ears.</p>
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">No scripts. No complicated steps. Just people who love planning a great escape.</p>
                        <div className="border-t border-dashed border-orange-300 pt-4 flex justify-between items-center gap-3"><span className="text-xs font-bold text-primary-dark">With love, from Chennai.</span><MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" /></div>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 md:mb-12">
                    {[
                        { icon: MessageCircle, title: 'Let’s chat', text: 'Talk travel on WhatsApp', href: `https://wa.me/${whatsappNumber}`, external: true },
                        { icon: Phone, title: 'Give us a call', text: '+91 98418 44977', href: 'tel:+919841844977' },
                        { icon: Mail, title: 'Drop a note', text: 'Open your email app', href: 'mailto:travelepisodeschennai@gmail.com' },
                    ].map(channel => (
                        <a key={channel.title} href={channel.href} target={channel.external ? '_blank' : undefined} rel={channel.external ? 'noopener noreferrer' : undefined} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-orange-300 hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-primary">
                            <channel.icon className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
                            <div className="min-w-0 flex-1"><p className="font-bold text-slate-900">{channel.title}</p><p className="text-xs text-slate-500 mt-1">{channel.text}</p></div>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-primary" aria-hidden="true" />
                        </a>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-surface p-5 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Based in Chennai. Going everywhere.</p>
                            <h2 className="text-2xl font-bold mb-6">Meet your travel crew</h2>
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
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                                        <p className="text-slate-600 break-all text-sm"><a href="mailto:travelepisodeschennai@gmail.com" className="hover:text-primary transition-colors">travelepisodeschennai@gmail.com</a></p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-linear-to-br from-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white">
                            <h3 className="text-xl font-bold mb-4 text-white">Need Immediate Assistance?</h3>
                            <p className="text-slate-300 mb-6">Our travel experts are just a WhatsApp message away.</p>
                            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
                                Chat with a travel expert
                            </a>
                        </div>
                    </div>

                    {/* Quick Form (Visual only, leads to enquiry mainly) */}
                    <div className="bg-surface p-5 md:p-8 rounded-3xl shadow-sm border border-slate-200 border-t-4 border-t-primary">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">A little note goes a long way</p>
                        <h2 className="text-2xl font-bold mb-3">What’s on your mind?</h2>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">Write your message below. This opens your email app with the details ready to send.</p>
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
                                <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                                <input id="contact-name" name="name" autoComplete="name" type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Your Name" required />
                            </div>
                            <div>
                                <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                <input id="contact-email" name="email" autoComplete="email" type="email" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="your@email.com" required />
                            </div>
                            <div>
                                <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                <textarea id="contact-message" name="message" rows="5" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="How can we help you?" required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">
                                Continue in email app <ArrowUpRight className="h-4 w-4 ml-2" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-12 md:mt-16">
                    <div className="flex items-center gap-3 mb-5"><MapPin className="h-6 w-6 text-primary" /><div><h2 className="text-2xl font-bold">Drop by. Dream big.</h2><p className="text-sm text-slate-500">Your next trip starts in Poonamallee, Chennai.</p></div></div>
                    <div className="bg-surface rounded-3xl overflow-hidden shadow-xl border border-slate-100 p-2">
                        <div className="relative h-72 md:h-[400px] w-full rounded-2xl overflow-hidden group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8431791678345!2d80.0917911!3d13.0456522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a528b9a1b2cf29b%3A0x97f1cec8db27adb4!2sTravel%20Episodes!5e0!3m2!1sen!2sin!4v1769772460834!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Travel Episodes Location"
                                className="w-full h-full"
                            ></iframe>

                            <div className="absolute bottom-4 inset-x-4 md:left-auto md:right-6">
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
