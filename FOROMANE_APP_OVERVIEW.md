# Foromane App — Complete Overview

## What is Foromane?

**Foromane (Construction Hub)** is a mobile-first Progressive Web App (PWA) — a marketplace and business directory for **Botswana's building & construction supply ecosystem**. It connects **homeowners, builders, and contractors** with **hardware/material suppliers** and **tradespeople** in one platform.

Built by **Foromane Investments** (Game City, Gaborone). Works online and offline on any phone via the browser.

---

## User Types & What They Can Do

| Role | What they can do |
|---|---|
| **Browser (Guest)** | Browse promos, search directory, view businesses — no account needed |
| **General User** | Create shopping lists, like/favourite suppliers, compare prices, set interests |
| **Tradesperson (Pro)** | Manage a professional profile with skills, rates, portfolio, online availability |
| **Business Supplier** | List products, post promotions, manage staff, view analytics |
| **Administrator** | Approve businesses, manage users, view platform KPIs |

---

## Features

### For Customers / Homeowners / Builders
- **Browse deals** — scroll a feed of current promotions from hardware stores
- **Search directory** — find suppliers by category (plumbing, electrical, timber, etc.) or location
- **Find tradespeople** — search for electricians, plumbers, contractors by skill and location
- **Create shopping lists** — add items from promos to a note, auto-calculates total cost
- **Share quotes via WhatsApp** — send any note/list as a formatted message
- **Compare prices** — see prices across different suppliers side-by-side
- **Save favourites** — like businesses and promos for quick access
- **Read blogs** — practical articles (e.g. "How to choose the right paint", "Timber selection guide")

### For Businesses (Hardware Stores, Material Suppliers)
- **List your business** — create a profile with logo, description, categories, contact info
- **Add products** — catalogue items with prices, units, images, categories
- **Post promotions** — publish deals to the promo feed; 12 free boosts per cycle
- **Staff management** — add employees with specific permissions (manage items, promos, etc.)
- **View analytics** — see how many people viewed/liked/interacted with your promos
- **Submit marketing artwork** — submit images to admin for Facebook/Instagram promotion
- **Payment options** — receive promo payments via BTC Smega, Mascom Myzaka, Orange Money, Bank Transfer

### For Tradespeople (Electricians, Plumbers, Contractors)
- **Pro profile** — showcase trade category, skills, rates, and portfolio with images/videos
- **Online status** — toggle online/offline (shows 15-min availability window)
- **Get discovered** — appear in the Pros directory when customers search by trade
- **List services** — set pricing (hourly, daily, per-project, or quote-based)
- **Build portfolio** — upload project images and Facebook video links

### For Administrators
- **Overview dashboard** — see platform-wide KPIs (users, businesses, promos, listings)
- **Approve businesses** — review new business signups, approve or reject
- **Client management** — search, filter, and manage all registered users
- **Analytics** — platform-wide trends and metrics
- **Content scheduling** — manage the Facebook/Instagram marketing calendar

---

## Technical Features

| Feature | What it does |
|---|---|
| **Works offline** | Full offline support via service worker + IndexedDB. Browse cached promos, manage notes, queue changes |
| **3 modes** | Online (live data), Offline (cached only), Saved (prioritizes local) |
| **WhatsApp sharing** | Share promos, shopping lists, and payment proofs via WhatsApp |
| **Pricing Engine** | Formula-based pricing with variables (base price + variable extras), modifiers (urgent +20%, night shift +50%, weekend +30%), tier rules, and discounts |
| **GPS + Location** | Hierarchical Botswana location data (district → town → neighbourhood), GPS-based town detection, location filtering |
| **Product categories** | 27 top-level categories with subcategories (Boards & Timber, Plumbing, Electrical, Paint, Solar, Tiles, etc.) |
| **Google Drive backup** | Syncs user data to Google Drive for cross-device access |
| **Firebase integration** | Business data synced to Firestore, logo uploads to Firebase Storage |
| **PWA installable** | Installs to phone home screen like a native app (standalone mode, splash screen) |

---

## User Flows

### A homeowner needs to renovate their bathroom
1. Opens Foromane → browses promos for tile deals → adds good deals to a note
2. Searches the directory for plumbing suppliers → finds 3 nearby
3. Taps their profiles → compares prices on basins, taps, and fittings
4. Finds a plumber in the Pros directory → checks their profile, sees they're available
5. Shares the shopping list via WhatsApp with the plumber

### A hardware store wants to promote a sale
1. Registers as a Business Supplier → adds their business profile (logo, location, categories)
2. Admin approves the listing → business goes live in the directory
3. Adds products (e.g., cement, paint) to their catalogue with prices
4. Creates a promo ("20% off all paint this week") → submits for review
5. Once approved, the promo appears in the feed → views analytics to see engagement
6. Adds a staff member to help manage promos → grants them permission

### A contractor looking for an electrical subcontractor
1. Opens the Directory → switches to the "Pros" tab
2. Filters by trade: "Electrician" → location: "Gaborone"
3. Sees a list of available electricians with rates and online status
4. Taps a profile → views their skills, portfolio, and customer interaction history
5. Contacts them via the provided phone/WhatsApp

---

## Onboarding Flow (For Businesses)

1. Register as "Business & Materials Supplier"
2. Fill business profile (name, logo, description, categories, location)
3. Data syncs to Firebase → status: `pending_approval`
4. Admin reviews and approves
5. Business appears in directory → owner can post promos, add catalogue items, manage staff

## App Architecture (Key Files)

| File | Purpose |
|---|---|
| `index.html` | Main HTML shell with all views and modals |
| `app.js` | App boot sequence, initialization, data loading |
| `router.js` | View switching and navigation history |
| `auth.js` | Authentication (guest, login, register, admin) |
| `user-state.js` | Centralized client-side state management |
| `account.js` | User profile, contacts, interests, payment proof |
| `account-views.js` | Add-item modal, artwork submission, category pills |
| `directory.js` | Business directory with A-Z navigation |
| `promos.js` | Promotions feed rendering |
| `items.js` | Item/product CRUD, image picker, pricing integration |
| `notes.js` | Shopping list / notes management |
| `blogs.js` | Blog articles |
| `filter.js` | Filters, geolocation, category/location selection |
| `pro.js` / `pro-dashboard.js` | Professional / tradesperson profile management |
| `pricing-engine.js` | Formula-based pricing calculator |
| `sync.js` | Offline sync queue with background sync support |
| `media-cache.js` | IndexedDB blob cache for promo images |
| `db.js` | IndexedDB wrapper (foromane-supply-solutions) |
| `demo-data.js` | Sample businesses and catalogue data |
| `demo-profiles.js` | Demo user profiles for testing |
| `foromane_product_categories.js` | Hierarchical product taxonomy (27 categories) |
| `backend-logic.js` | Firebase integration, business onboarding |
| `admin/Admin.js` | Super Admin dashboard (7 tabs) |
| `staff.js` | Business staff permissions management |
| `analytics.js` | Business owner KPI dashboard |
| `locations.js` / `locations.json` | Botswana hierarchical location data |
| `sw.js` | Service worker (cache-first strategy) |
| `asset-url.js` | Firebase Storage CDN asset resolver |
| `manifest.json` | PWA manifest (standalone app install) |
