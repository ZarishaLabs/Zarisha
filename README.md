# Zarisha

Minimal dark frontend for AnimePahe. Search, browse, and stream anime.

![Search](docs/screenshots/search.png)
![Anime detail](docs/screenshots/anime-detail.png)

## Run

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Production:** `npm run build` then `npm start`.

## Deploy to Cloudflare

This app is set up for [OpenNext on Cloudflare](https://opennext.js.org/cloudflare). It deploys as a **Cloudflare Worker** (full-stack Next.js on the edge).

1. **Install deps** (includes `@opennextjs/cloudflare` and `wrangler`):
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Preview locally** (build + run in Workers runtime):
   ```bash
   npm run preview
   ```

3. **Deploy** (requires [Wrangler login](https://developers.cloudflare.com/workers/wrangler/configuration/#login)):
   ```bash
   npm run deploy
   ```

4. **Optional:** Connect your repo in [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Connect Git. Use build command: `npm run deploy` (or a custom build that runs `opennextjs-cloudflare build` and uploads the output).

## Docs

- [APIs & pages](docs/APIS_AND_PAGES.md) — Third-party APIs, internal routes, and all pages

## License

MIT. Unofficial use of AnimePahe; for educational use only.

---

AnimePahe Alternative Frontend · made by danial
