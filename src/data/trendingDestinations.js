import { destinations } from './destinations.js';

export const trendingDestinations = ['alleppey', 'maldives', 'dubai', 'thailand', 'vietnam', 'manali']
    .map(id => destinations.find(destination => destination.id === id))
    .filter(Boolean);