import { NextRequest, NextResponse } from "next/server";
import AnimePahe from "@consumet/extensions/dist/providers/anime/animepahe";
import { cache, generateCacheKey } from "@/lib/utils/cache";

export const dynamic = "force-dynamic";

// ANIME ONLY LIST (title and imdb):

// Akira - https://www.imdb.com/title/tt0094625/
// Grave of the Fireflies - https://www.imdb.com/title/tt0095327/
// Ghost in the Shell - https://www.imdb.com/title/tt0113568/
// Neon Genesis Evangelion: The End of Evangelion - https://www.imdb.com/title/tt0169858/
// Spirited Away - https://www.imdb.com/title/tt0245429/
// Cowboy Bebop: The Movie - https://www.imdb.com/title/tt0275277/
// A Silent Voice: The Movie - https://www.imdb.com/title/tt5323662/
// Your Name - https://www.imdb.com/title/tt5311514/
// Penguin Highway - https://www.imdb.com/title/tt8076344/

const POPULAR_SEARCHES = [
  {
    title: "akira",
    imdb: "https://www.imdb.com/title/tt0094625/",
  },
  {
    title: "grave of the fireflies",
    imdb: "https://www.imdb.com/title/tt0095327/",
  },
  {
    title: "ghost in the shell 1995",
    imdb: "https://www.imdb.com/title/tt0113568/",
  },
  {
    title: "neon genesis evangelion the end of evangelion",
    imdb: "https://www.imdb.com/title/tt0169858/",
  },
  {
    title: "spirited away",
    imdb: "https://www.imdb.com/title/tt0245429/",
  },
  {
    title: "cowboy bebop the movie",
    imdb: "https://www.imdb.com/title/tt0275277/",
  },
  {
    title: "a silent voice",
    imdb: "https://www.imdb.com/title/tt5323662/",
  },
  {
    title: "your name",
    imdb: "https://www.imdb.com/title/tt5311514/",
  },
  {
    title: "penguin highway",
    imdb: "https://www.imdb.com/title/tt8076344/",
  },
];

export async function GET(_request: NextRequest) {
  const cacheKey = generateCacheKey("proxy_popular", "v1");
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const animepahe = new AnimePahe();
    const allResults: any[] = [];
    const seenIds = new Set<string>();
    for (const term of POPULAR_SEARCHES) {
      try {
        const searchResults = await animepahe.search(term.title);
        for (const item of searchResults.results || []) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            allResults.push({
              id: item.id,
              title: item.title,
              type: item.type || "TV",
              episodes: item.episodes || 0,
              status: item.status || "Unknown",
              year: item.releaseDate ? parseInt(item.releaseDate) : 0,
              score: item.rating ? String(item.rating) : undefined,
              poster: item.image
                ? `/api/proxy/image?url=${encodeURIComponent(item.image)}`
                : "",
              session: item.id,
            });
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.error("Error fetching popular anime:", e);
        continue;
      }
    }
    const sortedResults = allResults
      .sort((a, b) => {
        const scoreA = a.score ? parseFloat(a.score) : 0;
        const scoreB = b.score ? parseFloat(b.score) : 0;
        return scoreB - scoreA;
      })
      .slice(0, 30);

    const response = {
      total: sortedResults.length,
      last_page: 1,
      current_page: 1,
      per_page: sortedResults.length,
      data: sortedResults,
    };
    cache.set(cacheKey, response, 3600000);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Popular API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular anime" },
      { status: 500 },
    );
  }
}
