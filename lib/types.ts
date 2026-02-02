export interface Anime {
  id: string
  animepaheId: string
  title: string
  englishTitle?: string
  type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' | 'Music' | 'Unknown'
  episodes: number
  status: 'Airing' | 'Completed' | 'Upcoming' | 'Unknown'
  score: number
  year: number
  season?: 'Winter' | 'Spring' | 'Summer' | 'Fall'
  genres: string[]
  themes: string[]
  poster: string
  description: string
  releaseDate?: string
  latestEpisodeId?: string
}
