import { useSyncExternalStore } from 'react';

const query = '(max-width: 767px)';
const subscribe = callback => {
    const media = window.matchMedia(query);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
};
const getSnapshot = () => window.matchMedia(query).matches;
const getServerSnapshot = () => false;

// One responsive policy for expensive effects, updated only at the breakpoint.
export default function useMobileMotion() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
