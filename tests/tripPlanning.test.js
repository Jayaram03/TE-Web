import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestedTransport, tomorrowDate, tripNights } from '../src/data/tripPlanning.js';
import { destinations } from '../src/data/destinations.js';

test('transport boundaries preserve original Google Form option strings', () => {
    for (const [people, expected] of [[1, 'Car'], [7, 'Car'], [8, 'Traveller Van'], [21, 'Traveller Van'], [22, 'Bus (For Bigger groups)']]) {
        assert.equal(suggestedTransport(String(people)), expected);
    }
});

test('local tomorrow rolls across month, leap day and year boundaries', () => {
    assert.equal(tomorrowDate(new Date(2026, 11, 31, 23, 59)), '2027-01-01');
    assert.equal(tomorrowDate(new Date(2028, 1, 28)), '2028-02-29');
    assert.equal(tomorrowDate(new Date(2028, 1, 29)), '2028-03-01');
});

test('nights use calendar arithmetic through daylight-saving and year changes', () => {
    assert.equal(tripNights('2026-03-06', '2026-03-11'), 5);
    assert.equal(tripNights('2026-10-30', '2026-11-04'), 5);
    assert.equal(tripNights('2026-12-29', '2027-01-03'), 5);
    assert.equal(tripNights('2026-10-05', '2026-10-05'), 0);
    assert.equal(tripNights('', '2026-10-05'), null);
    assert.equal(tripNights('2026-10-06', '2026-10-05'), null);
});

test('all catalogue rates require a verified personalised quote', () => {
    assert.equal(destinations.length, 36);
    assert(destinations.every(destination => destination.price === 'Request a quote'));
});