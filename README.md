# หาเจอ (hajoe)

Landing page and shop-site generator for หาเจอ, a fixed-price service that sets up Google Maps profiles, LINE OA and one-page websites for Thai small businesses.

## Layout

- `src/`: the landing page, a TanStack Start app (React, Tailwind v4, shadcn/ui base-luma components). Contact channels live in `src/config.ts`.
- `public/`: served as-is. `public/demo/` holds the two demo shop sites; client sites go in `public/s/<slug>/` and previews in `public/p/<id>/`.
- `template/build.mjs`: generates a static, SEO-ready one-page shop site from a JSON file. No dependencies. Each site includes a LocalBusiness JSON-LD block, a live open/closed status and call/LINE/directions buttons.
- `shops/*.json`: data for each shop site.

## Develop

```bash
bun install
bun run dev        # http://localhost:3000
bun run test       # generator + contact-link tests
bun run check      # biome + tsc
bun run build && bun run start
```

Deployed on Dokploy from the `Dockerfile` (Node, port 3000); every push to `main` redeploys.

## Build a shop site

```bash
node template/build.mjs shops/demo-cafe.json public/demo/cafe
```

Set `"demo": true` for previews and demos. That mode does three things:
- adds `noindex`, so search engines skip the page
- shows a banner saying it is not a live site
- disables the contact buttons

Demo photos are CC0 (Wikimedia Commons and rawpixel, found through Openverse).
