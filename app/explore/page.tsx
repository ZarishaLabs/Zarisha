'use client';

import { useState, useEffect } from 'react';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface AiringAnime {
  id: string;
  title: string;
  type: string;
  episodes: number;
  status: string;
  score?: string;
  poster: string;
  session: string;
  episodeNumber: number;
  fansub?: string;
  createdAt?: string;
}

interface AiringResponse {
  total: number;
  last_page: number;
  current_page: number;
  per_page: number;
  data: AiringAnime[];
}

export default function ExplorePage() {
  const [animeList, setAnimeList] = useState<AiringAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAiring() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/proxy/airing?page=1');
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data: AiringResponse = await res.json();
        const uniqueAnime = data.data.reduce((acc: AiringAnime[], item) => {
          if (!acc.find(a => a.session === item.session)) {
            acc.push(item);
          }
          return acc;
        }, []);
        setAnimeList(uniqueAnime);
      } catch (err) {
        console.error('Error fetching airing anime:', err);
        setError('Failed to load anime. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchAiring();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[3px]">
              Explore
            </h1>
            <p className="text-text-secondary mt-2">Discover cool anime</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-section-header uppercase tracking-[2px]">
            My Favorite Anime
          </h2>
        </div>

        {error && (
          <div className="card p-8 text-center">
            <div className="text-error text-4xl mb-4">⚠</div>
            <p className="text-text-secondary">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="button-secondary px-6 mt-4"
            >
              RETRY
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(animeList.length)].map((_, i) => (
              <LoadingSkeleton key={i} type="card" />
            ))}
          </div>
        )}

        {!loading && !error && animeList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {animeList.map((anime, index) => (
              <a
                key={anime.session}
                href={`/anime/${anime.session}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative card overflow-hidden hover:border-accent/30 transition-all duration-300"
              >
                {/* Rank Badge */}
                <div className="absolute top-2 left-2 z-10 w-8 h-8 bg-background/90 backdrop-blur rounded-full flex items-center justify-center border border-divider">
                  <span className="text-sm font-bold text-accent">
                    #{index + 1}
                  </span>
                </div>

                {/* Poster */}
                <div className="aspect-[3/4] bg-surface">
                  {anime.poster ? (
                    <img
                      src={anime.poster}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-divider to-surface flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}
                </div>

                {/* Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/90 to-transparent p-3 pt-8">
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-text-secondary">
                    <span className="text-status-label uppercase">
                      {anime.type}
                    </span>
                    {anime.episodeNumber > 0 && (
                      <>
                        <span>•</span>
                        <span>EP {anime.episodeNumber}</span>
                      </>
                    )}
                    {anime.score && (
                      <>
                        <span>•</span>
                        <span className="text-accent">★ {anime.score}</span>
                      </>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && !error && animeList.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-2xl font-black mb-2">No Anime Found</h3>
            <p className="text-text-secondary">
              Check back later for new releases
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
