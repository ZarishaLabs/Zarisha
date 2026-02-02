import { Anime } from '@/lib/types'

interface AnimeCardProps {
  anime: Anime
}

const StarIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const PlayCircleIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const HashIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
)

export default function AnimeCard({ anime }: AnimeCardProps) {
  const animeUrl = `/anime/${anime.animepaheId || anime.id}`;

  return (
    <a
      href={animeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="card group hover:border-accent/20 transition-all duration-300 block cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-t-card">
        {/* Poster image */}
        <div className="aspect-[3/4] bg-surface flex items-center justify-center">
          {anime.poster ? (
            <img 
              src={anime.poster} 
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-divider to-surface flex items-center justify-center">
              <PlayCircleIcon />
            </div>
          )}
          {/* Score badge */}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
            <StarIcon />
            <span className="font-mono text-sm font-bold">{anime.score.toFixed(2)}</span>
          </div>
          {/* Type badge */}
          <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full">
            <span className="text-status-label uppercase tracking-[1.2px]">{anime.type}</span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-body-strong font-semibold line-clamp-1">{anime.title}</h4>
          {anime.englishTitle && (
            <p className="text-body-secondary text-text-secondary line-clamp-1">{anime.englishTitle}</p>
          )}
        </div>
        <div className="flex items-center justify-between text-body-secondary">
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <span>{anime.year}</span>
            {anime.season && <span className="text-success">{anime.season}</span>}
          </div>
          <div className="flex items-center gap-2">
            <HashIcon />
            <span>{anime.episodes} eps</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {anime.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs border border-divider rounded-full text-text-secondary"
            >
              {genre}
            </span>
          ))}
          {anime.genres.length > 3 && (
            <span className="px-2 py-1 text-xs text-text-secondary">+{anime.genres.length - 3}</span>
          )}
        </div>
        <p className="text-body-secondary line-clamp-2">{anime.description}</p>
      </div>
    </a>
  )
}