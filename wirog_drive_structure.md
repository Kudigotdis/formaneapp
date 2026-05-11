# 📁 Wirog App — Google Drive Master Structure

> **Billing principle:** Every file/folder under `clients/` counts toward that client's storage quota.
> Files under `app-system/` are admin/platform assets — not billed to clients.

---

## Root: `Wirog App Drive/`

```
Wirog App Drive/
│
├── 📁 app-system/                        ← ADMIN ONLY — not billed to clients
│   ├── 📁 icons/                         ← App UI icons (from assets/icons/)
│   │   ├── solid/
│   │   └── brands/
│   ├── 📁 category-images/               ← 703 preset category example images
│   │   ├── attire-uniform/
│   │   ├── bathroom-kitchen/
│   │   ├── boards-timber/
│   │   ├── building-materials/
│   │   ├── cement-aggregates/
│   │   ├── chemicals/
│   │   ├── design-plans/
│   │   ├── doors-windows/
│   │   ├── electrical/
│   │   ├── gardening-outdoor-living/
│   │   ├── generators-power-solutions/
│   │   ├── geysers-heating/
│   │   ├── hardware-fasteners/
│   │   ├── home-decor/
│   │   ├── lighting/
│   │   ├── paint/
│   │   ├── partitioning/
│   │   ├── plumbing/
│   │   ├── pre-builds-shipping-containers/
│   │   ├── roofing-ceiling/
│   │   ├── safety-security/
│   │   ├── sanitaryware/
│   │   ├── solar-supplies/
│   │   ├── shelving-storage/
│   │   ├── steel-metal-products/
│   │   ├── tiles-flooring/
│   │   └── tools-equipment/
│   └── 📁 platform-media/               ← Wirog brand assets, hero images
│       ├── wirog_logo.webp
│       ├── wirog_logo_icon.webp
│       └── placeholder.webp
│
└── 📁 clients/                           ← ALL CLIENT DATA — BILLED STORAGE
    └── 📁 {businessId}/                  ← e.g. biz-1/, biz-2/, etc.
        │                                    Each client has their OWN folder
        ├── 📁 profile/
        │   ├── 📁 avatar/                ← Profile picture (1 image max)
        │   │   └── avatar.webp
        │   ├── 📁 logo/                  ← Business logo (1 image)
        │   │   └── logo.webp
        │   └── profile_meta.json         ← See schema below
        │
        ├── 📁 catalogue/                 ← All items in their product catalogue
        │   └── 📁 {itemId}/              ← e.g. item_1715000000000/
        │       ├── 📁 images/            ← Up to 10 images per item
        │       │   ├── 001.webp
        │       │   ├── 002.webp
        │       │   └── ...
        │       └── item_meta.json        ← See schema below
        │
        ├── 📁 promos/                    ← Active/past promotional posts
        │   └── 📁 {promoId}/             ← e.g. promo_1715000000001/
        │       ├── 📁 images/            ← Up to 5 images per promo
        │       │   ├── 001.webp
        │       │   ├── 002.webp
        │       │   └── ...
        │       └── promo_meta.json       ← See schema below
        │
        ├── 📁 facebook-submissions/      ← Facebook post requests submitted via app
        │   └── 📁 {submissionId}/
        │       ├── 📁 images/            ← Images to use in the FB post
        │       │   └── 001.webp
        │       └── fb_post_meta.json     ← See schema below
        │
        └── 📁 notes/                     ← Notes/saved quote lists (no images)
            └── notes_meta.json           ← See schema below
```

---

## 📋 Metadata Schemas

Every folder has a companion `_meta.json` file that keeps all searchable data alongside the media.

### `profile_meta.json`
```json
{
  "businessId": "biz-1",
  "name": "Board Kings",
  "category": "Boards & Timber",
  "categories": ["Timber", "Boards", "Postform Tops"],
  "location": "Phakalane (Extension 97), Gaborone",
  "town": "Gaborone",
  "phone": "+267 71234567",
  "email": "boardkings@email.com",
  "initials": "BK",
  "color": "#1a4b8c",
  "public": true,
  "cataloguePublic": true,
  "description": "Suppliers of quality timber and boards",
  "subscription": "full",
  "avatarUrl": "clients/biz-1/profile/avatar/avatar.webp",
  "logoUrl": "clients/biz-1/profile/logo/logo.webp",
  "driveStorageUsedBytes": 0,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-05-10T00:00:00Z"
}
```

### `item_meta.json`
```json
{
  "id": "item_1715000000000",
  "title": "22mm Melamine Board",
  "desc": "High-quality white melamine board, cut to size available",
  "category": "Boards & Timber",
  "categoryPath": ["Boards & Timber", "Boards"],
  "tags": ["melamine", "board", "timber", "cut-to-size", "white", "22mm"],
  "images": [
    "clients/biz-1/catalogue/item_1715000000000/images/001.webp",
    "clients/biz-1/catalogue/item_1715000000000/images/002.webp"
  ],
  "basePrice": 320.00,
  "unit": "sheet",
  "variables": [{ "name": "Delivery", "value": 1, "rate": 50 }],
  "modifiers": {
    "urgency": false, "nightShift": false, "remoteArea": false, "hazard": false
  },
  "tiers": null,
  "discount": null,
  "geofencing": {
    "region": "local",
    "town": "Gaborone",
    "area": "Phakalane",
    "gps": { "lat": "", "lng": "", "radius": 0 }
  },
  "scheduling": {
    "startDate": "2026-05-10T00:00:00Z",
    "endDate": "",
    "days": [
      { "day": "Monday", "from": "09:00", "to": "17:00" },
      { "day": "Tuesday", "from": "09:00", "to": "17:00" }
    ]
  },
  "kpi": { "views": 0, "likes": 0, "interactions": 0, "addedToNotes": 0 },
  "businessId": "biz-1",
  "businessName": "Board Kings",
  "emoji": "🪵",
  "driveStorageUsedBytes": 204800,
  "createdAt": "2026-05-10T08:00:00Z",
  "updatedAt": "2026-05-10T08:00:00Z"
}
```

### `promo_meta.json`
```json
{
  "id": "promo_1715000000001",
  "itemId": "item_1715000000000",
  "title": "22mm Melamine Board — SALE",
  "desc": "Limited time: P320 per sheet, cut to size",
  "category": "Boards & Timber",
  "tags": ["melamine", "sale", "board", "timber", "promo", "Gaborone"],
  "images": [
    "clients/biz-1/promos/promo_1715000000001/images/001.webp"
  ],
  "basePrice": 320.00,
  "unit": "sheet",
  "promo": {
    "active": true,
    "cost": 25.00,
    "days": 3,
    "freePromoUsed": false,
    "submittedAt": "2026-05-10T08:00:00Z",
    "expiresAt": "2026-05-13T08:00:00Z",
    "status": "active"
  },
  "kpi": { "views": 0, "likes": 0, "interactions": 0, "addedToNotes": 0 },
  "geofencing": { "region": "local", "town": "Gaborone" },
  "businessId": "biz-1",
  "businessName": "Board Kings",
  "businessInit": "BK",
  "businessColor": "#1a4b8c",
  "location": "Gaborone",
  "phone": "+267 71234567",
  "driveStorageUsedBytes": 102400,
  "createdAt": "2026-05-10T08:00:00Z"
}
```

### `fb_post_meta.json`
```json
{
  "id": "fb_1715000000002",
  "promoId": "promo_1715000000001",
  "businessId": "biz-1",
  "businessName": "Board Kings",
  "message": "Big Sale on Melamine Boards this week!",
  "title": "22mm Melamine Board — SALE",
  "price": 320.00,
  "unit": "sheet",
  "images": [
    "clients/biz-1/facebook-submissions/fb_1715000000002/images/001.webp"
  ],
  "status": "submitted",
  "submittedAt": "2026-05-10T08:30:00Z",
  "driveStorageUsedBytes": 102400
}
```

### `notes_meta.json`
```json
{
  "userId": "biz-1",
  "notes": [
    {
      "id": "note_1715000001",
      "title": "Saved from Promos",
      "items": [
        {
          "title": "22mm Melamine Board",
          "emoji": "🪵",
          "price": 320.00,
          "unit": "sheet",
          "business": "Board Kings",
          "qty": 2
        }
      ],
      "createdAt": "2026-05-10T09:00:00Z"
    }
  ]
}
```

---

## 💰 Storage Billing Summary

| Folder | Who Pays | Billed to Client |
|---|---|---|
| `clients/{bizId}/profile/avatar/` | Client | ✅ Yes |
| `clients/{bizId}/profile/logo/` | Client | ✅ Yes |
| `clients/{bizId}/catalogue/{itemId}/images/` | Client | ✅ Yes |
| `clients/{bizId}/promos/{promoId}/images/` | Client | ✅ Yes |
| `clients/{bizId}/facebook-submissions/` | Client | ✅ Yes |
| `clients/{bizId}/notes/` | Client | ✅ Yes (minimal) |
| `app-system/category-images/` | Wirog Admin | ❌ No |
| `app-system/icons/` | Wirog Admin | ❌ No |
| `app-system/platform-media/` | Wirog Admin | ❌ No |

---

## 🏷️ How Tags Enable Search & Indexing

Every `_meta.json` stores structured fields. When the app loads from Drive:

1. **Tag search** — `tags[]` array matches keyword searches
2. **Category filter** — `category` + `categoryPath[]` powers the category drill-down
3. **Location filter** — `geofencing.town` + `geofencing.region` powers location-based filtering
4. **Business lookup** — `businessId` + `businessName` links items back to profiles
5. **KPI tracking** — `kpi.views`, `kpi.likes`, `kpi.interactions` stay in the meta and sync back

> The `_meta.json` is the **single source of truth**. The app reads it from Drive, builds an in-memory index, and uses that for all rendering, filtering, and search — no database needed.

---

## 🔁 Sync Flow

```
Client uploads image + fills in item details in App
        ↓
App auto-generates _meta.json with all tags/category/location
        ↓
Image + _meta.json saved to Google Drive → clients/{bizId}/...
        ↓
App reads Drive on load → parses all _meta.json files
        ↓
Builds in-memory index: tags + category + location
        ↓
Promo feed / Catalogue / Directory renders from index
        ↓
Any interaction (view, like, note) updates the meta JSON back to Drive
```
