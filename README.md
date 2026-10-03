# Travel Episodes

Public travel website built with React, Vite, Tailwind CSS, and Framer Motion.
Includes destination browsing, trip details, contact information, and a custom enquiry form.
There is no chatbot, admin dashboard, or server API in this version.

## Development

- Install dependencies: `npm install`.
- Start development: `npm run dev`.
- Validate source: `npm run lint`.
- Build production output: `npm run build`.
- Preview production output: `npm run preview`.

## Deployment and assets

Use the Vite preset on Vercel, build command `npm run build`, and output directory `dist`.
[vercel.json](vercel.json) provides SPA route rewrites.

Original images remain in [public/images/destinations/](public/images/destinations/).
Vite copies public assets into the output directory on every build. Commit source and public
assets, not generated `dist`, installed `node_modules`, local environment files, or macOS
`.DS_Store` metadata. Ignoring build output does not remove original images.

## Monthly destination edit

[src/data/monthlyFeatures.js](src/data/monthlyFeatures.js) selects five Home hero destinations,
“A new perspective” image, and the domestic/international editor’s picks from the existing
catalogue. Picks rotate by calendar month in UTC and stay consistent on refresh throughout
that month. No backend, scheduler, or deployment is needed for the next month's edit;
revisit or refresh the website to see it. Every destination gets a turn, and featured links,
photos, names, and captions use the same selected destination.

The hero has a five-stop zigzag sticky flight scene: a plane banks along a curved centre route
while tilted destination cards slide into place with light sweeps, ending with a boarding-pass
enquiry link. A whole-hero sky uses shaded SVG clouds at two parallax depths, a seeded
shimmering starfield, and a subtle plane contrail. Its sticky sky layer stays viewport-sized
rather than allocating one large composited texture for the entire scroll track. Ambient
cloud and star animations pause offscreen.
Motion uses transforms and opacity with one spring-smoothed scroll value, not scroll state
updates, blur filters, or independent JavaScript animation timers. Mobile copy scrolls normally.
Reduced-motion mode retains all five photos and static atmosphere without an extra scroll
track; very short screens keep the animation unpinned.

## Enquiry submission

[src/pages/Enquiry.jsx](src/pages/Enquiry.jsx) posts the original Google Form field IDs to its
`formResponse` endpoint using a hidden iframe. Accepted responses use that Google Form's
linked Sheet. No Apps Script environment variable is required.

Cross-origin iframe restrictions prevent the website from independently inspecting Google's
confirmation or verifying a Sheet row. Offline failures show an email fallback; response
timeouts are shown as unconfirmed, not successful. Avoid retrying an unconfirmed submission
without checking first, since it may already be recorded.

If Google Form questions change, verify the `ENTRY` mapping against the public form's
`FB_PUBLIC_LOAD_DATA_` data. Keep staff manual entries in a separate Sheet tab or submit them
through the original Form to avoid interfering with raw response data.

