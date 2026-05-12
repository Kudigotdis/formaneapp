# 📁 Wirog App — Google Drive Master Structure

> **Billing principle:** Every file under `users/`, `pros/`, or `businesses/` counts toward that client's storage quota.
> Files under `app-system/` are admin/platform assets — not billed to clients.

---

## Root: `Wirog App Drive/`

```
Wirog App Drive/
│
├── 📁 app-system/                          ← ADMIN ONLY — not billed to clients
│   ├── 📁 icons/                           ← App UI icons
│   │   ├── solid/
│   │   └── brands/
│   ├── 📁 category-images/                 ← 27 category example image folders
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
│   └── 📁 platform-media/                  ← Wirog brand assets, hero images
│
└── 📁 clients/                              ← ALL CLIENT DATA — BILLED STORAGE
    │
    ├── 📁 users/                             ← Subscribers (Regular Users)
    │   └── 📁 user_{id}/
    │       ├── 📁 profile_picture/
    │       │   ├── avatar.webp
    │       │   └── cover.webp
    │       ├── 📁 notes/
    │       │   └── note_{noteId}.webp
    │       ├── 📁 documents/
    │       │   ├── id_scan.pdf
    │       │   └── receipt_{txnId}.webp
    │       ├── 📄 liked_promos.json
    │       ├── 📄 favourite_suppliers.json
    │       ├── 📄 notes_index.json
    │       ├── 📄 kpi_cache.json
    │       └── 📄 subscription.json
    │
    ├── 📁 pros/                              ← Individual Service Providers
    │   └── 📁 pro_{userId}/
    │       ├── 📁 portfolio/
    │       │   └── work_{n}.webp
    │       ├── 📁 promos/
    │       │   └── 📁 promo_{promoId}/
    │       │       ├── image.webp
    │       │       └── video.mp4
    │       ├── 📁 catalogue/
    │       │   └── item_{itemId}.webp
    │       ├── 📁 cover_photo/
    │       │   └── banner.webp
    │       ├── 📁 documents/
    │       │   ├── certification.pdf
    │       │   └── portfolio.pdf
    │       ├── 📁 staff/
    │       │   └── staff_{staffId}.webp
    │       ├── 📁 reviews/
    │       │   └── review_{reviewId}.webp
    │       └── 📄 profile.json
    │
    └── 📁 businesses/                        ← Companies
        └── 📁 biz_{businessId}/
            ├── 📁 logo/
            │   ├── logo.webp
            │   └── icon.webp
            ├── 📁 profile/
            │   └── gallery_{n}.webp
            ├── 📁 promos/
            │   └── 📁 promo_{promoId}/
            │       ├── image.webp
            │       └── video.mp4
            ├── 📁 catalogue/
            │   └── 📁 item_{itemId}/
            │       ├── main.webp
            │       └── alt_{n}.webp
            ├── 📁 cover_photo/
            │   └── banner.webp
            ├── 📁 staff/
            │   └── staff_{staffId}.webp
            ├── 📁 documents/
            │   ├── registration.pdf
            │   ├── tax_clearance.pdf
            │   └── bqa_cert.pdf
            ├── 📁 reviews/
            │   └── review_{reviewId}.webp
            └── 📄 business_profile.json
```

### Tier rules

| Tier | Folder Scope | Drive Footprint |
|---|---|---|
| **Browser** | None | Zero |
| **Subscriber** | `users/user_{id}/` | Profile pic, notes, JSON files |
| **Pro** | `users/user_{id}/` + `pros/pro_{userId}/` | Subscriber data + portfolio, promos, catalogue, reviews |
| **Business** | `users/user_{id}/` (owner) + `businesses/biz_{businessId}/` | Owner data + logo, promos, catalogue, staff, documents |

---

## 📋 Metadata file schemas

### `subscription.json` (in user folder)
```json
{
  "tier": "subscriber",
  "active": true,
  "plan": "directory",
  "startDate": "2026-05-01T00:00:00Z",
  "expiryDate": "2027-05-01T00:00:00Z",
  "paymentHistory": [
    { "date": "2026-05-01", "amount": 300, "method": "btc_smega", "txnId": "TXN001" }
  ]
}
```

### `liked_promos.json` (in user folder)
```json
["promo_1715000000001", "promo_1715000000003"]
```

### `favourite_suppliers.json` (in user folder)
```json
["biz-1", "biz-5", "biz-12"]
```

### `notes_index.json` (in user folder)
```json
[
  { "id": "note_1715000001", "title": "Saved from Promos", "thumbnail": "notes/note_1715000001.webp", "createdAt": "2026-05-10T09:00:00Z" }
]
```

### `kpi_cache.json` (in user folder)
```json
{ "viewsToday": 12, "viewsWeek": 89, "viewsMonth": 340, "likesToday": 2, "lastSynced": "2026-05-10T12:00:00Z" }
```

### `profile.json` (in pro folder)
```json
{
  "proId": "pro_user-123",
  "name": "Kago Setlhare",
  "serviceArea": "Gaborone",
  "pricing": "P250/hr",
  "availability": "Mon-Fri 8am-5pm",
  "phone": "+267 71234567",
  "email": "kago@email.com"
}
```

### `business_profile.json` (in business folder)
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
  "description": "Suppliers of quality timber and boards",
  "subscription": "full",
  "hours": { "Mon-Fri": "8:00-17:00", "Sat": "9:00-13:00" },
  "social": { "facebook": "boardkingsbw", "instagram": "boardkings" }
}
```

---

## 🔁 Sync flow (online / offline)

```
[OFFLINE]
User creates/edits data in app
    ↓
Data saved to IndexedDB (instant, no network)
    ↓
Mutation queued in SyncQueue (wirog-sync IndexedDB store)

[ONLINE — auto-detected]
window 'online' event fires
    ↓
SyncQueue.flush() iterates queued items
    ↓
DriveAPI.writeJSON() / DriveAPI.uploadFile() → Google Drive
    ↓
Item removed from SyncQueue on success

[APP BOOT — first load]
IndexedDB empty → DriveAPI.syncFromDrive() → download all JSON files
    ↓
Save to IndexedDB → render UI

[APP BOOT — returning visit]
IndexedDB has data → render instantly (instant UI)
    ↓
Background: DriveAPI.syncFromDrive() → pull latest changes → update IndexedDB
```

---

## 💰 Storage billing summary

| Folder | Who Pays | Billed to Client |
|---|---|---|
| `clients/users/user_{id}/profile_picture/` | Subscriber | ✅ Yes |
| `clients/users/user_{id}/notes/` | Subscriber | ✅ Yes |
| `clients/users/user_{id}/documents/` | Subscriber | ✅ Yes |
| `clients/pros/pro_{userId}/portfolio/` | Pro | ✅ Yes |
| `clients/pros/pro_{userId}/promos/` | Pro | ✅ Yes |
| `clients/pros/pro_{userId}/catalogue/` | Pro | ✅ Yes |
| `clients/businesses/biz_{id}/logo/` | Business | ✅ Yes |
| `clients/businesses/biz_{id}/profile/` | Business | ✅ Yes |
| `clients/businesses/biz_{id}/promos/` | Business | ✅ Yes |
| `clients/businesses/biz_{id}/catalogue/` | Business | ✅ Yes |
| `clients/businesses/biz_{id}/documents/` | Business | ✅ Yes |
| `app-system/` | Wirog Admin | ❌ No |
