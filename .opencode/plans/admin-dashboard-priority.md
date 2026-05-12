# Admin Dashboard + Google Drive — Priority Implementation Plan

> Created: 11 May 2026
> Based on deep codebase analysis of all JS, HTML, CSS, config, and data files

---

## Table of Contents

1. [Current App Architecture](#1-current-app-architecture)
2. [The 3 Data Silos Problem](#2-the-3-data-silos-problem)
3. [What Exists vs What's Needed](#3-what-exists-vs-whats-needed)
4. [All localStorage Keys & IndexedDB Stores](#4-all-localstorage-keys--indexeddb-stores)
5. [Data Models — Every Field You'll Query](#5-data-models--every-field-youll-query)
6. [Key Relationships to Build](#6-key-relationships-to-build)
7. [Proposed Admin Dashboard UI — 5 Tabs](#7-proposed-admin-dashboard-ui--5-tabs)
8. [Tab 1: Overview](#8-tab-1-overview)
9. [Tab 2: Unified Approvals](#9-tab-2-unified-approvals)
10. [Tab 3: Facebook Packaging Calendar](#10-tab-3-facebook-packaging-calendar)
11. [Tab 4: Admin Directory Search](#11-tab-4-admin-directory-search)
12. [Tab 5: Analytics Drill-Down](#12-tab-5-analytics-drill-down)
13. [Hidden Gaps You Didn't Mention](#13-hidden-gaps-you-didnt-mention)
14. [Google Drive Integration](#14-google-drive-integration)
15. [Implementation Priority Order](#15-implementation-priority-order)

---

## 1. Current App Architecture

### Views in `index.html`

| View ID | Purpose |
|---|---|
| `view-welcome` | Guest landing page |
| `view-promos` | Promo feed (main tab) |
| `view-directory` | A-Z business directory (main tab) |
| `view-business` | Single business profile |
| `view-business-promos` | Promos for a specific business |
| `view-business-catalogue` | Category drill-down catalogue (recently redesigned) |
| `view-notes` | User's notes list |
| `view-note-open` | Single note detail |
| `view-admin` | Admin dashboard (current — minimal) |
| `view-account` | User profile/settings |
| `view-favourite-suppliers` | Favourited businesses |

### Router (`router.js`)
- `goTo(viewId)` — adds `.active` class to target view, removes from all others
- `navTab(viewId, navId)` — same + updates bottom nav active state
- `manageUI(viewId)` — shows/hides header, bottom nav, filter bar based on view

### Current Admin Entry
In `index.html` line 159:
```html
<div class="accordion" id="admin-dashboard-entry" style="display:none;">
  <div class="accordion-header" onclick="renderAdmin();goTo('view-admin')">
    <span><i class="fas fa-chart-line" style="color:var(--orange);margin-right:8px;"></i> Admin Dashboard</span>
  </div>
</div>
```
Currently hidden (`display:none`). Only shown when `Auth.isAdmin()` is true (toggle in account.js).

---

## 2. The 3 Data Silos Problem

Currently data exists in **three separate silos** that don't talk to each other:

### Silo 1: `_promos` / IndexedDB `promos` store
- The promo feed items
- Populated from: `window._userItems` (IndexedDB `items`), `window.SAMPLE_PROMOS`, `pushToPromosFeed()`
- Full objects with images, KPIs, pricing, scheduling, business info
- **Admin dashboard currently only reads this silo**

### Silo 2: localStorage (4 separate keys)
These are **NOT** connected to the promos feed or anything else:
- `wirog_artwork_submissions` — Facebook artwork submissions
- `wirog_payment_requests` — Payment proof submissions  
- `wirog_promo_requests` — Promo requests
- `wirog_promos` — Fallback promos array

### Silo 3: `_userItems` / IndexedDB `items` store
- Items the logged-in user creates via the Add Item modal
- Only the owner sees these
- NOT visible in the catalogue for anyone else

### The Problem
The admin dashboard (`renderAdmin()` in `admin.js`) reads **only** `window._promos` (Silo 1). It completely misses:
- All artwork submissions (Silo 2)
- All payment proofs (Silo 2)  
- All promo requests (Silo 2)
- Who requested what, who paid, who is pending
- Any association between a business, its owners, its items, its promos, and its payments

---

## 3. What Exists vs What's Needed

### ✅ Current Admin Dashboard (`admin.js` — 213 lines)
- KPI strip: total views, likes, note-adds across ALL promos
- Budget: total spent, avg cost/promo
- Time counts: today / this week / this month promo expiries
- Category breakdown bar chart (by promo count + KPIs)
- Recent promos list (last 10)
- Facebook approvals list (reads `wirog_artwork_submissions`, approve/reject)

### ❌ Missing — Tab 1: Overview
- [ ] Unified KPI row across ALL data (promos + payments + artwork)
- [ ] Total budget spent (sum of all `promo.cost` across all businesses)
- [ ] Active / pending / expired promo counts
- [ ] Payment method breakdown (BTC / Mascom / Orange / Bank totals)
- [ ] "Expiring this week" alert list with [Suspend] [Remove] actions
- [ ] Business count (total registered)
- [ ] Revenue estimate (total promo costs + payments)

### ❌ Missing — Tab 2: Unified Approvals Queue
- [ ] Single feed merging: promo_requests + payment_requests + artwork_submissions
- [ ] Common card layout: type badge, business name, amount/category, date, status
- [ ] [Approve] [View Proof] [Reject] actions per item
- [ ] "Approve" on promo request → auto-approve linked payment + push to `_promos`
- [ ] "Approve" on artwork → schedule to next available Mon/Wed/Fri slot
- [ ] Filter pills: [All] [Promos] [Payments] [Artwork]
- [ ] Sort: newest first / oldest pending first
- [ ] Batch approve/reject

### ❌ Missing — Tab 3: Facebook Packaging Calendar
- [ ] Interactive calendar showing Mon/Wed/Fri for each week
- [ ] Drop approved submissions onto specific dates
- [ ] Visual states: posted (green), scheduled (orange), available (empty), pending (grey)
- [ ] "Package for week" button — auto-fills next 3 slots with unassigned approved work
- [ ] View by: week / month / all
- [ ] Navigate: rest of 2026 and onwards
- [ ] Per-post: view images, business name, category, status
- [ ] Drag-to-reorder scheduled posts within a week

### ❌ Missing — Tab 4: Admin Directory Search
- [ ] A-Z alpha navigation (same pattern as `view-directory`)
- [ ] Search bar: filter by name, location, category
- [ ] Business list items showing: name, location, total spent, promo count, active badge
- [ ] Tap → opens `view-admin-business` (new view) with full drill-down:
  - Business summary card (name, location, contact, subscription tier)
  - **Stats row**: total spend, total promos, active promos, total views
  - **Tabs**: Catalogue | Promos | Facebook | Payments | Staff
  - **Catalogue tab**: all items listed, ranked by views, zero-view items highlighted
  - **Promos tab**: all promos past+present, KPI per promo, [Suspend] [Remove] actions
  - **Facebook tab**: all artwork submissions, approved/rejected/pending, scheduled dates
  - **Payments tab**: all payment proofs, method, amount, date, status
  - **Staff tab**: owners + staff from `BUSINESS_ASSOCIATIONS`
  - **Moderation**: [Suspend Business] [Ban Business] [Remove All Promos]

### ❌ Missing — Tab 5: Analytics Drill-Down
- [ ] Per-business analytics (mirroring the analytics wireframe)
- [ ] **Spending tab**: list of charges per month, totals, method breakdown
- [ ] **Catalogue tab**: items ranked by views, zero-view items flagged with suggestion
- [ ] **Promos tab**: KPI per promo, impression bar chart, tap-through rate
- [ ] **Facebook tab**: posts per month, best day (reach), slots used/remaining, estimated reach
- [ ] **Directory & Sharing**: profile views, contact taps, note adds, WhatsApp shares
- [ ] **Monthly history**: tap a month → full breakdown (Screen 3 of wireframe)
- [ ] **Time range pills**: This month / Last month / 3 months / All time

---

## 4. All localStorage Keys & IndexedDB Stores

### IndexedDB Stores (defined in `db.js`)
```
users, businesses, items, promos, notes, kpi, filters, profiles, credentials
```

### localStorage Keys Used for Admin-Relevant Data

| Key | Type | Content | Created By |
|---|---|---|---|
| `wirog_artwork_submissions` | `Submission[]` | Facebook artwork submissions | `submitArtwork()` in account-views.js |
| `wirog_payment_requests` | `PaymentRequest[]` | Payment proof submissions | `submitPaymentProof()` in account.js |
| `wirog_promo_requests` | `PromoRequest[]` | Promo/ad requests | `createPromoRequest()` in account.js |
| `wirog_promos` | `Promo[]` | Fallback promos array | `pushToPromosFeed()` in account.js |
| `wirog_boosts_remaining` | `string` (number) | Facebook boosts left this month | `submitArtwork()` in account-views.js |
| `wirog_promoWeekReset` | ISO date string | Weekly promo reset date | `UserState` in user-state.js |
| `wirog_promosThisWeek` | `string` (number) | Promos used this week | `UserState` in user-state.js |
| `wirog_items` | `Item[]` | Items from add-item modal | `saveAddItem()` in account-views.js |
| `wirog_drive_records_reviewed` | `string[]` | IDs of reviewed Drive records | `markDriveRecordReviewed()` in account.js |

### Submission Data Structures

**`wirog_artwork_submissions`** — one entry:
```js
{
  id: 'sub_' + Date.now(),
  category: string,        // e.g. "Boards & Timber"
  boostDay: string,        // "Mon" | "Wed" | "Fri"
  businessName: string,    // e.g. "Board Kings"
  userId: string,          // e.g. "supplier"
  imageCount: number,      // number of images uploaded (max 12)
  status: string,          // "pending" | "approved" | "rejected"
  createdAt: number,       // Date.now()
  reviewedAt: number,      // Date.now() (when approved/rejected)
  reason: string           // rejection reason (if rejected)
}
```

**`wirog_payment_requests`** — one entry:
```js
{
  id: string,              // genId()
  userId: string,          // e.g. "supplier"
  method: string,          // "BTC" | "Mascom" | "Orange" | "Bank"
  amount: number,          // e.g. 75
  purpose: string,         // e.g. "Promo boost - 3 days"
  image: string|null,      // base64 data URL of proof screenshot
  status: string,          // "pending" | "approved" | "rejected"
  createdAt: number        // Date.now()
}
```

**`wirog_promo_requests`** — one entry:
```js
{
  id: string,              // genId()
  title: string,           // item title
  desc: string,            // item description
  category: string,        // main category
  businessName: string,    // business name
  userId: string,          // user ID
  amount: number,          // payment amount
  durationDays: number,    // promo duration
  status: string,          // "pending" | "approved" | "rejected"
  createdAt: number,       // Date.now()
  reason: string           // rejection reason
}
```

---

## 5. Data Models — Every Field You'll Query

### `_promos` / IndexedDB `promos` (from `submitPromo()` in items.js)
```js
{
  id: 'promo_' + Date.now(),
  title: string,
  desc: string,
  category: string,
  categoryPath: [string],
  tags: [string],
  images: [string],                   // data URLs or paths
  basePrice: number,
  price: number,
  unit: string,
  variables: [{name, price}],
  modifiers: {urgency, nightShift, remoteArea, hazard},
  tiers: null,
  discount: null,
  pricingResult: {unitPrice, modifierMultiplier, discountAmount, breakdown},
  geofencing: {region, town, area, gps: {lat, lng, radius}},
  scheduling: {startDate, endDate, days: []},
  promo: {
    active: true,
    cost: number,
    days: number,
    freePromoUsed: boolean,
    submittedAt: ISO string,
    expiresAt: ISO string,
    status: 'active' | 'suspended' | 'ended'
  },
  kpi: {views: 0, likes: 0, interactions: 0, addedToNotes: 0},
  businessId: 'biz_user' | 'biz-1' | etc,
  businessName: string,
  businessInit: string,
  businessColor: string,
  location: string,
  phone: string,
  emoji: string,
  bg: string,
  promoType: string,
  region: string,
  qty: 1,
  liked: boolean,
  cost: number,
  days: number,
  endDate: ISO string,
  createdAt: ISO string
}
```

### `SAMPLE_BUSINESSES` (one entry)
```js
{
  id: 'biz-1',
  name: 'Board Kings',
  category: 'Boards & Timber',         // main category
  categories: ['Timber', 'Boards', ...], // subcategories
  location: 'Phakalane (Extension 97), Gaborone',
  initials: 'BK',
  color: '#1a4b8c',
  phone: '+267 71234567',
  public: true,
  cataloguePublic: true,
  description: '',
  subscription: 'full' | 'catalogue' | 'basic'
}
```

### `DEMO_PROFILES` (one entry)
```js
{
  id: 'user-kago',
  name: 'Kago Motlhabane',
  role: 'General User',
  initials: 'KM',
  color: '#2a4a8c',
  town: 'Gaborone',
  firstName: 'Kago',
  surname: 'Motlhabane',
  email: 'kago.setlhare@gmail.com',
  phone: '+267 72345678'
}
```

### `BUSINESS_ASSOCIATIONS`
```js
{
  'supplier':     { businessId: 'biz-1', role: 'owner' },
  'user-william': { businessId: 'biz-1', role: 'owner' },
  'staff-kudi':   { businessId: 'biz-1', role: 'staff' },
  // ... 52+ owner entries, 4 staff entries
}
```

### UserState (logged-in user, from `user-state.js`)
```js
{
  id: string | null,
  name: string,
  business: object | null,    // SAMPLE_BUSINESSES entry
  businessRole: 'owner' | 'staff' | null,
  kpi: {ads: 0, views: 0, likes: 0, noteAdds: 0},
  freePromoUsed: boolean,
  promoWeekReset: ISO string,
  promosThisWeek: number,
  favourites: [string]        // array of biz IDs
}
```

### `DEMO_CATALOGUE_ITEMS` (one entry)
```js
{
  id: 'cat_prod-1',
  title: 'Meranti Planks 22x144mm',
  desc: 'High-quality Meranti timber...',
  basePrice: 85,
  price: 85,
  unit: 'per meter',
  businessId: 'biz-1',
  businessName: 'Board Kings',
  category: 'Boards & Timber',
  subcategory: 'Timber',
  stock: 120,
  images: ['assets/images/categories_examples/...jpg'],
  emoji: '🪵',
  discountPercent: 10,
  discountPrice: 76.5,
  qty: 1,
  liked: false
}
```

---

## 6. Key Relationships to Build

```
User (DEMO_PROFILES / IndexedDB users)
  │
  ├── BUSINESS_ASSOCIATIONS ──→ Business (SAMPLE_BUSINESSES)
  │     │
  │     ├── Items (DEMO_CATALOGUE_ITEMS / _userItems / wirog_items)
  │     │     └── each has: category, subcategory, businessId
  │     │
  │     ├── Promos (_promos / IndexedDB promos)
  │     │     └── each has: businessId, promo.expiresAt, kpi
  │     │
  │     ├── Catalogue (same as items, but grouped by main category)
  │     │
  │     ├── Artwork submissions (wirog_artwork_submissions)
  │     │     └── currently has: userId, businessName (NO businessId!)
  │     │
  │     ├── Payment proofs (wirog_payment_requests)
  │     │     └── currently has: userId (NO businessId!)
  │     │
  │     └── Promo requests (wirog_promo_requests)
  │           └── currently has: userId, businessName (NO businessId!)
  │
  └── User KPIs (IndexedDB kpi / UserState.kpi)
```

### Critical Data Gap
The `wirog_artwork_submissions`, `wirog_payment_requests`, and `wirog_promo_requests` entries store `userId` and `businessName` as strings but do **NOT** store `businessId`. To link them to a business:
1. Look up `userId` in `BUSINESS_ASSOCIATIONS` → get `{ businessId, role }`
2. Then look up `businessId` in `SAMPLE_BUSINESSES` → get full business data

### Resolution Query (pseudocode)
```js
function resolveBusinessFromUserId(userId) {
  const assoc = window.BUSINESS_ASSOCIATIONS[userId];
  if (!assoc) return null;
  const biz = window.SAMPLE_BUSINESSES.find(b => b.id === assoc.businessId);
  return { ...biz, role: assoc.role };
}
```

---

## 7. Proposed Admin Dashboard UI — 5 Tabs

```
┌─────────────────────────────────────────────────────┐
│ 🔵 Admin Dashboard                          ⚙️    │
│   Some Town, Botswana                     [Logout]  │
├─────────────────────────────────────────────────────┤
│  [Overview] [Approvals] [Facebook] [Directory] [Ana]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  (content changes per tab — see sections below)     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Navigation Pattern
- 5 horizontal scrollable pills or fixed tab bar (orange active underline)
- Each tab calls its own render function
- All data aggregated in a central `adminData` object computed at render time

---

## 8. Tab 1: Overview

```
┌─────────────────────────────────────────────┐
│ 📊 OVERVIEW                                  │
├─────────────────────────────────────────────┤
│ ┌───────┬───────┬───────┬───────┐           │
│ │ 47    │ 12    │ 8     │ P3,450│           │
│ │ Total │ Active│ Pending│ Total │           │
│ │Promos │ Promos│ Apprvls│ Spent │           │
│ ├───────┼───────┼───────┼───────┤           │
│ │ 28    │ 15    │ 5     │ 3     │           │
│ │ Bizs  │ With  │ Expire│ Pending│           │
│ │Active │Promos │This Wk│Paymnts│           │
│ └───────┴───────┴───────┴───────┘           │
│                                              │
│ ─── EXPIRING THIS WEEK ───                   │
│ ┌──────────────────────────────────────┐    │
│ │ 🔴 Chipboard 18mm (Board Kings)     │    │
│ │    Expires 14 May · P245             │    │
│ │    [Suspend] [Remove]                │    │
│ ├──────────────────────────────────────┤    │
│ │ 🟡 Dulux Emulsion (BuildIt Gabs)    │    │
│ │    Expires 16 May · P520             │    │
│ │    [Suspend] [Remove]                │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ─── PAYMENT METHODS ───                      │
│ ┌──────────┬────────┬────────┬────────┐     │
│ │ BTC      │ Mascom │ Orange │ Bank   │     │
│ │ P1,200   │ P850   │ P600   │ P800   │     │
│ │ 15 txns  │ 10 txns│ 7 txns │ 4 txns │     │
│ └──────────┴────────┴────────┴────────┘     │
└─────────────────────────────────────────────┘
```

### Data Requirements
- `_promos.filter(p => p.promo?.status === 'active')` for active count
- `_promos.filter(p => isExpiringThisWeek(p.promo?.expiresAt))` for expiring
- Merge all 3 localStorage request arrays for pending count
- Sum `promo.cost` across ALL promos for total spent
- Count unique `businessId` values in `_promos` for active businesses
- Aggregate `wirog_payment_requests` by `method` field

### Actions
- [Suspend] → set `promo.status = 'suspended'` on the promo object
- [Remove] → `_promos = _promos.filter(p => p.id !== id)` + IndexedDB delete

---

## 9. Tab 2: Unified Approvals

```
┌─────────────────────────────────────────────┐
│ ✅ APPROVALS                        🔴 12  │
│ [All] [Promos] [Payments] [Artwork]        │
├─────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐    │
│ │ 📦 Promo Request                     │    │
│ │ Board Kings · P75.00 · 3 days       │    │
│ │ "Meranti Planks 15% Off"            │    │
│ │ Banking & Finance · 12 May 2026     │    │
│ │ Payment: BTC Smega ✓ Proof attached │    │
│ │ [Approve] [View Proof] [Reject]     │    │
│ ├──────────────────────────────────────┤    │
│ │ 🎨 Facebook Artwork                  │    │
│ │ BuildIt Gabs · Paint category       │    │
│ │ 5 images · Wed boost requested      │    │
│ │ 12 May 2026                         │    │
│ │ [Approve] [Schedule: Mon▼] [Reject] │    │
│ ├──────────────────────────────────────┤    │
│ │ 💳 Payment Proof                     │    │
│ │ Francistown Steel · P155.00         │    │
│ │ Orange Money · 11 May 2026          │    │
│ │ [Approve] [View Proof] [Reject]     │    │
│ └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Data Requirements
- Merge 3 arrays: `wirog_promo_requests` + `wirog_payment_requests` + `wirog_artwork_submissions`
- Common interface per item: `{ type, id, businessName, date, status, action, ...original }`
- Sort by `createdAt` descending (newest first)
- Filter by status (`pending` only for default view)
- Resolve `userId` → business name via `BUSINESS_ASSOCIATIONS`

### Actions
- **Approve (promo)**: mark `wirog_promo_requests[].status = 'approved'`, mark linked `wirog_payment_requests[].status = 'approved'`, call `pushToPromosFeed()` to add to `_promos`
- **Approve (artwork)**: mark `wirog_artwork_submissions[].status = 'approved'`, set `reviewedAt = Date.now()`, optionally assign to Facebook slot
- **Approve (payment)**: mark `wirog_payment_requests[].status = 'approved'`, find linked promo request and approve it too
- **Reject**: set status + `reason`, notify user (WhatsApp?)
- **View Proof**: open modal with the `image` base64 data URL

---

## 10. Tab 3: Facebook Packaging Calendar

```
┌─────────────────────────────────────────────┐
│ 📅 FACEBOOK PACKAGING                       │
│ [2026] ▼ [May] ▼                            │
├─────────────────────────────────────────────┤
│ Week of 11 May 2026                         │
│ ┌──────────┬──────────┬──────────┐          │
│ │ MON 12   │ WED 14   │ FRI 16   │          │
│ │ ──────── │ ──────── │ ──────── │          │
│ │ Board    │ BuildIt  │ 🟢 Empty │          │
│ │ Kings    │ Gabs     │ 0 posts  │          │
│ │ Paint    │ Lumber   │          │          │
│ │ ad #1    │ ad #2    │ [+ Add]  │          │
│ │          │ ad #3    │          │          │
│ │ [3/3]    │ [2/3]    │          │          │
│ └──────────┴──────────┴──────────┘          │
│                                              │
│ [Package this week] unassigned: 4 approved  │
│                                              │
│ ─── UNASSIGNED APPROVED ARTWORK ───          │
│ ┌──────────────────────────────────────┐    │
│ │ 🎨 Francistown Steel - Steel promos  │    │
│ │    5 images · Approved 11 May        │    │
│ │    [Assign to: Mon▼] [Assign]        │    │
│ ├──────────────────────────────────────┤    │
│ │ 🎨 Plumber's Choice - Pipes          │    │
│ │    3 images · Approved 10 May        │    │
│ │    [Assign to: Wed▼] [Assign]        │    │
│ └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Data Requirements
- All `wirog_artwork_submissions` where `status === 'approved'` and NOT yet assigned to a date
- A new localStorage key: `wirog_facebook_schedule` — array of:
  ```js
  { date: '2026-05-12', slot: 'Mon', submissionId: 'sub_...', posted: false }
  ```
- Calendar grid generation for Mon/Wed/Fri from current date through end of 2026+
- Max __?__ posts per slot (configurable, suggest 3 per slot)

### Actions
- **Assign**: link approved submission to a calendar slot
- **Unassign**: remove from slot, keep as "unassigned approved"
- **Package week**: auto-assign all unassigned approved to next available Mon/Wed/Fri slots
- **Mark posted**: toggle `posted: true` after you actually publish to Facebook
- **View artwork**: open modal showing all images for a submission

---

## 11. Tab 4: Admin Directory Search

```
┌─────────────────────────────────────────────┐
│ 🔍 Directory Search                28 bizs  │
│ ┌──────────────────────────────────────┐    │
│ │ Search by name, location...          │    │
│ └──────────────────────────────────────┘    │
│ A B C D E F G H I J K L M N O P Q R S T... │
│                                              │
│ ┌──────────────────────────────────────┐    │
│ │ B  Board Kings                       │    │
│ │    Phakalane, Gaborone               │    │
│ │    P1,245 spent · 8 promos · 🟢 3act│    │
│ │    [View Business Card ▶]            │    │
│ ├──────────────────────────────────────┤    │
│ │ B  BuildIt Gabs                      │    │
│ │    Block 8, Gaborone                 │    │
│ │    P550 spent · 4 promos · 🟡 1act  │    │
│ │    [View Business Card ▶]            │    │
│ └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Per-Business Admin Card (drill-down view)

```
┌─────────────────────────────────────────────┐
│ ← Back to Directory                          │
│                                              │
│ ┌──────────────────────────────────────┐    │
│ │  🏪 Board Kings                      │    │
│ │  📍 Phakalane (Extension 97), Gabs   │    │
│ │  📞 +267 71234567                    │    │
│ │  📋 Subscription: Full               │    │
│ │  👥 3 owners · 4 staff               │    │
│ │  🚫 [Suspend Business] [Ban]         │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ┌──────┬──────┬──────┬──────┬──────┐        │
│ │Total │Promos│Active│ Avg  │Total │        │
│ │Spent │Total │Now   │Cost  │Views │        │
│ │P1,245│  8   │  3   │P156  │ 890  │        │
│ └──────┴──────┴──────┴──────┴──────┘        │
│                                              │
│ [Catalogue] [Promos] [Facebook] [Payments]   │
│ [Staff]                                      │
│                                              │
│ ─── CATALOGUE (12 items) ───                 │
│ ┌──────────────────────────────────────┐    │
│ │ Meranti Planks 22×144mm · 84 views   │    │
│ │ Chipboard 18mm · 61 views            │    │
│ │ Postform Top White · 55 views        │    │
│ │ ...                                  │    │
│ │ ⚠️ PVC Foil oak woodgrain · 0 views  │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ─── PROMOS (8 total, 3 active) ───           │
│ ┌──────────────────────────────────────┐    │
│ │ 🟢 Meranti Planks 15% Off           │    │
│ │    Exp: 14 May · P75 · 412 views    │    │
│ │    [Suspend] [Remove]                │    │
│ ├──────────────────────────────────────┤    │
│ │ ⚫ Chipboard Clearance (ended)       │    │
│ │    Ended 9 May · 280 views          │    │
│ │    [Remove]                          │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ─── FACEBOOK (5 posts submitted) ───         │
│ ┌──────────────────────────────────────┐    │
│ │ ✅ Mon 12 May · Paint ad (approved)  │    │
│ │ ⏳ Wed 14 May (pending)              │    │
│ │ ❌ Fri 9 May (rejected: low quality) │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ─── PAYMENTS (12 total) ───                  │
│ ┌──────────────────────────────────────┐    │
│ │ 10 May · P75 · BTC Smega ✅         │    │
│ │ 8 May  · P55 · Mascom ✅            │    │
│ │ 5 May  · P200 · Orange ✅           │    │
│ │ 1 May  · P350 · Bank Transfer       │    │
│ │   (pending verification)            │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ─── STAFF ───                                │
│ ┌──────────────────────────────────────┐    │
│ │ 👑 William (owner)                   │    │
│ │ 👑 Robert (owner)                    │    │
│ │ 👑 Gerald (owner)                    │    │
│ │ 👤 Kudi (staff)                       │    │
│ │ 👤 Mark (staff)                       │    │
│ │ 👤 Smokey (staff)                     │    │
│ │ 👤 Tshepang (staff)                   │    │
│ └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Data Requirements
- `SAMPLE_BUSINESSES` for all business info
- `_promos.filter(p => p.businessId === bizId)` for all promos
- `DEMO_CATALOGUE_ITEMS.filter(it => it.businessId === bizId)` for catalogue
- `_userItems` for user's own items (biz_user case)
- `wirog_artwork_submissions` filtered by resolved bizId
- `wirog_payment_requests` filtered by resolved bizId
- `wirog_promo_requests` filtered by resolved bizId
- `BUSINESS_ASSOCIATIONS` filtered by `businessId` to get all owners+staff
- `DEMO_PROFILES` to get full names for owner/staff entries

### Actions
- [Suspend Business]: set `biz.suspended = true` on the business object
- [Ban Business]: set `biz.banned = true`, remove all promos
- [Suspend Promo]: set `promo.status = 'suspended'`
- [Remove Promo]: delete from `_promos` + IndexedDB

---

## 12. Tab 5: Analytics Drill-Down

```
┌─────────────────────────────────────────────┐
│ 📈 ANALYTICS                                │
│ [This month] [Last month] [3mo] [All time]  │
├─────────────────────────────────────────────┤
│ ─── SPENDING OVERVIEW ───                    │
│ ┌──────────┬──────────┐                     │
│ │ P3,450   │ P12,200  │                     │
│ │ Total    │ Spent    │                     │
│ │ Spent    │ This Year│                     │
│ │ P350 plan│ 7 months │                     │
│ │ + P200   │ active   │                     │
│ │ add-on   │          │                     │
│ └──────────┴──────────┘                     │
│ Promo credits: ████████░░ 8/12 used         │
│ Facebook slots: █████░░░░░ 5/12 used        │
│ Renewal date: 1 Jun 2026                    │
│                                              │
│ ─── CATALOGUE PERFORMANCE ───                │
│ ┌──────────┬──────────┐                     │
│ │ 2,450    │ 89       │                     │
│ │ Catalogue│ Items    │                     │
│ │ Views    │ Listed   │                     │
│ │ +18% vs  │ 12 with  │                     │
│ │ last mo  │ 0 views  │                     │
│ └──────────┴──────────┘                     │
│ Top items:                                   │
│ 1. Meranti Planks · 412 views               │
│ 2. Chipboard 18mm · 280 views               │
│ 3. Dulux Emulsion · 195 views               │
│ [View all items ▶]                          │
│                                              │
│ ─── PROMO PERFORMANCE ───                    │
│ ████████████░░░░ 1,840 impressions          │
│ ████████░░░░░░░░░░                          │
│ ████████████████░░░░                        │
│ ██████░░░░░░░░░░░░░░                        │
│ ┌──────────┬──────────┐                     │
│ │ 1,840    │ 6.2%     │                     │
│ │ Total    │ Avg Tap  │                     │
│ │Impressns│-through  │                     │
│ └──────────┴──────────┘                     │
│ Promos live: 12 active · 3 pending          │
│                                              │
│ ─── FACEBOOK PROMOS ───                      │
│ ┌──────────┬──────────┐                     │
│ │ 5        │ Wed      │                     │
│ │ Posts    │ Best day │                     │
│ │ This Mo  │ (reach)  │                     │
│ └──────────┴──────────┘                     │
│ Estimated reach this month: ~48k            │
│                                              │
│ ─── DIRECTORY & SHARING ───                  │
│ ┌──────────┬──────────┐                     │
│ │ 2,150    │ 520      │                     │
│ │ Profile  │ Contact  │                     │
│ │ Views    │ Taps     │                     │
│ ├──────────┼──────────┤                     │
│ │ 180      │ 95       │                     │
│ │ Added to │ WhatsApp │                     │
│ │ Notes    │ Shares   │                     │
│ └──────────┴──────────┘                     │
│                                              │
│ ─── MONTHLY HISTORY ───                      │
│ 🟠 May 2026 · P700 · 1,840 impressions ▶    │
│ ⚪ Apr 2026 · P350 · 1,220 impressions ▶    │
│ ⚪ Mar 2026 · P350 · 990 impressions  ▶     │
│ ⚪ Feb 2026 · P350 · 850 impressions  ▶     │
└─────────────────────────────────────────────┘
```

### Monthly Drill-Down (Screen 3 of wireframe)

```
┌─────────────────────────────────────────────┐
│ ← May 2026                                  │
│ [Spending] [Catalogue] [Promos] [Facebook]  │
├─────────────────────────────────────────────┤
│ ─── SPENDING ───                             │
│ P350 monthly plan · 1 May 2026     P350.00  │
│ Facebook add-on · 4 May            P200.00  │
│ Promo boost (Chipboard) · 6-9 May   P75.00  │
│ Promo boost (Paint) · 10-13 May     P55.00  │
│ ──────────────────────────────────────────── │
│ Total                                P680.00 │
│                                              │
│ ─── CREDITS USED ───                         │
│ Promo credits: ████████░░ 8/12 used          │
│ Facebook slots: █████░░░░░ 5/24 used         │
│ Boosted cats: ██████░░░░░ 3/5 active         │
│                                              │
│ ─── PROMO RESULTS ───                        │
│ Meranti Planks 15% off    412 views  8.1%    │
│ Chipboard clearance       280 views  5.4%    │
│ PVC Foil oak woodgrain    Pending   awaiting │
│                                              │
│ ─── CATALOGUE ITEMS ───                      │
│ Meranti Planks 22×144mm        412 views     │
│ Chipboard 18mm                 280 views     │
│ Postform Top Glacier White     195 views     │
│ PVC Edging 22mm                 45 views     │
│ PVC Foil oak woodgrain    ⚠️     0 views     │
└─────────────────────────────────────────────┘
```

### Data Requirements
- Sum `promo.cost` grouped by month (from `promo.submittedAt`)
- Sum `promo.cost` grouped by business
- `kpi.views` on promos aggregated by month
- `wirog_payment_requests` aggregated by method and month
- `wirog_artwork_submissions` counted by month and status
- Impressions: `kpi.views` summed per promo
- Tap-through: `kpi.interactions / kpi.views` per promo

---

## 13. Hidden Gaps You Didn't Mention

These are implied by the system but don't yet exist:

### 13.1 Notification System
When admin approves/rejects, the business owner needs to know. Currently no notification mechanism exists. Options:
- WhatsApp API (send message via `wa.me` link)
- In-app notification bell (IndexedDB `notifications` store)
- Email

### 13.2 Audit Log
Every approve, reject, suspend, remove action should be logged:
```js
{
  id: 'audit_' + Date.now(),
  adminId: string,
  action: 'approve' | 'reject' | 'suspend' | 'remove' | 'ban',
  targetType: 'promo' | 'payment' | 'artwork' | 'business' | 'user',
  targetId: string,
  timestamp: number,
  reason: string,
  metadata: object
}
```
Store in: `wirog_audit_log` (localStorage) + eventually Drive.

### 13.3 Admin Auth
Currently any user can see the admin dashboard if they navigate to it. Need:
- Proper admin account check (`Auth.isAdmin()`)
- Admin login route
- Admin session management

### 13.4 Data Export
Export analytics to CSV/PDF:
- Export monthly report as CSV
- Export all promos for a business
- Export payment history

### 13.5 Google Drive Admin Folder
`wirog-config.json` has `admin_folder_id` but no admin folder schema in `folder_schema`. Admin needs:
```
admin/audit_log/
admin/approved_promos/
admin/artwork_posts/
admin/payment_proofs/
admin/reports/
```

### 13.6 Per-Business KPI
`IndexedDB.kpi` store is per-user (`UserState.kpi`). No per-business KPI aggregator. Need:
```js
function aggregateBusinessKpi(businessId) {
  const promos = _promos.filter(p => p.businessId === businessId);
  return {
    totalViews: promos.reduce((s, p) => s + (p.kpi?.views || 0), 0),
    totalLikes: promos.reduce((s, p) => s + (p.kpi?.likes || 0), 0),
    totalInteractions: promos.reduce((s, p) => s + (p.kpi?.interactions || 0), 0),
    totalNoteAdds: promos.reduce((s, p) => s + (p.kpi?.addedToNotes || 0), 0),
    totalSpend: promos.reduce((s, p) => s + (p.promo?.cost || 0), 0),
    promoCount: promos.length,
    activeCount: promos.filter(p => p.promo?.status === 'active').length
  };
}
```

### 13.7 Artwork Submissions Missing `businessId`
The `wirog_artwork_submissions` entries store `userId` and `businessName` but NOT `businessId`. You can't directly link to a business without `userId → BUSINESS_ASSOCIATIONS → businessId`. When enriching, do this at read time.

### 13.8 Multiple Admin Users
Currently `Auth.isAdmin()` is likely a simple check for a hardcoded admin user ID. Need:
- Admin user management
- Multi-admin support with permissions

### 13.9 Mobile Money Logo Assets
Payment proofs reference 3 mobile money logos:
- `assets/logos/btc_logo.png` (BTC Smega)
- `assets/logos/mascom_logo.png` (Mascom Myzaka)
- `assets/logos/orange_logo.png` (Orange Money)

The admin needs to see which method was used when reviewing payment proofs.

### 13.10 Facebook Post Assets
Artwork submissions upload images to the upload server (`UPLOAD_SERVER_URL`). The admin needs to view these images when approving — currently stored as file count only, not URLs. The `submitArtwork()` function uploads to server but only saves `imageCount` in the submission record, not the returned URLs.

---

## 14. Google Drive Integration

### Current State (`wirog-config.json`)
```json
{
  "root_folder_id": "1jgPu6QXfgmO_IVlZuZj_ORR8z5RY9laR",
  "businesses_folder_id": "11Kye0o4aLICzRJaeoVlHoVcNbknQjdF9",
  "admin_folder_id": "___RUN_SCRIPT_FIRST___",
  "clients_root_id": "1PEvHwhoxe0eQ75G2Gs_bfMsUBV5mMGPA",
  "users_folder_id": "1o0ny3CphNC92ZnVPBaLMEPWxtRAwubhz",
  "pros_folder_id": "1Gbr_MeCimMRY-ESzoS7uIcpEajov51fB",
  "folder_schema": {
    "user": { "subfolders": ["profile_picture", "notes", "documents"], "files": ["liked_promos.json", "favourite_suppliers.json", "notes_index.json", "kpi_cache.json", "subscription.json"] },
    "pro": { "subfolders": ["portfolio", "promos", "catalogue", "cover_photo", "documents", "staff", "reviews"], "files": ["profile.json"] },
    "business": { "subfolders": ["logo", "profile", "promos", "catalogue", "cover_photo", "staff", "documents", "reviews"], "files": ["business_profile.json"] }
  }
}
```

### What Needs to Be Added for Admin Drive Sync
- `admin_folder_id` needs to be populated (currently `"___RUN_SCRIPT_FIRST___"`)
- `folder_schema.admin` needs to be added:
  ```json
  "admin": {
    "subfolders": ["audit_log", "approved_promos", "artwork_posts", "payment_proofs", "reports", "facebook_schedule"],
    "files": ["admin_config.json", "business_index.json", "approval_queue.json"]
  }
  ```

### Drive Sync Flow for Admin Actions
```
Admin approves promo in dashboard
  → localStorage.wirog_promo_requests updated immediately
  → IndexedDB.promos updated (pushToPromosFeed)
  → SyncQueue.enqueue('promo_approval', {id, status, reviewedAt})
  → Background sync → Google Drive API
  → Drive: /business/profiles/{bizId}/promos/{promoId}.json updated
  → Drive: /admin/approved_promos/{promoId}.json written
  → Drive: /admin/audit_log/{timestamp}-approve.json written
```

---

## 15. Implementation Priority Order

### Phase 1 (Foundation) — Estimated: 1-2 sessions
1. **Create admin data layer** — single JS module that reads ALL silos and returns unified data
2. **Build business resolution** — `resolveBusinessFromUserId()` helper
3. **Build `aggregateBusinessKpi()`** — per-business stats aggregator
4. **Add `wirog_audit_log`** — localStorage key for logging all admin actions
5. **Add `wirog_facebook_schedule`** — localStorage key for packaging calendar

### Phase 2 (Core Dashboard) — Estimated: 2-3 sessions
6. **Redesign `view-admin`** with 5-tab layout (Overview, Approvals, Facebook, Directory, Analytics)
7. **Build Overview tab** — KPI strip, expiring list, payment method breakdown
8. **Build Unified Approvals tab** — merge 3 streams, approve/reject actions, filter pills
9. **Build Facebook Packaging Calendar tab** — Mon/Wed/Fri grid, assign/drop, package week

### Phase 3 (Business Drill-Down) — Estimated: 2-3 sessions
10. **Build Admin Directory Search** — A-Z nav + search bar
11. **Build `view-admin-business`** — per-business card with 5 sub-tabs
12. **Build Catalogue tab** — items ranked by views, zero-view flagging
13. **Build Promos tab** — all promos, suspend/remove actions
14. **Build Facebook tab** — all artwork submissions per business
15. **Build Payments tab** — all payment proofs per business
16. **Build Staff tab** — owners + staff listed

### Phase 4 (Analytics & Drive) — Estimated: 2-3 sessions
17. **Build Analytics tab** — spending, catalogue, promo, facebook sections
18. **Build monthly drill-down** — Screen 3 of wireframe with tabs
19. **Build per-business analytics** — same drill-down but for specific business
20. **Wire admin actions to Google Drive** — sync approvals/rejections/suspensions
21. **Add admin folder schema** to `wirog-config.json`
22. **Run Google Apps Script** to create admin folder structure

### Phase 5 (Polish) — Estimated: 1 session
23. **Data export** — CSV/PDF download
24. **Audit log viewer** — in admin dashboard
25. **Notification system** — WhatsApp links or in-app
26. **Admin auth** — proper admin login

---

## Appendix: Key Code Locations

| What | File | Line(s) |
|---|---|---|
| Current admin dashboard | `admin.js` | 1-213 |
| Promo creation/submission | `items.js` | 575-660 |
| Artwork submission | `account-views.js` | 314-329, 414-467 |
| Payment proof modal | `account.js` | 402-475 |
| Promo request creation | `account.js` | 468-475 |
| Render promo requests list | `account.js` | 476-528 |
| Approve/reject requests | `account.js` | 539-600 |
| Push approved to promos | `account.js` | 563-584 |
| Business data | `demo-data.js` | (full file) |
| Business associations | `demo-data.js` | 572-611 |
| User profiles | `demo-profiles.js` | (full file) |
| Catalogue items | `demo-data.js` | 1652+ |
| Sample promos | `demo-data.js` | 4595+ |
| UserState | `user-state.js` | 1-225+ |
| Router | `router.js` | 1-93 |
| View definitions | `index.html` | 30-112 |
| WIROG categories | `wirog_product_categories.js` | (full file) |
| Locations | `locations.json` | (full file) |
| Drive config | `wirog-config.json` | (full file) |
| Admin entry in view | `index.html` | 158-163 |
| Bottom nav icons | `index.html` | (bottom of file) |
| KPI update | `account.js` | 1152-1157 |
| KPI save to IndexedDB | `account.js` | 1071-1081 |
| KPI load from IndexedDB | `app.js` | 151-158 |
| Promo expiry check | `promos.js` | 42-56 |
| Promo feed rendering | `promos.js` | 85-191 |
| Directory listing | `directory.js` | 28-50 |
| A-Z alpha nav | `directory.js` | 165-183 |
| Business catalogue | `directory.js` | 417-570+ |
| Business profile | `directory.js` | 190-247 |

---

**End of plan. This document covers every data structure, flow, gap, and requirement needed to build the admin dashboard with Google Drive integration.**
