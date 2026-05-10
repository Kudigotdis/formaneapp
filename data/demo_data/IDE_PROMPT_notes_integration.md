# IDE AI Prompt — Integrate `demo_notes.json` into Wirog App

## Context
This prompt is for your AI coding assistant (Cursor, Copilot, etc.).  
Paste it in full. All referenced files already exist in the project.

---

## Task

Integrate the new `demo_notes.json` seed file into the Wirog app so that every demo user's Notes List is pre-populated with realistic project material lists when the app loads in demo/development mode.

---

## Files Involved

| File | Role |
|---|---|
| `demo_notes.json` | New seed data — 52 Notes across 11 users |
| `demo_Businesses.json` | Business lookup (id → name, logo, etc.) |
| `wirog_demo_products.json` | Product catalogue (prices, units, categories) |
| `demo_profiles_json.json` | User profiles (id, role, linkedBusiness) |
| `notes.js` | Existing Notes screen/logic — update this |

---

## Data Structure of `demo_notes.json`

Each note object looks like this:

```json
{
  "id": "note-k-1",
  "userId": "user-kago",
  "title": "Living Room Renovation",
  "thumbnail": null,
  "createdAt": "2025-03-22T10:00:00Z",
  "grandTotal": 12073.00,
  "items": [
    {
      "id": "ki-1",
      "title": "Porcelain Wood-Look Tile 150x900mm (Box/6)",
      "emoji": "🏗️",
      "category": "Tiles & Flooring",
      "supplier": "Tile Express BW",
      "supplierId": "biz-5",
      "price": 530.00,
      "unit": "per box",
      "quantity": 14,
      "lineTotal": 7420.00
    }
    // ... more items
  ]
}
```

**Key fields:**
- `userId` — matches `id` in `demo_profiles_json.json`  
- `supplierId` — matches `id` in `demo_Businesses.json`  
- `grandTotal` — pre-calculated (price × qty summed across all items)  
- `lineTotal` — pre-calculated per item (price × quantity)  
- `emoji` — category icon for display in the list  

---

## What to Build / Change

### 1. Load & Filter Notes by User
In `notes.js` (or your Notes context/store), load `demo_notes.json` and filter by the currently logged-in user's `id`:

```js
import allNotes from '../data/demo_notes.json';

// Get notes for current user
const userNotes = allNotes.notes.filter(note => note.userId === currentUser.id);
```

Place `demo_notes.json` in the same `/data/` folder as the other demo JSON files.

### 2. Display Notes List
Render each note as a card showing:
- `note.title`
- `note.thumbnail` (show a placeholder icon if null)
- Number of items: `note.items.length` items
- Grand total: `P ${note.grandTotal.toLocaleString('en-BW', {minimumFractionDigits: 2})}`
- `note.createdAt` formatted as a readable date

### 3. Note Detail / Line Items
When a note is tapped/opened, display each item in `note.items`:
- `item.emoji` + `item.title`
- `item.supplier` (supplier name)
- `P ${item.price} ${item.unit}`
- Quantity stepper (+ / −) that recalculates `item.lineTotal` and `note.grandTotal` live
- `lineTotal`: `P ${item.lineTotal.toLocaleString(...)}`

Show the running **Grand Total** at the bottom of the list.

### 4. WhatsApp Share
Implement (or wire up the existing) WhatsApp share button that formats the note as a text message:

```
*[Note Title]*
_Wirog Project List_

🏗️ Porcelain Wood-Look Tile 150x900mm (Box/6)
   Tile Express BW | P530.00/per box × 14 = *P7,420.00*

🎨 Dulux Trade Emulsion 20L
   BuildIt Gabs | P494.00/each × 2 = *P988.00*

...

━━━━━━━━━━━━━━
*TOTAL: P12,073.00*
_Quoted via Wirog App_
```

Use `Linking.openURL('whatsapp://send?text=' + encodeURIComponent(message))` or the `react-native-share` equivalent.

### 5. Add / Edit Note Items (Optional — if already built)
If the app already supports adding items to a Note (e.g. from a product card), ensure new items are appended to the correct note by `userId` and `note.id`, and that `grandTotal` is recalculated after every add/remove.

---

## Notes on the Demo Data

- **11 users** have notes: `user-guest`, `user-kago`, `user-thabo`, `user-gerald`, `owner-biz2`, `owner-biz3`, `owner-biz4`, `staff-kudi`, `staff-mark`, `staff-smokey`, `staff-tshepang`
- Each user has **4–6 notes**, each with **4–9 line items**
- Each note spans **3–7 different businesses** (supplierId)
- Notes are tailored to each user's role and interests (e.g. Thabo the electrician has solar and wiring notes; Kago has renovation and décor notes)
- `grandTotal` and `lineTotal` are pre-computed but should be **recalculated live** when users change quantities in-app

---

## Do Not Change
- The existing note creation / save flow for real users
- Any Firebase / AsyncStorage / Supabase persistence layer already in place
- The `notes.js` UI structure — only extend it, do not refactor

---

## Summary Checklist

- [ ] Copy `demo_notes.json` into the `/data/` directory  
- [ ] Import and filter notes by `currentUser.id` in `notes.js`  
- [ ] Render Notes List with title, item count, grand total  
- [ ] Render Note Detail with line items, quantity stepper, live totals  
- [ ] Wire up WhatsApp share with formatted message  
- [ ] Test with at least 3 different demo user accounts  
