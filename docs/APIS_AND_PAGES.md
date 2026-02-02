# APIs & Pages

## Third-party APIs & External Services

All external calls go through Next.js API routes under `/api/proxy/*`. The frontend never calls third-party URLs directly.

---

### 1. AnimePahe (via Consumet + direct)

**What:** Anime catalog, metadata, episode list, and streaming links.

**Library:** `@consumet/extensions` — `AnimePahe` provider.

**Endpoints used:**

| Purpose | Method | URL / Behavior |
|--------|--------|----------------|
| Search | GET | Consumet `animepahe.search(query)` or direct `https://animepahe.si/api?m=search&q=...&page=...` |
| Anime info | GET | Consumet `animepahe.fetchAnimeInfo(id)` or direct scrape below |
| Episode sources | GET | Consumet `animepahe.fetchEpisodeSources(episodeId)` or fallback scrape |

**Direct scrape fallbacks (when Consumet fails):**

- **Episodes:** `GET https://animepahe.si/api?m=release&id={id}&sort=episode_asc&page=1`  
  Headers: `User-Agent`, `X-Requested-With: XMLHttpRequest`, `Referer: https://animepahe.si/`
- **Anime page:** `GET https://animepahe.si/a/{id}`  
  HTML parsed with Cheerio for title, poster, synopsis, genres, etc.
- **Play page:** `GET https://animepahe.si/play/{animeId}/{session}`  
  HTML parsed for `#resolutionMenu` buttons; each `data-src` is a Kwik URL.

**How to use (from app):** Call internal proxy routes; see “Internal API routes” below.

---

### 2. Kwik (stream URLs)

**What:** Host that serves the actual HLS (`.m3u8`) stream URLs. AnimePahe play page links to Kwik; we resolve the Kwik page to get the stream URL.

**Used in:** `/api/proxy/get_episode/[animeId]/[episodeNumber]` and `lib/extractors/kwik-fallback.ts`.

**Flow:**  
1. Get Kwik URL from AnimePahe play page (`data-src` on resolution buttons).  
2. Fetch Kwik page HTML (or use FlareSolverr if set).  
3. Parse HTML (regex / `safeUnpack` from Consumet) to extract `.m3u8` URL.

**Optional – FlareSolverr (bypass Cloudflare on Kwik):**

- Env: `FLARESOLVERR_URL` (e.g. `http://localhost:8191`).
- Request: `POST {FLARESOLVERR_URL}/v1` with body:
  ```json
  { "cmd": "request.get", "url": "<kwik_url>", "maxTimeout": 30000 }
  ```
- Use `solution.response` as HTML for parsing.

**How to use:** No direct call from frontend. Set `FLARESOLVERR_URL` only if episode playback fails with Cloudflare/Kwik errors.

---

### 3. AniList (extras)

**What:** Trailers, characters, recommendations, and external links for anime.

**Library:** `@consumet/extensions` — `Anilist` provider.

**Used in:** `/api/proxy/extras/[query]`.

**Flow:**  
1. `anilist.search(query)` → pick first result.  
2. `anilist.fetchAnimeInfo(bestMatch.id)` → return trailer, characters, recommendations, mappings.

**How to use:**  
- `GET /api/proxy/extras/{query}`  
- `query` = anime title (e.g. URL-encoded).  
- Response: `{ trailer, characters, recommendations, links }`.

---

### 4. Image proxy

**What:** Fetches images (posters, thumbnails) from AnimePahe (or any `url`) to avoid CORS and to cache.

**Used in:** `/api/proxy/image`.

**How to use:**  
- `GET /api/proxy/image?url={encoded_image_url}`  
- Example: `url=https://animepahe.si/.../poster.jpg`  
- Returns the image binary with appropriate `Content-Type` and long cache headers.

---

## Internal API routes (how the frontend uses them)

| Route | Method | Query / Params | Purpose |
|-------|--------|----------------|---------|
| `/api/proxy/search` | GET | `query`, `page`, `limit` | Search anime (AnimePahe). |
| `/api/proxy/airing` | GET | — | “Explore” popular/airing list (AnimePahe searches). |
| `/api/proxy/get_full_data/[id]` | GET | `id` (path) | Full anime details + episode list (AnimePahe ± scrape). |
| `/api/proxy/get_episode/[animeId]/[episodeNumber]` | GET | path | Episode streaming sources (HLS/m3u8) (AnimePahe + Kwik). |
| `/api/proxy/extras/[query]` | GET | `query` (path) | Trailers, characters, recommendations (AniList). |
| `/api/proxy/image` | GET | `url` | Proxy image from `url`. |

**Client usage:**  
- `lib/api/anime-api.ts`: `searchAnime()`, `getAnimeDetails()`, `getEpisodeSource()` call the above via `apiClient` (relative paths like `/api/proxy/...`).  
- Explore page: `fetch('/api/proxy/airing?page=1')`.  
- Extras: `fetch('/api/proxy/extras/...')` (e.g. in `AnimeExtras.tsx`).  
- Images: poster/snapshot URLs are rewritten to `/api/proxy/image?url=...` by the proxy routes.

---

## Pages & info

| Route | Type | Description |
|-------|------|-------------|
| `/` | Home | Search entry; redirects `?q=...` to `/search/[query]`. |
| `/search/[query]` | Search | Search results grid. Params: `query` (path), `page`, `limit`, `type`, `year`, `sort`. Uses `searchAnime()` → `/api/proxy/search`. |
| `/explore` | Explore | “Airing” / popular list. Fetches `/api/proxy/airing`. |
| `/anime/[id]` | Anime detail | Title, synopsis, genres, type, status, year, poster, episode list. Uses `getAnimeDetails(id)` → `/api/proxy/get_full_data/[id]`. Optional extras (trailer, characters, recommendations) via `/api/proxy/extras/[query]`. |
| `/play/[animeId]/[episodeId]` | Player | HLS player for one episode. Uses `getAnimeDetails(animeId)` and `getEpisodeSource(animeId, episodeNumber)` → `/api/proxy/get_episode/...`. |

**Navigation:**  
- Header: “ZARISHA” (logo), “Search” → `/`, “Explore” → `/explore`.  
- Anime detail: “BACK TO BROWSE” → `/` (or previous).  
- Episode cards: “PLAY” → `/play/[animeId]/[episodeId]`.  
- Player: back to anime detail, next/prev episode.

**Data flow:**  
- All anime/metadata and stream URLs come from the proxy routes above.  
- Images are loaded via `/api/proxy/image?url=...`.  
- No API keys; optional env: `FLARESOLVERR_URL` for Kwik when needed.
