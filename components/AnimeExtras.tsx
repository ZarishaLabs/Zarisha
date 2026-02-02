'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface ExtraData {
  trailer?: { id: string; site: string; url: string };
  characters?: Array<{
    id: number;
    name: { full: string };
    image: string;
    role: string;
  }>;
  links?: any[];
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AnimeExtras({ title }: { title: string }) {
  const { data, error, isLoading } = useSWR<ExtraData>(
    title ? `/api/proxy/extras/${encodeURIComponent(title)}` : null,
    fetcher
  );

  if (!title) return null;
  if (isLoading) return <div className="animate-pulse h-20 bg-surface rounded-card mt-8"></div>;
  if (error || !data) return null;

  const trailerId = data.trailer?.id;
  const hasTrailer = data.trailer?.site === 'youtube' && trailerId;
  const hasCharacters = data.characters && data.characters.length > 0;

  if (!hasTrailer && !hasCharacters) return null;

  return (
    <div className="space-y-8 pt-8 border-t border-divider">
      {/* Trailer */}
      {hasTrailer && (
        <section>
          <h3 className="text-section-header uppercase tracking-[2px] mb-6">Trailer</h3>
          <div className="aspect-video w-full max-w-3xl mx-auto rounded-card overflow-hidden bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailerId}`}
              title="Anime Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}

      {/* Characters */}
      {hasCharacters && (
        <section className={hasTrailer ? 'pt-8' : ''}>
          <h3 className="text-section-header uppercase tracking-[2px] mb-6">Characters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.characters!.slice(0, 6).map((char) => (
              <div key={char.id} className="group">
                <div className="aspect-[3/4] overflow-hidden rounded-card mb-2">
                  <img src={char.image} alt={char.name.full} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                </div>
                <p className="font-bold text-sm truncate">{char.name.full}</p>
                <p className="text-xs text-text-secondary uppercase">{char.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
