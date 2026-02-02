import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchAnime, getAnimeDetails, getEpisodeSource, clearAnimeCache } from '../anime-api';

// Mock the API client
vi.mock('../api-client', () => ({
  apiClient: vi.fn(),
  buildQueryString: (params: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` :  '';
  },
}));

import { apiClient } from '../api-client';

describe('anime-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAnimeCache();
  });

  describe('searchAnime', () => {
    it('should search for anime and return results', async () => {
      const mockResponse = {
        total: 100,
        last_page: 5,
        current_page: 1,
        per_page: 20,
        data: [
          {
            id: 'naruto',
            title: 'Naruto',
            type: 'TV',
            episodes: 220,
            status: 'Completed',
            year: 2002,
            score: '8.3',
            poster: 'https://example.com/naruto.jpg',
            session: 'session123',
          },
        ],
      };

      vi.mocked(apiClient).mockResolvedValueOnce(mockResponse);

      const result = await searchAnime('naruto', 1);

      expect(apiClient).toHaveBeenCalledWith('/search?query=naruto&page=1&limit=12');
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Naruto');
    });

    it('should throw error for empty query', async () => {
      await expect(searchAnime('')).rejects.toThrow('Search query cannot be empty');
    });

    it('should cache search results', async () => {
      const mockResponse = {
        total: 1,
        last_page: 1,
        current_page: 1,
        per_page: 20,
        data: [
          {
            id: 'test',
            title: 'Test Anime',
            type: 'TV' as const,
            episodes: 12,
            status: 'Completed' as const,
            year: 2023,
            score: '8.0',
            session: 'test123',
          },
        ],
      };

      vi.mocked(apiClient).mockResolvedValueOnce(mockResponse);

      // First call (default page=1, limit=12)
      await searchAnime('test');
      expect(apiClient).toHaveBeenCalledTimes(1);

      // Second call should use cache (same page+limit)
      await searchAnime('test');
      expect(apiClient).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('getAnimeDetails', () => {
    it('should fetch anime details', async () => {
      const mockAnime = {
        id: 'naruto',
        title: 'Naruto',
        japanese_title: 'ナルト',
        type: 'TV' as const,
        episodes: 220,
        status: 'Completed' as const,
        year: 2002,
        score: '8.3',
        poster: 'https://example.com/naruto.jpg',
        synopsis: 'A young ninja...',
        genres: ['Action', 'Adventure'],
        studio: 'Pierrot',
        episodes_list: [
          {
            id: 1,
            episode: 1,
            title: 'Enter: Naruto Uzumaki!',
            snapshot: 'https://example.com/ep1.jpg',
            session: 'ep1session',
            filler: false,
          },
        ],
      };

      vi.mocked(apiClient).mockResolvedValueOnce(mockAnime);

      const result = await getAnimeDetails('naruto');

      expect(apiClient).toHaveBeenCalledWith('/get_full_data/naruto');
      expect(result.title).toBe('Naruto');
      expect(result.episodes_list).toHaveLength(1);
    });

    it('should throw error for empty anime ID', async () => {
      await expect(getAnimeDetails('')).rejects.toThrow('Anime ID cannot be empty');
    });

    it('should cache anime details', async () => {
      const mockAnime = {
        id: 'test',
        title: 'Test',
        type: 'TV' as const,
        episodes: 12,
        status: 'Completed' as const,
        year: 2023,
      };

      vi.mocked(apiClient).mockResolvedValueOnce(mockAnime);

      await getAnimeDetails('test');
      expect(apiClient).toHaveBeenCalledTimes(1);

      await getAnimeDetails('test');
      expect(apiClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEpisodeSource', () => {
    it('should fetch episode streaming sources', async () => {
      const mockEpisode = {
        episode: 1,
        title: 'Episode 1',
        streams: [
          {
            quality: '1080p',
            url: 'https://stream.example.com/video.m3u8',
            audio: 'jpn',
            size: '450MB',
          },
        ],
        direct_links: [
          {
            quality: '1080p',
            url: 'https://cdn.example.com/video.m3u8',
            type: 'm3u8',
          },
        ],
      };

      vi.mocked(apiClient).mockResolvedValueOnce(mockEpisode);

      const result = await getEpisodeSource('naruto', 1);

      expect(apiClient).toHaveBeenCalledWith('/get_episode/naruto/1');
      expect(result.episode).toBe(1);
      expect(result.direct_links).toHaveLength(1);
    });

    it(' should throw error for invalid episode number', async () => {
      await expect(getEpisodeSource('naruto', 0)).rejects.toThrow(
        'Episode number must be greater than 0'
      );
    });

    it('should cache episode sources', async () => {
      const mockEpisode = {
        episode: 1,
        title: 'Test Episode',
        streams: [],
        direct_links: [],
      };

      vi.mocked(apiClient).mockResolvedValueOnce(mockEpisode);

      await getEpisodeSource('test', 1);
      expect(apiClient).toHaveBeenCalledTimes(1);

      await getEpisodeSource('test', 1);
      expect(apiClient).toHaveBeenCalledTimes(1);
    });
  });
});
