# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Enquiry Form Setup (Google Sheet integration)

The `/enquiry` page is a custom-built, fully designed form (no more embedded Google Form
iframe) with all the same fields as the original Google Form. It submits directly to the
**same linked Google Sheet** your original embedded form used — by POSTing to that form's
`formResponse` endpoint via a hidden iframe (the same mechanism the real Google Form uses
under the hood), so every submission lands as a new row in your existing "Enquiries" sheet
automatically. No extra setup is required; the field IDs are already wired up in
[`src/pages/Enquiry.jsx`](src/pages/Enquiry.jsx).

If you ever edit the questions on the original Google Form (add/remove/rename fields), the
`entry.xxxxxxx` field IDs may change. To re-extract them:

1. Open the form's public `viewform` URL and view page source (or `curl` it).
2. Search for `FB_PUBLIC_LOAD_DATA_` in the HTML — it contains a JSON array listing every
   field's label and its `entry.<id>` identifier.
3. Update the `ENTRY` map at the top of `src/pages/Enquiry.jsx` with the new IDs.

If the submission ever fails client-side (e.g. offline), the form shows a "Send via Email
instead" fallback that opens a pre-filled email to `travelepisodeschennai@gmail.com` so no
enquiry is lost.

### Alternative: dedicated Apps Script Sheet

A standalone option is also included in [`google-apps-script/Code.gs`](google-apps-script/Code.gs)
if you'd prefer leads to go into a brand-new Sheet you control directly (instead of the
original linked one). Deploy it as a Web App and set `VITE_ENQUIRY_SCRIPT_URL` in a `.env`
file (see `.env.example`) — this is not required for the default setup above.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

