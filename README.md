# หาเจอ (hajoe)

Landing page and shop-page platform for หาเจอ, a fixed-price service that sets up Google Maps profiles, LINE OA and one-page websites for Thai small businesses.

## What's here

- `/` landing page. Contact channels and the launch promo live in `src/config.ts`.
- `/s/<shop>` public shop page, rendered from Postgres: hero, live open/closed status, call/LINE/directions, menu, gallery, hours, map, LocalBusiness JSON-LD. `"demo": true` shops get `noindex`, a banner and disabled buttons.
- `/m/<shop>?k=<owner token>` owner page: 30-day stats (views and taps on call/LINE/directions) and an editor for info, hours, menu, photos and colour. The token is hashed in the DB; reset it from admin.
- `/admin?k=<ADMIN_TOKEN>` operator page: list shops, create one from JSON (`shops/*.json` format), reset owner links. Off unless `ADMIN_TOKEN` is set.
- `/api/hit` counts views and taps (daily counters, no IPs or cookies); `/api/upload` takes owner photos (sniffed, max 3 MB); `/u/*` serves them.

Code: `src/lib/shop.ts` (data model, validation, open status, JSON-LD), `src/lib/stats.ts`, `src/db/` (Drizzle schema, migrations run on first request, demo shops seeded), `src/server/` (server functions, tokens, uploads).

## Develop

```bash
bun install
createdb hajoe
printf 'DATABASE_URL=postgres://localhost/hajoe\nADMIN_TOKEN=dev-admin\nUPLOAD_DIR=.data/uploads\n' > .env
bun run dev          # http://localhost:3000, admin at /admin?k=dev-admin
bun run test         # domain, stats, upload tests
bun run check        # biome + tsc
bun run db:generate  # after changing src/db/schema.ts
```

## Deploy

Dokploy builds the `Dockerfile` (Node, port 3000) on every push to `main`. The app needs:
- `DATABASE_URL`: the HAJOE Postgres service
- `ADMIN_TOKEN`: a long random string
- a volume mounted at `/data` for uploaded photos

Demo photos are CC0 (Wikimedia Commons and rawpixel, found through Openverse).
