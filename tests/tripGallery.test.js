import test from 'node:test';
import assert from 'node:assert/strict';
import { adjacentTripPhoto, createTripPhotos, groupTripPhotos, tripPhotoCaption, TRIP_GALLERY_LIMIT } from '../src/data/tripGallery.js';

const root = '/src/assets/trips/';

test('empty discovery produces no photos or bento groups', () => {
    assert.deepEqual(createTripPhotos({}), []);
    assert.deepEqual(groupTripPhotos([]), []);
    assert.equal(adjacentTripPhoto([], 'missing', 1), null);
});

test('discovery filters non-images, hidden paths and invalid URLs; sorts naturally', () => {
    const files = Object.fromEntries(['trip-10.JPG', 'trip-2.avif', 'nested/snow.PNG', '.private.jpg', '.hidden/photo.jpg', 'README.md', '.gitkeep', 'movie.mp4'].map(path => [root + path, '/resolved/' + path]));
    files[root + 'bad.webp'] = undefined;
    files[root + 'empty.jpeg'] = '';
    files['/public/images/trips/other.jpg'] = '/other.jpg';
    assert.deepEqual(createTripPhotos(files).map(photo => photo.id.slice(root.length)), ['nested/snow.PNG', 'trip-2.avif', 'trip-10.JPG']);
});

test('captions are readable and resolved URLs remain untouched', () => {
    assert.equal(tripPhotoCaption(root + 'nested/kerala_backwaters-2.JPEG'), 'Kerala backwaters 2');
    const url = '/assets/sun%20%23%20sea-hash.jpg';
    const [photo] = createTripPhotos({ [root + 'sun # sea.jpg']: url });
    assert.equal(photo.src, url);
    assert.equal(photo.alt, 'Sun # sea');
    assert.equal(photo.caption, photo.alt);
});

test('bounded groups retain each original once; last partial bento is allowed', () => {
    const files = Object.fromEntries(Array.from({ length: 100 }, (_, index) => [root + `photo-${index}.webp`, `/photo-${index}.webp`]));
    const photos = createTripPhotos(files);
    assert.equal(photos.length, TRIP_GALLERY_LIMIT);
    assert.equal(photos.length * 2, 60);
    assert.deepEqual(groupTripPhotos(photos).flat(), photos);
    assert.deepEqual(groupTripPhotos(photos.slice(0, 4)).map(group => group.length), [3, 1]);
});

test('lightbox navigation wraps and handles a single original', () => {
    const photos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    assert.equal(adjacentTripPhoto(photos, 'a', -1), 'c');
    assert.equal(adjacentTripPhoto(photos, 'c', 1), 'a');
    assert.equal(adjacentTripPhoto([photos[0]], 'a', 1), 'a');
    assert.equal(adjacentTripPhoto([photos[0]], 'a', -1), 'a');
});