import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAnimeDetails } from '@/lib/api/anime-api';
import EpisodeList from '@/components/EpisodeList';
import AnimeExtras from '@/components/AnimeExtras';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const anime = await getAnimeDetails(id);
    
    return {
      title: `${anime.title} - AnimePahe Alternative`,
      description: anime.synopsis || `Watch ${anime.title} on AnimePahe Alternative`,
      openGraph: {
        title: anime.title,
        description: anime.synopsis || '',
        images: anime.poster ? [anime.poster] : [],
      },
    };
  } catch {
    return {
      title: 'Anime Not Found',
    };
  }
}

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;
  let anime;
  
  try {
    anime = await getAnimeDetails(id);
  } catch (error) {
    console.error('Failed to fetch anime details:', error);
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="relative z-10">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors text-sm uppercase tracking-wider mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Browse
      </Link>
      </div>

      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Poster */}
        <div className="md:col-span-1">
          <div className="card overflow-hidden">
            {anime.poster ? (
              <img
                src={anime.poster}
                alt={anime.title}
                className="w-full aspect-[3/4] object-cover"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-surface flex items-center justify-center">
                <span className="text-text-secondary text-4xl">?</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-black tracking-wide mb-2">
              {anime.title}
            </h1>
            {anime.japanese_title && (
              <p className="text-text-secondary text-body-secondary">
                {anime.japanese_title}
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {anime.score && (
              <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-card border border-divider">
                <StarIcon />
                <span className="font-mono font-bold">{anime.score}</span>
              </div>
            )}

            {(anime.year || anime.season) && (
              <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-card border border-divider">
                <CalendarIcon />
                <span>
                  {anime.year && anime.season 
                    ? `${anime.year} • ${anime.season}`
                    : anime.year || anime.season}
                </span>
              </div>
            )}

            {anime.type && (
              <div className="bg-surface px-4 py-2 rounded-card border border-divider">
                <span className="text-status-label uppercase tracking-[1.2px]">{anime.type}</span>
              </div>
            )}

            {anime.episodes > 0 && (
              <div className="bg-surface px-4 py-2 rounded-card border border-divider">
                <span className="font-semibold">{anime.episodes}</span> Episodes
              </div>
            )}

            {anime.status && anime.status !== 'Unknown' && (
              <div className={`px-4 py-2 rounded-card border ${
                anime.status === 'Airing' ? 'bg-success/10 border-success text-success' :
                anime.status === 'Completed' ? 'bg-accent/10 border-accent' :
                'bg-warning/10 border-warning text-warning'
              }`}>
                <span className="text-status-label uppercase tracking-[1.2px]">{anime.status}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 text-sm border border-divider rounded-full text-text-secondary hover:border-accent/30 transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {anime.synopsis && (
            <div>
              <h3 className="text-section-header uppercase tracking-[2px] mb-3">Synopsis</h3>
              <p className="text-body-secondary leading-relaxed">
                {anime.synopsis}
              </p>
            </div>
          )}

          {/* Studio */}
          {anime.studio && (
            <div className="text-sm">
              <span className="text-text-secondary">Studio: </span>
              <span className="font-semibold">{anime.studio}</span>
            </div>
          )}
        </div>
      </section>

      {/* Extras (Trailer, Characters) - Client Side */}
      <AnimeExtras title={anime.title} />

      {/* Episodes Section */}
      {anime.episodes_list && anime.episodes_list.length > 0 && (
        <section className="pt-8 border-t border-divider">
          <EpisodeList 
            episodes={anime.episodes_list} 
            animeId={id}
          />
        </section>
      )}

      {/* Relations Section */}
      {anime.relations && anime.relations.length > 0 && (
        <section className="pt-8 border-t border-divider">
           <h3 className="text-section-header uppercase tracking-[2px] mb-6">Related Anime</h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {anime.relations.map((rel) => (
                <Link key={rel.id} href={`/anime/${rel.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-card mb-2">
                    {rel.poster ? (
                      <img src={rel.poster} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    ) : (
                      <div className="w-full h-full bg-surface" />
                    )}
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                      {rel.type}
                    </div>
                  </div>
                  <h4 className="font-bold truncate group-hover:text-accent transition-colors">{rel.title}</h4>
                  <p className="text-xs text-text-secondary">{rel.status}</p>
                </Link>
             ))}
           </div>
        </section>
      )}

      {/* Recommendations Section */}
      {anime.recommendations && anime.recommendations.length > 0 && (
        <section className="pt-8 border-t border-divider">
           <h3 className="text-section-header uppercase tracking-[2px] mb-6">You Might Like</h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {anime.recommendations.map((rec) => (
                <Link key={rec.id} href={`/anime/${rec.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-card mb-2">
                    {rec.poster ? (
                      <img src={rec.poster} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    ) : (
                      <div className="w-full h-full bg-surface" />
                    )}
                     <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                      {rec.type}
                    </div>
                  </div>
                  <h4 className="font-bold truncate group-hover:text-accent transition-colors">{rec.title}</h4>
                   <p className="text-xs text-text-secondary">{rec.status}</p>
                </Link>
             ))}
           </div>
        </section>
      )}
    </div>
  );
}
