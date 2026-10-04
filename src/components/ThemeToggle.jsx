import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

const storageKey = 'te-theme';
const localTheme = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
};
const getTheme = () => document.documentElement.dataset.theme || localTheme();

const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light';
    window.dispatchEvent(new Event('te-theme-change'));
};

const subscribe = onChange => {
    const onStorage = event => {
        if (event.key !== storageKey && event.key !== null) return;
        applyTheme(event.newValue === 'day' || event.newValue === 'night' ? event.newValue : localTheme());
    };
    window.addEventListener('te-theme-change', onChange);
    window.addEventListener('storage', onStorage);
    return () => {
        window.removeEventListener('te-theme-change', onChange);
        window.removeEventListener('storage', onStorage);
    };
};

const ThemeToggle = ({ showLabel = false }) => {
    const theme = useSyncExternalStore(subscribe, getTheme, () => 'day');
    const night = theme === 'night';
    const label = `Switch to ${night ? 'day' : 'night'} theme`;
    const toggle = () => {
        const next = getTheme() === 'night' ? 'day' : 'night';
        try {
            localStorage.setItem(storageKey, next);
        } catch { /* The toggle still works for this visit when storage is blocked. */ }
        applyTheme(next);
    };

    return (
        <button type="button" onClick={toggle} className="theme-toggle" aria-label={label} aria-pressed={night} title={label}>
            {night ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
            {showLabel && <span>{label}</span>}
        </button>
    );
};

export default ThemeToggle;