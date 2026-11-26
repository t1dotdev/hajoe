# หาเจอ (hajoe)

Landing page and shop-site generator for หาเจอ, a fixed-price service that sets up Google Maps profiles, LINE OA and one-page websites for Thai small businesses.

## Layout

- `index.html` + `config.js`: the landing page. Contact channels live in `config.js`.
- `template/build.mjs`: generates a static, SEO-ready one-page shop site from a JSON file. No dependencies. Each site includes a LocalBusiness JSON-LD block, a live open/closed status and call/LINE/directions buttons.
- `shops/*.json`: data for each shop site.
- `demo/`: two demo sites built from that data, both for fictional shops.

## Build a shop site

```bash
node template/build.mjs shops/demo-cafe.json demo/cafe
node --test template/      # generator tests
```

Set `"demo": true` for previews and demos. That mode does three things:
- adds `noindex`, so search engines skip the page
- shows a banner saying it is not a live site
- disables the contact buttons

Demo photos are CC0 (Wikimedia Commons and rawpixel, found through Openverse).
