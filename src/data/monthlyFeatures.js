import { destinations } from './destinations.js';

// UTC keeps the same monthly edit across time zones. No random picks on refresh.
// Every destination gets a turn; the original catalogue order is untouched.
export const getMonthlyFeatures = (date = new Date()) => {
    const month = date.getUTCFullYear() * 12 + date.getUTCMonth();
    const pool = category => destinations
        .filter(destination => destination.category === category)
        .sort((a, b) => a.id.localeCompare(b.id, 'en'));
    const domestic = pool('Domestic');
    const international = pool('International');
    const pick = (items, offset) => items[(month + offset) % items.length] || destinations[0];

    return {
        hero: [pick(domestic, 0), pick(international, 0), pick(domestic, 1), pick(international, 3), pick(domestic, 3)],
        journey: pick(international, 1),
        editor: { Domestic: pick(domestic, 2), International: pick(international, 2) },
    };
};