# Previous-trip photos

Add real, approved trip photos here (nested folders are supported). The gallery
uses `src/assets/trips/` rather than `public/images/trips/`: Vite's eager URL
glob handles asset imports reliably and supplies encoded, production-safe URLs.
No public-file imports, external image services, or placeholder trips are used.

- Supported extensions: jpg, jpeg, png, webp, avif (lowercase or uppercase).
- Hidden files/folders and this README are ignored.
- Filenames become alt text and captions: `kerala-backwaters-2.jpg` becomes
  “Kerala backwaters 2”. Use descriptive names with letters, numbers, spaces,
  hyphens or underscores; avoid `#` and `?` (reserved in Vite module imports).
  Don't include private information.
- Photos sort naturally by relative path (`trip-2` before `trip-10`).
- The first **30** sorted photos are displayed, keeping thumbnail DOM nodes at
  **60 maximum**, including the marquee's one visual copy. Keep each image
  reasonably sized (e.g. 1600–2400 px on its long edge); Vite doesn't resize or
  compress photos. The lightbox uses the same original, full-quality image.
- Only publish photos you own or have permission to display, including consent
  from identifiable travellers. Remove location metadata before publishing.

Restart the dev server if adding new files isn't detected; rebuild/redeploy to
publish changes. Empty folders produce no section, heading, or placeholder.
Failed photos are removed for the current page visit; if all fail, the section
disappears. One photo or a set that fits the track stays static. Larger sets use
native scrolling with autoplay, pausing during track interaction or the lightbox.
Reduced-motion users get a single, manually scrollable track without autoplay.

This folder intentionally ships without photos. Keep `.gitkeep` in place.