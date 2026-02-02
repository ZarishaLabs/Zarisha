'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import SearchFilters, { type FilterState } from '@/components/SearchFilters';
import AnimeCard from '@/components/AnimeCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import Pagination from '@/components/Pagination';
import { searchAnime } from '@/lib/api/anime-api';
import type { SearchResponse, SearchResultItem } from '@/lib/api/api-types';
import { getUserFriendlyMessage, type ApiError } from '@/lib/utils/error-handler';

const DEFAULT_LIMIT = 12;

export default function SearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryFromPath = decodeURIComponent((params?.query as string) || '').trim();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const itemsPerPage = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT));
  const typeParam = searchParams.get('type');
  const yearParam = searchParams.get('year');
  const sortParam = searchParams.get('sort');
  
  const filtersFromUrl: FilterState = useMemo(() => ({
    type: typeParam || undefined,
    year: yearParam || undefined,
    sort: sortParam || undefined,
  }), [typeParam, yearParam, sortParam]);

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = (overrides: {
    query?: string;
    page?: number;
    limit?: number;
    filters?: FilterState;
  } = {}) => {
    const q = overrides.query ?? queryFromPath;
    const p = overrides.page ?? currentPage;
    const l = overrides.limit ?? itemsPerPage;
    const f = overrides.filters ?? filtersFromUrl;

    const params = new URLSearchParams();
    params.set('page', String(Math.max(1, p)));
    if (l !== DEFAULT_LIMIT) params.set('limit', String(l));
    if (f.type) params.set('type', f.type);
    if (f.year) params.set('year', f.year);
    if (f.sort) params.set('sort', f.sort);

    return `/search/${encodeURIComponent(q)}?${params.toString()}`;
  };

  useEffect(() => {
    if (!queryFromPath) {
      router.replace('/');
    }
  }, [queryFromPath, router]);

  // run search when query/page changes
  useEffect(() => {
    async function performSearch() {
      if (!queryFromPath) return;

      try {
        setLoading(true);
        setError(null);

        const apiData = await searchAnime(queryFromPath, currentPage, itemsPerPage);
        setResults(apiData);
      } catch (err) {
        const apiError = err as ApiError;
        setError(getUserFriendlyMessage(apiError));
        setResults(null);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [queryFromPath, currentPage, itemsPerPage]);

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(buildUrl({ query: trimmed, page: 1 }));
    } else {
      router.push('/');
    }
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    router.push(buildUrl({ filters: newFilters, page: 1 })); // Reset to page 1 when filters change
  };

  const convertedResults = useMemo(() => {
    if (!results?.data) return [];
    
    return results.data
      .map((item: SearchResultItem) => ({
        id: item.id,
        animepaheId: item.id,
        title: item.title,
        englishTitle: undefined,
        type: item.type,
        episodes: item.episodes,
        status: item.status,
        score: parseFloat(item.score || '0'),
        year: item.year || 0,
        season: undefined,
        genres: [],
        themes: [],
        poster: item.poster || '',
        description: '',
      }))
      .filter((anime) => {
        if (filtersFromUrl.type && anime.type?.toLowerCase() !== filtersFromUrl.type.toLowerCase()) return false;
        if (filtersFromUrl.year && anime.year !== parseInt(filtersFromUrl.year)) return false;
        return true;
      })
      .sort((a, b) => {
        const sortValue = filtersFromUrl.sort;
        if (sortValue === 'year') return (b.year || 0) - (a.year || 0);
        if (sortValue === 'year-asc') return (a.year || 0) - (b.year || 0);
        if (sortValue === 'score') return b.score - a.score;
        if (sortValue === 'score-asc') return a.score - b.score;
        if (sortValue === 'title') return a.title.localeCompare(b.title);
        if (sortValue === 'title-desc') return b.title.localeCompare(a.title);
        return 0;
      });
  }, [results?.data, filtersFromUrl]);

  const hasActiveFilters = filtersFromUrl.type || filtersFromUrl.year;

  return (
    <div className="space-y-8">
      <section className="card p-6 space-y-6">
        <div>
          <h3 className="text-section-header uppercase tracking-[2px] mb-4">Search</h3>
          <SearchBar onSearch={handleSearch} initialQuery={queryFromPath} submitOnly />
        </div>

        {/* Filters */}
        <div className="pt-4 border-t border-divider">
          <SearchFilters 
            onFilterChange={handleFilterChange} 
            initialFilters={filtersFromUrl}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-section-header uppercase tracking-[2px]">Search Results</h3>
          {results && results.last_page > 1 && (
            <div className="text-body-secondary font-mono text-sm">
              Page {currentPage} / {results.last_page}
            </div>
          )}
        </div>

        {error && (
          <div className="card p-8 text-center">
            <div className="text-error text-4xl mb-4">⚠</div>
            <p className="text-text-secondary">{error}</p>
            <button onClick={() => router.push(buildUrl({ page: 1 }))} className="button-secondary px-6 mt-4">RETRY</button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(itemsPerPage)].map((_, i) => <LoadingSkeleton key={i} type="card" />)}
          </div>
        )}

        {!loading && !error && convertedResults.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {convertedResults.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
            </div>
            {results && results.last_page > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  lastPage={results.last_page}
                  onPageChange={handlePageChange}
                  buildPageUrl={(p) => buildUrl({ page: p })}
                />
              </div>
            )}
          </>
        )}

        {!loading && !error && queryFromPath && convertedResults.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-black mb-2">No Results Found</h3>
            <p className="text-text-secondary">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search term'
                : `Try a different search term for "${queryFromPath}"`
              }
            </p>
            {hasActiveFilters && (
              <button 
                onClick={() => handleFilterChange({})} 
                className="button-secondary px-6 mt-4"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
