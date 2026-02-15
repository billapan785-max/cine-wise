import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// --- CONFIGURATION ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// --- API LOGIC ---
const getTrendingMovies = async (): Promise<Movie[]> => {
  const response = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data.results || [];
};

const getPopularMovies = async (): Promise<Movie[]> => {
  const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
  const data = await response.json();
  return data.results || [];
};

const searchMovies = async (query: string): Promise<Movie[]> => {
  const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.results || [];
};

const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- COMPONENTS (Internalized to prevent Build Error) ---

const MovieCard: React.FC<{ movie: Movie; onClick: (m: Movie) => void }> = ({ movie, onClick }) => (
  <div className="relative group cursor-pointer transition-all duration-300 transform hover:scale-105" onClick={() => onClick(movie)}>
    <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-900 border border-zinc-800">
      <img src={getImageUrl(movie.poster_path)} alt={movie.title} className="h-full w-full object-cover" loading="lazy" />
    </div>
    <div className="mt-2">
      <h3 className="text-white text-sm font-semibold truncate">{movie.title}</h3>
      <p className="text-gray-400 text-xs">{movie.release_date?.split('-')[0]}</p>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [t, p] = await Promise.all([getTrendingMovies(), getPopularMovies()]);
        setTrending(t);
        setPopular(p);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* SEO H1 Tag */}
      <h1 className="sr-only">CineWise - Watch Trending Hollywood Movies & Trailers Online</h1>

      <header className="p-6 flex justify-between items-center sticky top-0 bg-zinc-950/90 backdrop-blur-md z-50">
        <h2 className="text-2xl font-black text-red-600 italic cursor-pointer" onClick={() => {setSearchQuery(''); setSearchResults([]);}}>CINEWISE</h2>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search Movies..." 
            className="bg-zinc-900 border border-zinc-800 rounded-full py-2 px-10 text-xs w-64 focus:ring-2 focus:ring-red-600 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </header>

      <main className="px-6 md:px-12 space-y-12">
        {searchQuery ? (
          <section>
            <h2 className="text-xl font-bold mb-6">Results for "{searchQuery}"</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {searchResults.map(m => <MovieCard key={m.id} movie={m} onClick={setSelectedMovie} />)}
            </div>
          </section>
        ) : (
          <>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Trending 2026 Releases</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {trending.map(m => <MovieCard key={m.id} movie={m} onClick={setSelectedMovie} />)}
              </div>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Popular Right Now</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {popular.map(m => <MovieCard key={m.id} movie={m} onClick={setSelectedMovie} />)}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer from Image */}
      <footer className="w-full py-8 bg-zinc-950 text-zinc-500 text-center border-t border-zinc-800 mt-20">
        <p className="text-sm">&copy; 2026 MovieBox - All Trending Hollywood Updates</p>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <a href="/disclaimer" className="hover:text-red-500">Disclaimer</a>
          <a href="/privacy" className="hover:text-red-500">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
