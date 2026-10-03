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

