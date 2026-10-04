export const suggestedTransport = people => Number(people) <= 7 ? 'Car' : Number(people) <= 21 ? 'Traveller Van' : 'Bus (For Bigger groups)';

export const tomorrowDate = (now = new Date()) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const tripNights = (start, end) => {
    if (!start || !end || end < start) return null;
    const calendarTime = value => { const [year, month, day] = value.split('-').map(Number); return Date.UTC(year, month - 1, day); };
    return Math.round((calendarTime(end) - calendarTime(start)) / 86400000);
};