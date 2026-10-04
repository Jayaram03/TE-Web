import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react';

export default function DestinationRegionPicker({ label, options, value, onChange }) {
    const id = useId();
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const searchRef = useRef(null);
    const listRef = useRef(null);
    const popupRef = useRef(null);
    const openingFocus = useRef('selected');
    const typeahead = useRef({ text: '', time: 0 });
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const searchable = options.filter(option => option.value !== 'All').length >= 9;
    const selected = options.find(option => option.value === value) || options[0];
    const visibleOptions = options.filter(option => option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

    useEffect(() => {
        if (!open) return;
        const positionPopup = () => {
            const popup = popupRef.current;
            const trigger = triggerRef.current;
            if (!popup || !trigger) return;
            const rect = trigger.getBoundingClientRect();
            const viewport = window.visualViewport;
            const viewportTop = viewport?.offsetTop || 0;
            const viewportBottom = viewportTop + (viewport?.height || window.innerHeight);
            const below = Math.max(0, viewportBottom - rect.bottom - 20);
            const above = Math.max(0, rect.top - Math.max(viewportTop, 88) - 20);
            const flip = below < 220 && above > below;
            popup.dataset.side = flip ? 'above' : 'below';
            popup.style.setProperty('--picker-available-height', `${flip ? above : below}px`);
        };
        positionPopup();
        const items = listRef.current?.querySelectorAll('[role="option"]');
        const selectedItem = listRef.current?.querySelector('[aria-selected="true"]');
        const target = openingFocus.current === 'search' && searchRef.current
            ? searchRef.current
            : openingFocus.current === 'last' ? items?.[items.length - 1] : selectedItem || items?.[0];
        target?.focus({ preventScroll: true });
        target?.scrollIntoView({ block: 'nearest' });
        const dismiss = event => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', dismiss);
        window.addEventListener('resize', positionPopup);
        window.addEventListener('scroll', positionPopup, { passive: true });
        window.visualViewport?.addEventListener('resize', positionPopup);
        window.visualViewport?.addEventListener('scroll', positionPopup);
        return () => {
            document.removeEventListener('pointerdown', dismiss);
            window.removeEventListener('resize', positionPopup);
            window.removeEventListener('scroll', positionPopup);
            window.visualViewport?.removeEventListener('resize', positionPopup);
            window.visualViewport?.removeEventListener('scroll', positionPopup);
        };
    }, [open]);

    function close(restoreFocus = false) {
        if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
        setOpen(false);
    }

    function show(focus = 'selected') {
        openingFocus.current = focus;
        typeahead.current = { text: '', time: 0 };
        setQuery('');
        setOpen(true);
    }

    function select(option) {
        close(true);
        onChange(option.value);
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            close(true);
            return;
        }
        if (event.key === 'Tab' && open) {
            const inSearch = event.target === searchRef.current;
            if (event.shiftKey && !inSearch && searchRef.current) {
                event.preventDefault();
                searchRef.current.focus({ preventScroll: true });
                return;
            }
            if (!event.shiftKey && inSearch) {
                const option = listRef.current?.querySelector('[aria-selected="true"]') || listRef.current?.querySelector('[role="option"]');
                if (option) {
                    event.preventDefault();
                    option.focus({ preventScroll: true });
                    option.scrollIntoView({ block: 'nearest' });
                    return;
                }
            }
            // Let the browser navigate from the trigger, not a removed popup node.
            close(true);
            return;
        }
        if (!open) return;
        const items = Array.from(listRef.current?.querySelectorAll('[role="option"]') || []);
        const index = items.indexOf(document.activeElement);
        const inSearch = event.target === searchRef.current;
        let next;
        if (event.key === 'ArrowDown') next = index < 0 ? 0 : (index + 1) % items.length;
        if (event.key === 'ArrowUp') next = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
        if (!inSearch && event.key === 'Home') next = 0;
        if (!inSearch && event.key === 'End') next = items.length - 1;
        if (next !== undefined) {
            event.preventDefault();
            items[next]?.focus({ preventScroll: true });
            items[next]?.scrollIntoView({ block: 'nearest' });
        } else if (inSearch && event.key === 'Enter') {
            event.preventDefault();
            if (visibleOptions[0]) select(visibleOptions[0]);
        } else if (!inSearch && event.key.length === 1 && event.key !== ' ' && !event.metaKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            const now = event.timeStamp;
            const previous = typeahead.current;
            const text = (now - previous.time < 700 ? previous.text : '') + event.key.toLocaleLowerCase();
            typeahead.current = { text, time: now };
            const prefix = [...text].every(character => character === text[0]) ? text[0] : text;
            const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
            const match = ordered.find(item => item.dataset.label.toLocaleLowerCase().startsWith(prefix));
            match?.focus({ preventScroll: true });
            match?.scrollIntoView({ block: 'nearest' });
        }
    }

    return (
        <div className="destination-region-picker" ref={rootRef} onKeyDown={handleKeyDown}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) close();
            }}>
            <button ref={triggerRef} type="button" className="destination-region-trigger" role="combobox"
                aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-listbox`}
                aria-labelledby={`${id}-label ${id}-value`}
                onClick={() => open ? close() : show()}
                onKeyDown={event => {
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (!open) {
                            event.stopPropagation();
                            show(event.key === 'ArrowUp' ? 'last' : 'selected');
                        }
                    }
                }}>
                <MapPin size={18} aria-hidden="true" />
                <span className="destination-region-copy">
                    <span id={`${id}-label`} className="destination-region-subtitle">{label}</span>
                    <span id={`${id}-value`} className="destination-region-value">{selected?.label}</span>
                </span>
                <ChevronDown size={16} aria-hidden="true" />
            </button>
            {open && <div ref={popupRef} className="destination-region-popover">
                <div className="destination-region-heading"><MapPin size={16} aria-hidden="true" /><span>Choose a {label.toLowerCase()}</span></div>
                {searchable && <div className="destination-region-search">
                    <Search size={16} aria-hidden="true" />
                    <input ref={searchRef} type="search" aria-label={`Search ${label === 'State' ? 'states' : 'regions'}`}
                        aria-controls={`${id}-listbox`} placeholder={`Search ${label === 'State' ? 'states' : 'regions'}…`}
                        value={query} onChange={event => setQuery(event.target.value)} />
                </div>}
                <div ref={listRef} id={`${id}-listbox`} role="listbox" aria-label={label} className="destination-region-options">
                    {visibleOptions.map(option => <button key={option.value} type="button" role="option"
                        aria-selected={value === option.value} tabIndex={-1} data-label={option.label}
                        className="destination-region-option" onClick={() => select(option)}>
                        <span className="destination-region-option-label">{option.label}</span>
                        <span className="destination-region-count" aria-label={`${option.count} ${option.count === 1 ? 'destination' : 'destinations'}`}>{option.count}</span>
                        <span className="destination-region-check">{value === option.value && <Check size={16} aria-hidden="true" />}</span>
                    </button>)}
                </div>
                {!visibleOptions.length && <p className="destination-region-empty" role="status">No matching {label === 'State' ? 'states' : 'regions'}.</p>}
            </div>}
        </div>
    );
}