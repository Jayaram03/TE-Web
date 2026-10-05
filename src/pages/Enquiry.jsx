import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Navigation, Users, Calendar,
    Car, Bus, BedDouble, Tent, Gift, MessageSquare,
    Send, CheckCircle2, AlertCircle, Loader2, Plane, ShieldCheck
} from 'lucide-react';
import TravelPageHeader from '../components/TravelPageHeader';
import TrendingTripPicker from '../components/TrendingTripPicker';
import { useSearchParams } from 'react-router-dom';
import { destinations } from '../data/destinations';
import { trendingDestinations } from '../data/trendingDestinations';
import { suggestedTransport, tomorrowDate, tripNights } from '../data/tripPlanning';
import './enquiryForm.css';

// ============================================================================
// This form submits directly into the SAME Google Sheet that your original
// embedded Google Form ("Enquiries-26") was linked to. It works by posting
// to Google's own `formResponse` endpoint for that form (the same thing that
// happens when someone fills in and submits the actual Google Form) via a
// hidden iframe, so the page never navigates away and there's no visible
// Google UI. Accepted responses use the original form's linked Sheet.
// The browser cannot read Google's cross-origin confirmation, so a load event
// indicates the response page loaded, not independent verification of a row.
//
// The field IDs below (entry.xxxxxxx) were read directly from the public
// form at:
// https://docs.google.com/forms/d/e/1FAIpQLScgsRCJAg1ZbXQ1Uk4GbL5fWShnkAWq7gLtA9POBUUpYnX4Pg/viewform
// If you ever edit the Google Form and add/remove/rename fields, these IDs
// may change and will need to be re-extracted the same way.
// ============================================================================
const FORM_ID = '1FAIpQLScgsRCJAg1ZbXQ1Uk4GbL5fWShnkAWq7gLtA9POBUUpYnX4Pg';
const FORM_ACTION_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;
const IFRAME_NAME = 'hidden_enquiry_iframe';

const ENTRY = {
    name: 'entry.1089377378',
    email: 'entry.1495965433',
    mobile: 'entry.228924055',
    destination: 'entry.1017602788',
    startingPoint: 'entry.1539082874',
    people: 'entry.779309777',
    tripStart: 'entry.90809953', // date field -> _year/_month/_day
    tripEnd: 'entry.1369608764', // date field -> _year/_month/_day
    transport: 'entry.961666899', // radio
    stay: 'entry.1633115499', // radio
    referral: 'entry.353242617',
    message: 'entry.343713554',
};

const FALLBACK_EMAIL = 'travelepisodeschennai@gmail.com';

const transportOptions = ['Car', 'Traveller Van', 'Bus (For Bigger groups)'];
const stayOptions = ['3* Hotels', '4* Hotels or above', 'Resort / Cottages', 'Tent / Camping'];
const transportIcons = { 'Car': Car, 'Traveller Van': Bus, 'Bus (For Bigger groups)': Bus };
const stayIcons = { '3* Hotels': BedDouble, '4* Hotels or above': BedDouble, 'Resort / Cottages': Tent, 'Tent / Camping': Tent };
const preferenceCopy = {
    'Car': ['Car', 'Small-group comfort'],
    'Traveller Van': ['Traveller van', 'Room for your crew'],
    'Bus (For Bigger groups)': ['Bus', 'For bigger groups'],
    '3* Hotels': ['3-star hotels', 'Comfort & value'],
    '4* Hotels or above': ['4-star & above', 'A little more luxury'],
    'Resort / Cottages': ['Resort / cottages', 'A scenic escape'],
    'Tent / Camping': ['Tent / camping', 'Closer to nature'],
};

const initialForm = {
    name: '',
    email: '',
    mobile: '',
    destination: '',
    startingPoint: '',
    people: '2',
    tripStart: '',
    tripEnd: '',
    transport: 'Car',
    stay: '3* Hotels',
    referral: '',
    message: '',
};

const inputClasses = "enquiry-input w-full min-w-0 max-w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400";
const labelClasses = "block text-sm font-bold text-slate-700 mb-2";

const Field = ({ icon: Icon, children }) => (
    <div className="relative min-w-0 w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-5 h-5" />
        </div>
        {children}
    </div>
);

const PreferenceGroup = ({ name, options, icons, value, onChange }) => (
    <div className={`enquiry-preferences enquiry-preferences--${name}`}>
        {options.map((opt) => {
            const Icon = icons?.[opt];
            const [title, description] = preferenceCopy[opt];
            return (
                <label key={opt} className="enquiry-preference">
                    <input type="radio" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)} />
                    <span className="enquiry-preference-card">
                        <span className="enquiry-preference-icon">{Icon && <Icon aria-hidden="true" />}</span>
                        <span className="enquiry-preference-copy"><strong>{title}</strong><span>{description}</span></span>
                        <span className="enquiry-preference-check" aria-hidden="true"><CheckCircle2 /></span>
                    </span>
                </label>
            );
        })}
    </div>
);

const ErrorText = ({ text }) => (
    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" /> {text}
    </p>
);

/**
 * Submits form data to the Google Form's formResponse endpoint using a
 * dynamically created <form> that targets a hidden <iframe>. This mirrors
 * exactly what happens when a user submits the real Google Form, so the
 * accepted response uses the original linked Google Sheet without navigating
 * away. Cross-origin iframe responses cannot be inspected by this page.
 */
function submitToGoogleForm(payload) {
    return new Promise((resolve) => {
        if (!navigator.onLine) {
            resolve(false);
            return;
        }
        const form = document.createElement('form');
        form.action = FORM_ACTION_URL;
        form.method = 'POST';
        form.target = IFRAME_NAME;
        form.style.display = 'none';

        Object.entries(payload).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value ?? '';
            form.appendChild(input);
        });

        document.body.appendChild(form);

        const iframe = document.getElementsByName(IFRAME_NAME)[0];
        let safetyTimeout;
        const cleanup = () => {
            clearTimeout(safetyTimeout);
            iframe?.removeEventListener('load', onLoad);
            iframe?.removeEventListener('error', onError);
            if (form.parentNode) form.parentNode.removeChild(form);
        };
        const onLoad = () => {
            cleanup();
            resolve(true);
        };
        const onError = () => {
            cleanup();
            resolve(false);
        };

        if (!iframe) {
            cleanup();
            resolve(false);
            return;
        }
        iframe.addEventListener('load', onLoad);
        iframe.addEventListener('error', onError);
        // A missing response must never be presented as a successful enquiry.
        safetyTimeout = setTimeout(() => {
            cleanup();
            resolve(null);
        }, 20000);

        try {
            form.submit();
        } catch {
            clearTimeout(safetyTimeout);
            cleanup();
            resolve(false);
        }
    });
}

function splitDate(value) {
    if (!value) return { year: '', month: '', day: '' };
    const [year, month, day] = value.split('-');
    return { year, month, day };
}

const EnquiryForm = ({ destinationName = '' }) => {
    const formSectionRef = useRef(null);
    useEffect(() => {
        // Briefly show the page above the form, then guide visitors down to it.
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timer = window.setTimeout(() => {
            formSectionRef.current?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' });
        }, reducedMotion ? 0 : 400);
        // Do not override someone who starts navigating during the opening pause.
        const cancel = () => window.clearTimeout(timer);
        const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
        events.forEach(event => window.addEventListener(event, cancel, { passive: true, once: true }));
        return () => {
            cancel();
            events.forEach(event => window.removeEventListener(event, cancel));
        };
    }, []);

    const [form, setForm] = useState(() => ({ ...initialForm, destination: destinationName }));
    const [manualTransport, setManualTransport] = useState(false);
    const minStart = tomorrowDate();
    const nights = tripNights(form.tripStart, form.tripEnd);
    const inspiration = destinations.find(destination => destination.name.toLowerCase() === form.destination.toLowerCase()) || trendingDestinations[0];
    const [status, setStatus] = useState('idle'); // idle | loading | success | error | unconfirmed
    const [errors, setErrors] = useState({});

    const update = (key, value) => {
        if (key === 'transport') setManualTransport(true);
        setForm(f => ({
            ...f, [key]: value,
            ...(key === 'people' && !manualTransport && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? { transport: suggestedTransport(value) } : {}),
            ...(key === 'tripStart' && f.tripEnd && f.tripEnd < value ? { tripEnd: '' } : {}),
        }));
        if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = 'Please enter your name';
        if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email';
        if (!form.mobile.trim() || form.mobile.replace(/\D/g, '').length < 10) next.mobile = 'Enter a valid mobile number';
        if (!form.destination.trim()) next.destination = 'Tell us where you want to go';
        if (!form.startingPoint.trim()) next.startingPoint = 'Tell us your starting location';
        if (!form.people.trim() || !Number.isSafeInteger(Number(form.people)) || Number(form.people) < 1) next.people = 'Enter a whole number of travellers (at least 1)';
        if (!form.tripStart) next.tripStart = 'Select a start date';
        else if (form.tripStart < tomorrowDate()) next.tripStart = 'Choose a future date (tomorrow or later)';
        if (!form.tripEnd) next.tripEnd = 'Select an end date';
        if (form.tripStart && form.tripEnd && form.tripEnd < form.tripStart) {
            next.tripEnd = 'End date must be after start date';
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === 'loading') return;
        if (!validate()) return;

        setStatus('loading');

        const start = splitDate(form.tripStart);
        const end = splitDate(form.tripEnd);

        const payload = {
            [ENTRY.name]: form.name.trim(),
            [ENTRY.email]: form.email.trim(),
            [ENTRY.mobile]: form.mobile.trim(),
            [ENTRY.destination]: form.destination.trim(),
            [ENTRY.startingPoint]: form.startingPoint.trim(),
            [ENTRY.people]: form.people,
            [`${ENTRY.tripStart}_year`]: start.year,
            [`${ENTRY.tripStart}_month`]: start.month,
            [`${ENTRY.tripStart}_day`]: start.day,
            [`${ENTRY.tripEnd}_year`]: end.year,
            [`${ENTRY.tripEnd}_month`]: end.month,
            [`${ENTRY.tripEnd}_day`]: end.day,
            [ENTRY.transport]: form.transport,
            [ENTRY.stay]: form.stay,
            [ENTRY.referral]: form.referral,
            [ENTRY.message]: form.message,
        };

        try {
            const ok = await submitToGoogleForm(payload);
            if (ok === true) {
                setStatus('success');
            } else if (ok === null) {
                setStatus('unconfirmed');
            } else {
                throw new Error('submission-failed');
            }
        } catch (err) {
            console.error('Enquiry submission failed', err);
            setStatus('error');
        }
    };

    const sendViaEmailInstead = () => {
        const subject = `New Trip Enquiry from ${form.name || 'Website Visitor'}`;
        const body = [
            `Name: ${form.name}`,
            `Email: ${form.email}`,
            `Mobile: ${form.mobile}`,
            `Destination: ${form.destination}`,
            `Starting Point: ${form.startingPoint}`,
            `No of People: ${form.people}`,
            `Trip Start: ${form.tripStart || '-'}`,
            `Trip End: ${form.tripEnd || '-'}`,
            `Transportation: ${form.transport}`,
            `Stay Preference: ${form.stay}`,
            `Referral: ${form.referral || '-'}`,
            `Message: ${form.message || '-'}`,
        ].join('\n');
        window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const resetForm = () => {
        setForm({ ...initialForm, destination: destinationName });
        setManualTransport(false);
        setErrors({});
        setStatus('idle');
    };

    return (
        <div className="pt-28 md:pt-40 pb-16 md:pb-24 min-h-screen bg-[#faf8f4] overflow-x-clip">
            {/* Hidden iframe target used to submit the form without a page reload/navigation */}
            <iframe name={IFRAME_NAME} title="Enquiry submission target" style={{ display: 'none' }} />

            <div className="container px-4">
                <TravelPageHeader title="Plan your" accent="next trip." description="Choose your destination, dates and preferences. We’ll send a personalised quote." destinationId={inspiration.id} />

                <section aria-labelledby="enquiry-trending-title" className="max-w-6xl mx-auto mb-8">
                    <div className="enquiry-inspiration-heading"><div><p className="editorial-eyebrow">Choose your starting idea</p><h2 id="enquiry-trending-title" className="text-xl md:text-2xl font-bold">Trending destinations</h2></div><p>Pick a place, then make it yours.</p></div>
                    <TrendingTripPicker selected={form.destination} onSelect={name => update('destination', name)} />
                </section>

                <div ref={formSectionRef} style={{ scrollMarginTop: 'calc(var(--site-header-height) + 16px)' }} className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8 max-w-6xl mx-auto items-start">
                    <aside className="order-2 lg:order-1 space-y-5">
                        {status !== 'success' && <div className="rounded-3xl border border-orange-200 bg-white p-6 relative">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Trip summary</p>
                            <p className="text-2xl font-black text-slate-900 break-words mb-4">{form.destination || 'Somewhere wonderful'}</p>
                            <div className="border-y border-dashed border-orange-200 py-4 grid grid-cols-2 gap-4"><div><p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">Departing from</p><p className="text-sm font-bold break-words">{form.startingPoint || 'Your hometown'}</p></div><div><p className="text-[9px] uppercase tracking-widest text-slate-400 mb-1">The crew</p><p className="text-sm font-bold">{form.people || '—'} travellers</p></div></div>
                            <p className="mt-4 text-xs text-slate-500 flex items-center gap-2"><Plane className="h-4 w-4 text-primary" />Enquiry only — no payment required.</p>
                        </div>}
                        <div className="flex items-start gap-3 rounded-2xl bg-orange-50 border border-orange-200 p-5"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><p className="text-xs leading-relaxed text-slate-600">Your details are only used to plan your trip.</p></div>
                    </aside>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="order-1 lg:order-2 w-full min-w-0 bg-surface rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                        {status !== 'success' && <div className="border-b border-slate-100 bg-linear-to-r from-orange-50 to-white px-5 py-6 sm:px-8 md:px-10"><p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Your trip blueprint</p><h2 className="text-2xl font-bold mb-2">Let’s make a plan.</h2><p className="text-sm text-slate-500">Fields marked * are required. Our team will reach out within 24 hours.</p></div>}
                        <AnimatePresence mode="wait">
                            {status === 'success' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-10 md:p-16 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">Enquiry Sent!</h2>
                                    <p className="text-slate-600 max-w-md mx-auto mb-8">
                                        Thanks, {form.name.split(' ')[0] || 'traveller'}! Your enquiry has been submitted through our form. Our team will get back to you shortly.
                                    </p>
                                    <button onClick={resetForm} className="btn btn-primary px-8 py-3 rounded-xl">
                                        Submit Another Enquiry
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="enquiry-form p-5 sm:p-8 md:p-10 space-y-6"
                                    noValidate
                                >
                                    <h3 className="flex items-center gap-3 text-base font-bold"><span className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs text-primary">01</span> The travelling crew</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="enquiry-name" className={labelClasses}>Your Name *</label>
                                            <Field icon={User}>
                                                <input
                                                    id="enquiry-name"
                                                    autoComplete="name"
                                                    required
                                                    className={inputClasses}
                                                    placeholder="Your Name"
                                                    value={form.name}
                                                    onChange={(e) => update('name', e.target.value)}
                                                />
                                            </Field>
                                            {errors.name && <ErrorText text={errors.name} />}
                                        </div>
                                        <div>
                                            <label htmlFor="enquiry-email" className={labelClasses}>Email ID *</label>
                                            <Field icon={Mail}>
                                                <input
                                                    id="enquiry-email"
                                                    autoComplete="email"
                                                    required
                                                    type="email"
                                                    className={inputClasses}
                                                    placeholder="your@email.com"
                                                    value={form.email}
                                                    onChange={(e) => update('email', e.target.value)}
                                                />
                                            </Field>
                                            {errors.email && <ErrorText text={errors.email} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="enquiry-mobile" className={labelClasses}>Mobile No *</label>
                                            <Field icon={Phone}>
                                                <input
                                                    id="enquiry-mobile"
                                                    autoComplete="tel"
                                                    required
                                                    type="tel"
                                                    className={inputClasses}
                                                    placeholder="+91 98765 43210"
                                                    value={form.mobile}
                                                    onChange={(e) => update('mobile', e.target.value)}
                                                />
                                            </Field>
                                            {errors.mobile && <ErrorText text={errors.mobile} />}
                                        </div>
                                        <div>
                                            <label htmlFor="enquiry-people" className={labelClasses}>No of People *</label>
                                            <Field icon={Users}>
                                                <input
                                                    id="enquiry-people"
                                                    required
                                                    type="number"
                                                    min="1"
                                                    className={inputClasses}
                                                    placeholder="e.g. 4"
                                                    value={form.people}
                                                    onChange={(e) => update('people', e.target.value)}
                                                />
                                            </Field>
                                            {errors.people && <ErrorText text={errors.people} />}
                                        </div>
                                    </div>

                                    <h3 className="flex items-center gap-3 border-t border-slate-100 pt-6 text-base font-bold"><span className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs text-primary">02</span> Where and when</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="enquiry-destination" className={labelClasses}>Destination on Mind *</label>
                                            <Field icon={MapPin}>
                                                <input
                                                    id="enquiry-destination"
                                                    required
                                                    className={inputClasses}
                                                    placeholder="e.g. Maldives, Manali, Thailand..."
                                                    value={form.destination}
                                                    onChange={(e) => update('destination', e.target.value)}
                                                />
                                            </Field>
                                            {errors.destination && <ErrorText text={errors.destination} />}
                                        </div>
                                        <div>
                                            <label htmlFor="enquiry-starting-point" className={labelClasses}>Starting Point Location *</label>
                                            <Field icon={Navigation}>
                                                <input
                                                    id="enquiry-starting-point"
                                                    required
                                                    className={inputClasses}
                                                    placeholder="e.g. Chennai"
                                                    value={form.startingPoint}
                                                    onChange={(e) => update('startingPoint', e.target.value)}
                                                />
                                            </Field>
                                            {errors.startingPoint && <ErrorText text={errors.startingPoint} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="enquiry-start-date" className={labelClasses}>Trip Start Date *</label>
                                            <Field icon={Calendar}>
                                                <input
                                                    id="enquiry-start-date"
                                                    required
                                                    type="date"
                                                    min={minStart}
                                                    className={inputClasses}
                                                    value={form.tripStart}
                                                    onChange={(e) => update('tripStart', e.target.value)}
                                                />
                                            </Field>
                                            {errors.tripStart && <ErrorText text={errors.tripStart} />}
                                        </div>
                                        <div>
                                            <label htmlFor="enquiry-end-date" className={labelClasses}>Trip End Date *</label>
                                            <Field icon={Calendar}>
                                                <input
                                                    id="enquiry-end-date"
                                                    required
                                                    type="date"
                                                    min={form.tripStart && form.tripStart >= minStart ? form.tripStart : minStart}
                                                    className={inputClasses}
                                                    value={form.tripEnd}
                                                    onChange={(e) => update('tripEnd', e.target.value)}
                                                />
                                            </Field>
                                            {errors.tripEnd && <ErrorText text={errors.tripEnd} />}
                                        </div>
                                    </div>

                                    <p role="status" data-trip-duration className="text-sm font-bold text-primary">{nights !== null ? `${nights} ${nights === 1 ? 'night' : 'nights'} / ${nights + 1} ${nights === 0 ? 'day' : 'days'}` : 'Select both dates to see your trip duration.'}</p>
                                    <h3 className="flex items-center gap-3 border-t border-slate-100 pt-6 text-base font-bold"><span className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs text-primary">03</span> Travel preferences</h3>
                                    <fieldset className="enquiry-preference-fieldset">
                                        <legend className={labelClasses}>Transportation Preferences *</legend>
                                        <PreferenceGroup name="transport" options={transportOptions} icons={transportIcons} value={form.transport} onChange={(v) => update('transport', v)} />
                                        <p className="text-xs text-slate-500 mt-3">{manualTransport ? 'Your transport preference is selected.' : 'Suggested for your group: 1–7 car, 8–21 van, 22+ bus. You can choose another option.'}</p>
                                        {manualTransport && <button type="button" className="min-h-11 text-xs text-primary font-bold underline" onClick={() => { setManualTransport(false); setForm(f => ({ ...f, transport: suggestedTransport(f.people) })); }}>Use automatic suggestion</button>}
                                    </fieldset>

                                    <fieldset className="enquiry-preference-fieldset">
                                        <legend className={labelClasses}>Stay Preferences *</legend>
                                        <PreferenceGroup name="stay" options={stayOptions} icons={stayIcons} value={form.stay} onChange={(v) => update('stay', v)} />
                                    </fieldset>

                                    <div>
                                        <label htmlFor="enquiry-referral" className={labelClasses}>Referral code / Referred by (if any)</label>
                                        <Field icon={Gift}>
                                            <input
                                                id="enquiry-referral"
                                                className={inputClasses}
                                                placeholder="Optional"
                                                value={form.referral}
                                                onChange={(e) => update('referral', e.target.value)}
                                            />
                                        </Field>
                                    </div>

                                    <div>
                                        <label htmlFor="enquiry-message" className={labelClasses}>Anything else you'd like to add?</label>
                                        <div className="relative">
                                            <div className="absolute top-3.5 left-4 pointer-events-none text-slate-400">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <textarea
                                                id="enquiry-message"
                                                rows={4}
                                                className={`${inputClasses} pt-3.5 resize-none`}
                                                placeholder="Special requests, group details, honeymoon, etc."
                                                value={form.message}
                                                onChange={(e) => update('message', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {(status === 'error' || status === 'unconfirmed') && (
                                        <div role="alert" className="flex flex-col gap-3 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                {status === 'unconfirmed' ? 'We couldn’t confirm the response. Your enquiry may have been sent; please contact us by email before submitting again.' : 'Something went wrong sending your enquiry. Check your connection or contact us by email.'}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={sendViaEmailInstead}
                                                className="self-start underline underline-offset-2 font-bold text-red-700 hover:text-red-800"
                                            >
                                                Send via Email instead
                                            </button>
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="btn btn-primary w-full py-4 text-base md:text-lg rounded-xl shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send My Enquiry <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                    <p className="text-xs text-center text-slate-400">
                                        We respect your privacy. Your details are only used to plan your trip.
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const Enquiry = () => {
    const [params] = useSearchParams();
    const requested = params.get('destination') || '';
    const destinationName = destinations.find(destination => destination.id === requested)?.name || requested;
    return <EnquiryForm key={requested} destinationName={destinationName} />;
};

export default Enquiry;
