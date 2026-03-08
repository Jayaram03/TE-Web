# TravelEpisodes.in — Travel Agency Automation System

A complete travel agency automation platform with AI chatbot, admin dashboard, and Google Sheets backend.

## 🏗️ Architecture

```
┌────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Website +    │────▶│  Vercel API      │────▶│ Google Sheets│
│   AI Chatbot   │     │  (Serverless)    │     │ (Apps Script)│
│   (React/Vite) │     ├──────────────────┤     └──────────────┘
│                │     │ /api/generate-   │            │
│   Admin        │     │   itinerary      │            │
│   Dashboard    │     │ /api/send-       │     ┌──────┴──────┐
│   (/admin)     │     │   whatsapp       │     │ Automated   │
│                │     │ /api/send-email  │     │ Follow-ups  │
└────────────────┘     │ /api/update-     │     │ (Daily)     │
                       │   sheet          │     └─────────────┘
                       └──────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              Gemini AI   WhatsApp   Brevo
              (Free)      Business   (Email)
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```
Edit `.env` with your API keys (see setup guides below).

For Vercel, add these variables in **Project Settings → Environment Variables** with `VITE_` prefix for client-side access:
- `GEMINI_API_KEY` — server-side only
- `VITE_GOOGLE_SHEET_WEBHOOK_URL` — needed client-side for chatbot form submission
- `WHATSAPP_PHONE_NUMBER_ID` — server-side only
- `WHATSAPP_TOKEN` — server-side only
- `BREVO_API_KEY` — server-side only
- `VITE_ADMIN_USERNAME` — optional (defaults to `admin`)
- `VITE_ADMIN_PASSWORD` — optional (defaults to `travel2024`)

### 3. Run Locally
```bash
npm run dev
```
- Website: http://localhost:5173
- Admin: http://localhost:5173/admin

### 4. Deploy to Vercel
```bash
vercel --prod
```

---

## 📋 Setup Guides

### 1. Deploy Google Apps Script

1. Go to [script.google.com](https://script.google.com) → **New Project**
2. Copy contents of `google-apps-script/Code.gs` into the editor
3. Run `setupSheet()` function once (it creates the headers)
4. **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the **Web App URL**
6. Add to Vercel env vars as `VITE_GOOGLE_SHEET_WEBHOOK_URL`

**Setting up Follow-up Triggers:**
1. In Apps Script: **Triggers** (clock icon in sidebar)
2. Add trigger → `checkFollowups` → Time-driven → Day timer → 9am–10am

### 2. Get Gemini API Key (Free)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → Create key
3. Add to Vercel env vars as `GEMINI_API_KEY`
4. Free tier: 1,000 requests/day

### 3. Get WhatsApp Business API Credentials

1. Create a [Meta Business Account](https://business.facebook.com)
2. Go to [Meta for Developers](https://developers.facebook.com) → Create App
3. Add **WhatsApp** product to your app
4. In WhatsApp → Getting Started:
   - Copy **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - Generate **Permanent Token** → `WHATSAPP_TOKEN`
5. Add a test phone number and verify it

> **Note**: The WhatsApp integration includes a **fallback to wa.me direct links** when API credentials aren't configured, so the "Send WhatsApp" button works immediately.

### 4. Get Brevo API Key (Email)

1. Sign up at [brevo.com](https://www.brevo.com)
2. Go to **SMTP & API** → **API Keys**
3. Create new key → copy value → `BREVO_API_KEY`
4. Verify your sender domain (`travelepisodes.in`)

### 5. Access Admin Dashboard

- Navigate to `/admin` on your website
- Default credentials: `admin` / `travel2024`
- Change via environment variables `VITE_ADMIN_USERNAME` and `VITE_ADMIN_PASSWORD`

---

## 🤖 System 1 — AI Chatbot (Aria)

A floating chat bubble on every page that collects trip details and generates AI itineraries.

**Flow:** Name → Destination → Dates → Duration → Travelers → Budget → Stay → Special → Meals → Transport → AI Itinerary → Confirm → Phone → Email → Submit to Sheets

**Features:**
- Quick-reply chips for guided conversation
- Gemini AI itinerary generation with day-wise plans
- Progress bar showing completion %
- Session persistence (survives page navigation)
- Mobile full-screen mode
- Graceful degradation if AI API fails

---

## 📊 System 2 — Admin Dashboard

A dark-themed admin panel at `/admin` for managing all enquiries.

**Features:**
- Login gate with configurable credentials
- Stats cards (Total, New, Itineraries Sent, Confirmed, Revenue)
- Filterable/searchable/sortable enquiries table
- Detail side panel with notes and status updates
- **Send Package modal** — paste Canva link, preview WhatsApp/Email, send
- Bulk actions (mark contacted, CSV export)
- Auto-refresh every 60 seconds
- Follow-up badges on overdue enquiries
- Mobile responsive

---

## ⚙️ System 3 — Google Apps Script Backend

`Code.gs` handles all data operations via Google Sheets.

| Route | Method | Description |
|-------|--------|-------------|
| `/exec` | POST | Submit new enquiry |
| `/exec?action=getAll` | GET | Fetch all enquiries |
| `/exec?action=updateStatus` | POST | Update status + notes |
| `/exec?action=updateCanvaLink` | POST | Save canva link, mark sent |

---

## 🔄 System 4 — Automated Follow-ups

Time-based WhatsApp reminders (via Apps Script daily trigger):

| Timing | Condition | Message |
|--------|-----------|---------|
| Day 0 | New enquiry | "We received your enquiry, preparing itinerary!" |
| Day 3 | Still "Itinerary Sent" | "Hope you liked the itinerary, any questions?" |
| Day 7 | No response | "Dates filling up, want us to hold a spot?" |

---

## 📁 Files Overview

```
├── api/                         # Vercel serverless functions
│   ├── generate-itinerary.js    # Gemini AI proxy
│   ├── send-whatsapp.js         # WhatsApp API proxy
│   ├── send-email.js            # Brevo email proxy
│   └── update-sheet.js          # Google Sheets proxy
├── google-apps-script/
│   └── Code.gs                  # Google Apps Script backend
├── src/
│   ├── components/
│   │   ├── ChatbotWidget.jsx    # AI chatbot widget
│   │   └── chatbot.css          # Chatbot scoped styles
│   ├── pages/
│   │   ├── AdminDashboard.jsx   # Admin dashboard
│   │   └── admin.css            # Admin scoped styles
│   └── App.jsx                  # Routes + chatbot integration
├── .env.example                 # Environment variables template
├── vercel.json                  # Vercel routing config
└── README.md                    # This file
```

## 🎨 Brand Identity

| Token | Value | Usage |
|-------|-------|-------|
| Terra Cotta | `#c8714a` | Primary / CTAs |
| Warm Gold | `#d4a853` | Accents / chips |
| Deep Navy | `#1a2332` | Dark backgrounds |
| Surface | `#1e2a3a` | Cards / panels |
| Text | `#e2e8f0` | Body text |
| Headings Font | Playfair Display | Titles |
| Body Font | DM Sans | Body copy |
