# Sync Protocol Spec — Wirog Offline Sync

## Goals
- Reliable, idempotent sync from device -> server for promos, items, notes, and business updates.
- Minimal payloads and clear conflict resolution strategy.

## Endpoints (suggested)
- POST /sync/commit
  - Body: { type: "promos|items|notes|business", payload: {...}, meta: { clientId, createdAt } }
  - Headers: `Idempotency-Key: <client-generated-id>`
  - Response: 200 OK { status: "accepted", serverId: "srv_...", mergedAt: "..." }
  - 409 for conflict with body { status:"conflict", serverEntity: {...}, resolutionHints: {...} }

- POST /sync/ack
  - Body: { idempotencyKey }

## Payload shape examples
- Promo submission
  {
    type: "promos",
    payload: {
      id: "sq_...", // client idempotency key
      businessId: "biz_user",
      title: "Meranti Planks 22x144mm",
      category: "Boards & Timber",
      basePrice: 85,
      unit: "per meter",
      images: ["data:image/webp;base64,..."],
      promo: { days: 3, region: "local", cost: 0 }
    },
    meta: { clientId: "user-123", createdAt: "..." }
  }

## Idempotency & Deduplication
- Clients MUST set `Idempotency-Key` header to the queue item `id`.
- Server should dedupe by `Idempotency-Key` and return existing server id when duplicate.

## Conflict Resolution Strategy
- For single-resource submissions (new promos, notes, items): server accepts the first successful create and returns `serverId`.
- For updates to existing server-side entities: server performs simple "last-writer-wins" based on `meta.updatedAt` unless resource includes `clientVersion`/`serverVersion` fields — in which case server returns 409 with both versions and client must prompt user for merge.

## Retries & Backoff
- Clients should retry on network errors and 5xx responses with exponential backoff (base 2s, max ~5 attempts).
- On 4xx (except 429) the client should surface an error and remove or quarantine the item.

## Security
- All endpoints require authentication (Bearer token). For early testing, accept a test API key header `X-Api-Key: test_local`.
- Validate uploaded images and restrict max size (e.g., 2.5MB per image) server-side.

## Response examples
- Success: 200 { status: "ok", serverId: "promo_123", mergedAt: "2026-05-10T12:00:00Z" }
- Conflict: 409 { status: "conflict", serverEntity: {...}, message: "Conflict on price" }
- Bad request: 400 { status: "error", code: "invalid_payload" }

## Notes for backend implementer
- Provide an `acceptIfNew(idempotencyKey)` helper to dedupe and create server entity atomically.
- Support bulk commit endpoint in future to speed up flushes.

