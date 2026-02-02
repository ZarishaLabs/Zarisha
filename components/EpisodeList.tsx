'use client';

import Link from 'next/link';
import type { Episode } from '@/lib/api/api-types';

interface EpisodeListProps {
  episodes: Episode[];
  animeId: string;
  currentEpisode?: number;
}

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export default function EpisodeList({
  episodes,
  animeId,
  currentEpisode,
}: EpisodeListProps) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-text-secondary text-body-secondary">No episodes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-section-header uppercase tracking-[2px]">
        Episodes ({episodes.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {episodes.map((episode) => {
          const isActive = currentEpisode === episode.episode;
          const isWatched = false; // TODO: Implement watch status tracking

          return (
            <Link
              key={episode.id}
              href={`/play/${animeId}/${episode.episode}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                card p-4 hover:border-accent/30 transition-all duration-300
                ${isActive ? 'border-accent bg-accent/5' : ''}
                ${isWatched ? 'opacity-60' : ''}
                group relative overflow-hidden
              `}
            >
              {/* Episode Number */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-strong font-bold font-mono">
                  {episode.episode}
                </span>
                {isWatched && (
                  <div className="text-success">
                    <CheckIcon />
                  </div>
                )}
              </div>

              {/* Episode Title */}
              {episode.title && (
                <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                  {episode.title}
                </p>
              )}

              {/* Thumbnail (if available) */}
              {episode.snapshot && (
                <div className="aspect-video bg-surface rounded-lg overflow-hidden mb-3">
                  <img
                    src={episode.snapshot}
                    alt={`Episode ${episode.episode}`}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              )}

              {/* Play Button */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
                  <PlayIcon />
                  <span>{isActive ? 'Playing' : 'Play'}</span>
                </div>
              </div>

              {/* Filler Badge */}
              {episode.filler && (
                <div className="absolute top-2 right-2 bg-warning text-background text-xs px-2 py-1 rounded-full font-bold">
                  FILLER
                </div>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
