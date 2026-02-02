'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import { getAnimeDetails, getEpisodeSource } from '@/lib/api/anime-api';
import type { AnimeDetails, EpisodeStreamData } from '@/lib/api/api-types';
import { getUserFriendlyMessage } from '@/lib/utils/error-handler';
import type { ApiError } from '@/lib/utils/error-handler';

interface Props {
  params: Promise<{
    animeId: string;
    episodeId: string;
  }>;
}

export default function PlayPage({ params }: Props) {
  const { animeId, episodeId } = use(params);
  const router = useRouter();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [streamData, setStreamData] = useState<EpisodeStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const episodeNumber = parseInt(episodeId, 10);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const animeData = await getAnimeDetails(animeId);
        setAnime(animeData);

        try {
          const episodeData = await getEpisodeSource(animeId, episodeNumber);
          setStreamData(episodeData);
        } catch (epErr) {
          const apiError = epErr as ApiError;
          setError(getUserFriendlyMessage(apiError));
          setStreamData(null);
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(getUserFriendlyMessage(apiError));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [animeId, episodeNumber]);

  const handleNextEpisode = () => {
    if (!anime) return;
    const nextEp = episodeNumber + 1;
    if (nextEp <= anime.episodes) {
      router.push(`/play/${animeId}/${nextEp}`);
    }
  };

  const handlePreviousEpisode = () => {
    const prevEp = episodeNumber - 1;
    if (prevEp >= 1) {
      router.push(`/play/${animeId}/${prevEp}`);
    }
  };

  const handleEpisodeEnd = () => {
    handleNextEpisode();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="aspect-video bg-surface rounded-card animate-pulse" />
        <div className="h-24 bg-surface rounded-card animate-pulse" />
      </div>
    );
  }

  if (error || !anime || !streamData) {
    const episodeSession = anime?.episodes_list?.find(
      (ep) => ep.episode === episodeNumber
    )?.session;

    return (
      <div className="card p-8 text-center">
        <div className="text-error text-6xl mb-4">⚠</div>
        <h2 className="text-2xl font-black mb-2">Error Loading Episode</h2>
        <p className="text-text-secondary mb-8">
          {error || "Failed to load episode data"}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {episodeSession && (
            <button
              onClick={() =>
                window.open(
                  `https://animepahe.si/play/${episodeSession}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              className="button-main px-6 py-3 sm:px-8 sm:py-4"
            >
              WATCH ON ANIMEPAHE
            </button>
          )}
          <Link href={`/anime/${animeId}`} className="button-secondary px-6 py-3 sm:px-8 sm:py-4 inline-block">
            BACK TO ANIME
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="button-secondary px-6 py-3 sm:px-8 sm:py-4"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }
  const streamUrl = streamData.direct_links?.[0]?.url || 
                    streamData.streams?.[0]?.url ||
                    '';

  if (!streamUrl) {
    const episodeSession = anime?.episodes_list?.find(
      (ep) => ep.episode === episodeNumber
    )?.session;

    return (
      <div className="card p-8 text-center">
        <div className="text-warning text-6xl mb-4">⚠</div>
        <h2 className="text-2xl font-black mb-2">No Stream Available</h2>
        <p className="text-text-secondary mb-8">
          No streaming sources found for this episode. Try another episode or
          watch on AnimePahe.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          {episodeSession && (
            <button
              onClick={() =>
                window.open(
                  `https://animepahe.si/play/${episodeSession}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              className="button-main px-6 py-3 sm:px-8 sm:py-4"
            >
              WATCH ON ANIMEPAHE
            </button>
          )}
          <Link href={`/anime/${animeId}`} className="button-secondary px-6 py-3 sm:px-8 sm:py-4 inline-block">
            BACK TO ANIME
          </Link>
        </div>
      </div>
    );
  }

  const hasNext = episodeNumber < anime.episodes;
  const hasPrevious = episodeNumber > 1;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/anime/${animeId}`}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm uppercase tracking-wider"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Anime
        </Link>

        <div className="text-sm text-text-secondary font-mono">
          Episode {episodeNumber} / {anime.episodes}
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer
        src={streamUrl}
        poster={anime.poster}
        onEnded={handleEpisodeEnd}
        onNext={hasNext ? handleNextEpisode : undefined}
        onPrevious={hasPrevious ? handlePreviousEpisode : undefined}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />

      {/* Episode Info */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-black mb-2">
              {anime.title}
            </h1>
            <p className="text-text-secondary text-body-secondary mb-4">
              Episode {episodeNumber}
              {streamData.title && `: ${streamData.title}`}
            </p>

            {/* Quality Info */}
            {streamData.direct_links && streamData.direct_links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {streamData.direct_links.map((stream, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs bg-surface border border-divider rounded-full font-mono"
                  >
                    {stream.quality}
                    {stream.size && ` • ${stream.size}`}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            {hasPrevious && (
              <button
                onClick={handlePreviousEpisode}
                className="button-secondary px-4 py-2"
              >
                ← PREVIOUS
              </button>
            )}
            {hasNext && (
              <button
                onClick={handleNextEpisode}
                className="button-main px-4 py-2"
              >
                NEXT →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Episode List Preview */}
      {anime.episodes_list && anime.episodes_list.length > 0 && (
        <div className="card p-6">
          <h3 className="text-section-header uppercase tracking-[2px] mb-4">
            All Episodes
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2">
            {anime.episodes_list.slice(0, 30).map((ep) => (
              <Link
                key={ep.id}
                href={`/play/${animeId}/${ep.episode}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  aspect-square rounded-lg border-2 flex items-center justify-center
                  font-mono font-bold text-sm transition-all
                  ${ep.episode === episodeNumber 
                    ? 'bg-accent text-background border-accent' 
                    : 'bg-surface border-divider hover:border-accent/50'
                  }
                `}
              >
                {ep.episode}
              </Link>
            ))}
            {anime.episodes_list.length > 30 && (
              <Link
                href={`/anime/${animeId}`}
                className="aspect-square rounded-lg border-2 border-divider bg-surface flex items-center justify-center text-xs hover:border-accent/50 transition-colors"
              >
                +{anime.episodes_list.length - 30}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
