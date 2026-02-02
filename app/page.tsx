'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

const RANDOM_EMOJIS = ['🍙', '🥟', '🍣', '🎏', '🍡', '🍜', '🍢', '🥢', '🍛', '🍘', '🍚', '🍱'];
const getRandomEmoji = () => RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)];

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get('q') || '';
  const pageParam = searchParams.get('page') || '1';

  const [randomEmoji] = useState(getRandomEmoji);
  useEffect(() => {
    if (queryParam.trim()) {
      router.replace(`/search/${encodeURIComponent(queryParam.trim())}?page=${pageParam}`);
    }
  }, [queryParam, pageParam, router]);

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search/${encodeURIComponent(trimmed)}?page=1`);
    }
  };

  return (
    <div className="space-y-8">
      <section className="text-center py-12 border-b border-divider">
        <h2 className="text-4xl font-black tracking-[3px] uppercase">
          Search <span className="text-success">AnimePahe</span>
        </h2>
        {/* Dark interface for browsing AnimePahe. */}
      </section>

      <section className="card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <h3 className="text-section-header uppercase tracking-[2px] mb-4">
              Search
            </h3>
            <SearchBar
              onSearch={handleSearch}
              initialQuery={queryParam}
              submitOnly
            />
          </div>
        </div>
      </section>

      <section>
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4" suppressHydrationWarning>
            {randomEmoji}
          </div>
          <h3 className="text-2xl font-black mb-2">Start Searching</h3>
          <p className="text-text-secondary mb-6">
            Enter an anime title in the search bar to get started
          </p>
          <p className="text-sm text-text-secondary/50 font-mono"></p>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="space-y-8 min-h-[40vh]" />}>
      <HomeContent />
    </Suspense>
  );
}
