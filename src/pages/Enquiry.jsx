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
import { DRAFT_KEY, transportOptions, stayOptions, readDraft, saveDraft, normalizeEnquiry, validateEnquiry, submitEnquiry, googleFormFallback } from '../data/enquirySubmission';
import './enquiryForm.css';

const FALLBACK_EMAIL = 'travelepisodeschennai@gmail.com';

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

const EnquiryForm = ({ destinationName = '' }) => {
    const formSectionRef = useRef(null);
    const sendingRef = useRef(false);
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

    const [restored] = useState(() => {
        try { return readDraft(window.localStorage); } catch { return null; }
    });
    const [form, setForm] = useState(() => restored?.form || ({ ...initialForm, destination: destinationName }));
    const [pending, setPending] = useState(restored?.pending || null);
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [storageWarning, setStorageWarning] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [manualTransport, setManualTransport] = useState(false);
    const minStart = tomorrowDate();
    const nights = tripNights(form.tripStart, form.tripEnd);
    const inspiration = destinations.find(destination => destination.name.toLowerCase() === form.destination.toLowerCase()) || trendingDestinations[0];
    const [status, setStatus] = useState(restored?.pending ? 'unconfirmed' : 'idle');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (status === 'success') return;
        try { saveDraft(window.localStorage, form, pending); } catch { /* Submission reports storage failures explicitly. */ }
    }, [form, pending, status]);

    const update = (key, value) => {
        if (sendingRef.current || pending) return;
        if (key === 'transport') setManualTransport(true);
        setForm(f => ({
            ...f, [key]: value,
            ...(key === 'people' && !manualTransport && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? { transport: suggestedTransport(value) } : {}),
            ...(key === 'tripStart' && f.tripEnd && f.tripEnd < value ? { tripEnd: '' } : {}),
        }));
        if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
    };

    const validate = () => {
        const next = validateEnquiry(form, tomorrowDate());
        setErrors(next);
        if (Object.keys(next).length) {
            const ids = { startingPoint: 'starting-point', tripStart: 'start-date', tripEnd: 'end-date' };
            document.getElementById(`enquiry-${ids[Object.keys(next)[0]] || Object.keys(next)[0]}`)?.focus();
        }
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sendingRef.current) return;
        // An old pending enquiry must remain retryable even after its travel date passes.
        if (!pending && !validate()) return;
        sendingRef.current = true;
        setStatus('loading');
        try {
            const attempt = pending || { id: crypto.randomUUID(), form: normalizeEnquiry(form) };
            // Persist the exact payload and ID BEFORE the network request, not after a timeout.
            try {
                saveDraft(window.localStorage, attempt.form, attempt);
                setStorageWarning('');
            } catch {
                setStorageWarning('This browser cannot save a recovery copy. Keep this page open and download your details before leaving.');
            }
            setPending(attempt);
            if (!navigator.onLine) throw new Error('You are offline. Your enquiry has not been confirmed; reconnect and retry.');
            const confirmed = await submitEnquiry(attempt);
            setReceipt(confirmed);
            setStatus('success');
            setPending(null);
            try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* Receipt still confirms delivery. */ }
        } catch (err) {
            if (err.fields || err.notAccepted) {
                if (err.fields) setErrors(err.fields);
                setPending(null); // Explicit pre-delivery rejection is safe to edit.
                setStatus('error');
            } else {
                setStatus('unconfirmed');
            }
            setDeliveryMessage(err.name === 'AbortError' ? 'Confirmation timed out. Retry to check the same enquiry; do not start a duplicate.' : err.message);
        } finally {
            sendingRef.current = false;
        }
    };

    const downloadEnquiry = () => {
        const data = { reference: pending?.id || receipt?.submissionId || 'Draft — not submitted', enquiry: pending?.form || form };
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'travel-episodes-enquiry.json';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
        try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* Best-effort local cleanup. */ }
        setForm({ ...initialForm, destination: destinationName });
        setPending(null);
        setReceipt(null);
        setDeliveryMessage('');
        setStorageWarning('');
        setManualTransport(false);
        setErrors({});
        setStatus('idle');
    };

    return (
        <div className="pt-28 md:pt-40 pb-16 md:pb-24 min-h-screen bg-[#faf8f4] overflow-x-clip">
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
                                        Thanks, {form.name.split(' ')[0] || 'traveller'}! Your Google Form response and linked Google Sheet entry are confirmed. Our team will get back to you shortly.
                                    </p>
                                    <p className="text-xs text-slate-500 mb-4 break-all">Reference: {receipt?.submissionId}. {receipt?.emailSent ? 'Team notification sent.' : 'Team email notification is queued for retry; your enquiry is already recorded.'}</p>
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
                                    {storageWarning && <p role="alert" className="text-sm text-red-600">{storageWarning}</p>}
                                    {pending && <p role="status" className="text-sm text-slate-600">Your pending details are locked to prevent duplicate enquiries. Retry below to confirm the same reference: <span className="break-all font-bold">{pending.id}</span>.</p>}
                                    <fieldset disabled={status === 'loading' || Boolean(pending)} className="space-y-6 min-w-0 disabled:opacity-70">
                                        <legend className="sr-only">Enquiry details</legend>
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
                                            {errors.transport && <ErrorText text={errors.transport} />}
                                            <p className="text-xs text-slate-500 mt-3">{manualTransport ? 'Your transport preference is selected.' : 'Suggested for your group: 1–7 car, 8–21 van, 22+ bus. You can choose another option.'}</p>
                                            {manualTransport && <button type="button" className="min-h-11 text-xs text-primary font-bold underline" onClick={() => { setManualTransport(false); setForm(f => ({ ...f, transport: suggestedTransport(f.people) })); }}>Use automatic suggestion</button>}
                                        </fieldset>

                                        <fieldset className="enquiry-preference-fieldset">
                                            <legend className={labelClasses}>Stay Preferences *</legend>
                                            <PreferenceGroup name="stay" options={stayOptions} icons={stayIcons} value={form.stay} onChange={(v) => update('stay', v)} />
                                            {errors.stay && <ErrorText text={errors.stay} />}
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
                                            {errors.referral && <ErrorText text={errors.referral} />}
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
                                            {errors.message && <ErrorText text={errors.message} />}
                                        </div>
                                    </fieldset>

                                    {(status === 'error' || status === 'unconfirmed') && (
                                        <div role="alert" className="flex flex-col gap-3 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                {deliveryMessage || 'This enquiry has not been confirmed. Retry below to check the same submission safely.'}
                                            </div>
                                            <button type="button" onClick={downloadEnquiry} className="self-start underline font-bold">Download a copy of my enquiry</button>
                                            <a href={googleFormFallback(form)} target="_blank" rel="noopener noreferrer" className="self-start underline font-bold">Open the original Google Form with my details</a>
                                            <p className="text-xs">If this enquiry may already have reached Google, retry here before using the original Form to avoid duplicates. Opening a Form or email draft does not submit it.</p>
                                            <button
                                                type="button"
                                                onClick={sendViaEmailInstead}
                                                className="self-start underline underline-offset-2 font-bold text-red-700 hover:text-red-800"
                                            >
                                                Open Email Draft
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
                                                {pending ? 'Retry / Check My Enquiry' : 'Send My Enquiry'} <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                    <p className="text-xs text-center text-slate-400">
                                        Your details are only used to plan your trip. A recovery draft is stored on this browser for up to 7 days and removed after confirmed delivery. Avoid entering details on a shared device.
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
