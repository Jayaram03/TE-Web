# Travel Episodes

Public travel website built with React, Vite, Tailwind CSS, and Framer Motion.
Includes destination browsing, trip details, contact information, and a custom enquiry form.
There is no chatbot or admin dashboard. Enquiry delivery uses a Vercel server API
and an owner-deployed Google Apps Script receiver.

## Development

- Install dependencies: `npm install`.
- Start development: `npm run dev`.
- Validate source: `npm run lint`.
- Test trip calculations and pricing policy: `npm test`.
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

[src/data/monthlyFeatures.js](src/data/monthlyFeatures.js) selects five Home hero destinations
and the domestic/international editor’s picks from the existing
catalogue. Picks rotate by calendar month in UTC and stay consistent on refresh throughout
that month. No backend, scheduler, or deployment is needed for the next month's edit;
revisit or refresh the website to see it. Every destination gets a turn, and featured links,
photos, names, and captions use the same selected destination.

The hero has a five-stop zigzag sticky flight scene: a plane banks along a curved centre route
while tilted destination cards slide into place with light sweeps, ending with a boarding-pass
enquiry link. In daylight a luminous white-hot sun disc with an atmospheric corona and
bright clouds follows the flight with scroll parallax; there are no rotating rays or
offscreen ray animations. At night shaded SVG clouds and a seeded shimmering starfield fill the sky.
Both themes retain the subtle plane contrail. Its sticky sky layer stays viewport-sized
rather than allocating one large composited texture for the entire scroll track. Ambient
cloud and star animations pause offscreen.
Motion uses transforms and opacity with one spring-smoothed scroll value, not scroll state
updates, blur filters, or independent JavaScript animation timers. Mobile copy scrolls normally.
Reduced-motion mode retains all five photos and static atmosphere without an extra scroll
track; very short screens keep the animation unpinned.

## Enquiry submission

Home contains four sections: hero, a six-photo editorial destination mosaic, traveller
reviews with an aligned rating header, and a boarding-pass enquiry CTA.
An optional previous-trip gallery appears between destinations and reviews only when
photos are available; see the gallery instructions below.
Reviews open in a keyboard-accessible dialog. The review marquee runs automatically without
controls, temporarily pauses during pointer/touch interaction, keyboard focus, and while a
review modal is open, then resumes when the interaction ends. Reduced-motion mode keeps it static.
Page scrolling outside the marquee does not pause it; only interaction within its track
does. Offscreen/hidden-tab and navigation-dialog safeguards remain in place.
Day/night mode defaults from the local clock (06:00–17:59 day); the navbar toggle persists
manual choices across routes and reloads. On mobile the switch and menu share one action group.
[public/favicon.png](public/favicon.png) is a transparent 128px PNG made from the original
[public/favicon.jpg](public/favicon.jpg). Only border-connected near-white background was
removed; the original JPEG and coloured logo artwork are preserved.

Enquiry supports selectable photo-ticket trending choices and destination-prefilled links. Start dates must be
tomorrow or later; nights/days use calendar-date arithmetic, unaffected by daylight saving.
Transport defaults to Car for 1–7 travellers, Traveller Van for 8–21, and Bus for 22+.
A manual selection stays selected until automatic suggestions are re-enabled.

Collection filters and pagination persist in the URL. Detail links retain the collection
context. Discovery uses compact counted category tabs, a search field and a state/region
dropdown; active search and location filters can be removed individually or cleared together.
The custom state/region picker uses theme-matched options, count badges and selected checks;
longer lists are searchable. Keyboard navigation, typeahead, Escape and outside-click dismissal
are supported. Its panel flips and shrinks to available viewport space rather than using the
operating system's native option box.
Opening the picker focuses the selected option rather than highlighting the search.
Shift+Tab from an option reaches search; Tab from search returns to the options.
Section navigation indicates the current section, and all enquiry links carry
the destination. Catalogue prices require a personalised quote; see
[pricing research](docs/pricing-research.md) for third-party benchmarks and publication criteria.

[src/pages/Enquiry.jsx](src/pages/Enquiry.jsx) validates before sending and shows success
only after the server confirms both the original Google Form response and its linked
Sheet row. Exact pending details and a stable reference survive refresh for safe retries.
Google keeps a durable delivery ledger and retries failed Form/email work automatically.

**Owner setup is required before custom-form delivery works.** Follow
[verified enquiry delivery](docs/enquiry-delivery.md) to deploy
[google-apps-script/Enquiry.gs](google-apps-script/Enquiry.gs) and configure the server-only
`ENQUIRY_SCRIPT_URL` / `ENQUIRY_SCRIPT_TOKEN` Vercel variables. Without configuration,
no false success is shown; the visitor can use the original prefilled Google Form.
Vite alone does not run the server endpoint. See the setup guide for full-stack local
development, acceptance checks, privacy/retention and delivery limitations.

## Footer world horizon

The footer shows only a shallow curved top-of-world surface, not a full globe. Fourteen
original landmark doodles repeat along the arc at 52–74px tall with 16px spacing. Buildings,
surface line and subtle map markings share one seamless CSS rotation. SVG definitions are
reused with a 58-second repeating rotation (slightly faster than the previous 72 seconds).
Only the visible sector plus incoming repeats are rendered. Animation pauses
offscreen, in hidden tabs and behind the mobile menu; reduced-motion mode is static.
The surface has a bounded gradient and subtle contours. Daytime includes a glowing sun
and softly drifting clouds; night includes seeded stars and a shaded moon with crater details.
Mobile retains the atmosphere with 32 stars and no expensive blur or scroll parallax;
desktop uses 72 stars and gentle parallax. All ambient animation pauses offscreen.

## Previous-trip gallery

Add approved photos to [src/assets/trips/](src/assets/trips/); full upload guidance is in
[src/assets/trips/README.md](src/assets/trips/README.md). JPG, JPEG, PNG, WebP and AVIF
are discovered automatically, including nested folders. Descriptive filenames become
captions and alt text. Restart development if new files are not detected; rebuild/redeploy
to publish them. Vite does not compress photos, so optimise their dimensions/file size first.

The first 30 naturally sorted photos form a moving bento track with at most 60 thumbnail
nodes. Tapping a photo opens its original full-quality image with previous/next navigation,
keyboard controls, focus management and scroll locking. Track interaction and the lightbox
pause autoplay; ordinary page scrolling does not. Small sets that fit remain static, and
an empty/all-failed collection renders nothing. No placeholder trip photos are shipped.

## Writing Google reviews

The compact invitation at the bottom of the testimonial section has five rating-star links
that open the business-specific Google review form directly. Every star uses the same URL;
there is no review gating or preselected rating. The user chooses their actual rating, writes
their review, and publishes on Google. There is no local review composer, stored draft, or
direct posting API.

[src/data/googleBusiness.js](src/data/googleBusiness.js) references the same Poonamallee
business as the Contact page's existing Maps feature ID. Review links require Google sign-in.
There is no supported customer-review creation API: the Business Profile API can read reviews
and manage owner replies, but cannot publish a customer's review from this website.
See [Google's review guidance](https://support.google.com/business/answer/3474122) and
[Business Profile review API](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews).

