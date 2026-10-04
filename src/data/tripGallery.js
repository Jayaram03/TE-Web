// At most 30 originals / 60 thumbnail nodes with the marquee's one copy.
export const TRIP_GALLERY_LIMIT = 30;
const assetRoot = '/src/assets/trips/';
const imageExtension = /\.(?:jpe?g|png|webp|avif)$/i;
const naturalOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

export function tripPhotoCaption(path) {
    const filename = path.split('/').at(-1).replace(imageExtension, '');
    const words = filename.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Trip photo';
}

// Vite resolves and encodes the actual URLs, including nested folders/spaces.
// Keeping discovery in the component lets these helpers run in plain Node.
export function createTripPhotos(files, limit = TRIP_GALLERY_LIMIT) {
    return Object.keys(files)
        .filter(path => path.startsWith(assetRoot)
            && imageExtension.test(path)
            && !path.slice(assetRoot.length).split('/').some(segment => segment.startsWith('.'))
            && typeof files[path] === 'string' && files[path].length > 0)
        .sort((a, b) => naturalOrder.compare(a, b) || a.localeCompare(b))
        .slice(0, limit)
        .map(path => ({ id: path, src: files[path], caption: tripPhotoCaption(path), alt: tripPhotoCaption(path) }));
}

export function groupTripPhotos(photos) {
    return Array.from({ length: Math.ceil(photos.length / 3) }, (_, index) => photos.slice(index * 3, index * 3 + 3));
}

export function adjacentTripPhoto(photos, id, direction) {
    if (!photos.length) return null;
    const index = photos.findIndex(photo => photo.id === id);
    return photos[((index < 0 ? 0 : index) + direction + photos.length) % photos.length].id;
}