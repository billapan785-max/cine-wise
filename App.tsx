
import React, { useState, useEffect, useCallback } from 'react';
import { Movie, TMDBResponse } from './types';
import { GoogleGenAI } from "@google/genai";
import MovieCard from './components/MovieCard';
import MovieDetailModal from './components/MovieDetailModal';
import AIConcierge from './components/AIConcierge';
import Notification from './components/Notification';

// --- CONFIGURATION ---
// Safely access environment variables with optional chaining to prevent crashes in non-Vite environments
const TMDB_API_KEY = (import.meta as any)?.env?.VITE_TMDB_API_KEY || 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// --- TMDB API LOGIC ---
export interface VideoResult {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

export const getMovieById = async (id: number): Promise<Movie | null> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching movie ${id}:`, error);
    return null;
  }
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
    const data: TMDBResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    const data: TMDBResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    const data: TMDBResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getRecommendations = async (movieId: number): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}`);
    const data: TMDBResponse = await response.json();
    return (data.results || []).slice(0, 6);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

export const getMovieVideos = async (movieId: number): Promise<VideoResult[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    return [];
  }
};

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- GEMINI AI LOGIC ---
export const getMovieCritique = async (movieTitle: string, overview: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a professional movie critic, provide a one-sentence witty hook for the movie "${movieTitle}". 
                 Overview: ${overview}. 
                 Keep it engaging, modern, and high-impact.`,
      config: { temperature: 0.8 }
    });
    return response.text || "A cinematic experience you won't forget.";
  } catch (error) {
    console.error("Gemini Critique Error:", error);
    return "The critics are speechless on this one.";
  }
};

export const getAIRecommendations = async (userPrompt: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the following request: "${userPrompt}", suggest exactly 5 movie titles. 
                 Provide them as a comma-separated list of titles only. No explanations.`,
    });
    const text = response.text || "";
    return text.split(',').map(s => s.trim()).filter(Boolean);
  } catch (error) {
    console.error("Gemini Recommendations Error:", error);
    return [];
  }
};

// --- SEO LOGIC ---
export const updateMetaTags = (title: string, description: string, image: string, url: string) => {
  document.title = title;
  const setMeta = (property: string, content: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      if (isProperty) element.setAttribute('property', property);
      else element.name = property;
      document.head.appendChild(element);
    }
    element.content = content;
  };
  setMeta('description', description);
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:image', image, true);
  setMeta('og:url', url, true);
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', image);
};

export const updateCanonical = (path: string = '') => {
  const link = document.getElementById('canonical-link') as HTMLLinkElement;
  if (link) link.href = `https://cinewise.ai/${path}`;
};

export const injectBreadcrumbs = (items: { name: string, item: string }[]) => {
  let script = document.getElementById('breadcrumbs-json-ld') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumbs-json-ld';
    document.head.appendChild(script);
  }
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((it, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": it.name,
      "item": `https://cinewise.ai${it.item}`
    }))
  };
  script.text = JSON.stringify(breadcrumbs);
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAIConciergeOpen, setIsAIConciergeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const slugify = (text: string) => (text || '').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

  const getBasePath = () => {
    const path = window.location.pathname;
    const movieIndex = path.indexOf('/movie/');
    if (movieIndex !== -1) return path.substring(0, movieIndex) || '/';
    return path.endsWith('/') ? path : `${path}/`;
  };

  const parseIdFromPath = (path: string): number | null => {
    const match = path.match(/\/movie\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const handleRoute = useCallback(async () => {
    const movieId = parseIdFromPath(window.location.pathname);
    if (movieId) {
      if (selectedMovie?.id === movieId) return;
      const movie = await getMovieById(movieId);
      if (movie) setSelectedMovie(movie);
      else setSelectedMovie(null);
    } else {
      setSelectedMovie(null);
    }
  }, [selectedMovie]);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trendingData, popularData] = await Promise.all([
        getTrendingMovies(),
        getPopularMovies()
      ]);
      setTrending(trendingData);
      setPopular(popularData);
      await handleRoute();
    } catch (error) {
      console.error("Initialization failed", error);
    } finally {
      setIsLoading(false);
    }
  }, [handleRoute]);

  useEffect(() => {
    fetchInitialData();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    const onPopState = () => handleRoute();
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', onPopState);
    };
  }, [fetchInitialData, handleRoute]);

  useEffect(() => {
    try {
      const base = getBasePath().replace(/\/$/, '');
      if (selectedMovie) {
        const slug = slugify(selectedMovie.title);
        const newPath = `${base}/movie/${selectedMovie.id}-${slug}`;
        if (window.location.pathname !== newPath) {
          window.history.pushState({ movieId: selectedMovie.id }, '', newPath);
        }
      } else if (!searchQuery && window.location.pathname !== base && window.location.pathname !== `${base}/`) {
        window.history.pushState(null, '', base || '/');
      }
    } catch (e) {
      console.debug('History update skipped');
    }
  }, [selectedMovie, searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
        setSelectedMovie(null);
        try { 
          const base = getBasePath().replace(/\/$/, '');
          window.history.pushState(null, '', base || '/'); 
        } catch(e) {}
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetView = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMovie(null);
    window.scrollTo({top: 0, behavior: 'smooth'});
    try { 
      const base = getBasePath().replace(/\/$/, '');
      window.history.pushState(null, '', base || '/'); 
    } catch(e) {}
  };

  return (
    <div className={`min-h-screen pb-20 overflow-x-hidden ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      <div className={`${selectedMovie ? 'hidden md:block opacity-0' : 'block opacity-100'} transition-opacity duration-500`}>
        <header className={`fixed top-0 w-full z-40 transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-zinc-950/95 shadow-2xl backdrop-blur-xl' : 'bg-transparent'}`}>
          <div className="flex items-center gap-12">
            <h1 className="text-2xl font-black text-red-600 tracking-tighter uppercase italic cursor-pointer select-none" onClick={resetView}>CineWise</h1>
            <nav className="hidden lg:block">
              <ul className="flex gap-8 text-xs font-black uppercase tracking-widest text-zinc-400">
                <li><button className="hover:text-white transition-colors" onClick={resetView}>Home</button></li>
                <li><button className="hover:text-white transition-colors" onClick={() => { setSearchQuery('Oscar'); handleSearch({ preventDefault: () => {} } as any); }}>Awards</button></li>
              </ul>
            </nav>
          </div>

          <form onSubmit={handleSearch} className="flex items-center relative group">
            <input 
              type="text"
              placeholder="SEARCH MOVIES..."
              className="bg-zinc-900/50 border border-zinc-800 rounded-full py-2.5 pl-12 pr-6 text-[10px] font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600 w-40 md:w-80 transition-all duration-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fa-solid fa-magnifying-glass absolute left-5 text-zinc-600 text-xs"></i>
          </form>
        </header>

        {isLoading && !trending.length ? (
          <div className="h-screen w-full flex items-center justify-center bg-zinc-950">
             <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-zinc-500 text-xs font-black tracking-widest uppercase">Initializing Cinema...</p>
             </div>
          </div>
        ) : (
          <>
            {!searchQuery && trending[0] && (
              <section className="relative h-[80vh] w-full mb-16">
                <img src={getImageUrl(trending[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover" alt="Featured" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-3xl space-y-6">
                  <span className="text-red-600 font-black tracking-[0.4em] text-[10px] uppercase flex items-center gap-3">
                    <span className="h-px w-8 bg-red-600"></span> Featured Today
                  </span>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">{trending[0].title}</h2>
                  <p className="text-lg text-zinc-300 line-clamp-3 leading-relaxed font-light">{trending[0].overview}</p>
                  <div className="flex gap-6 pt-6">
                    <button onClick={() => setSelectedMovie(trending[0])} className="bg-white text-black font-black px-10 py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-3 text-sm"><i className="fa-solid fa-info-circle"></i> VIEW DETAILS</button>
                  </div>
                </div>
              </section>
            )}

            <main className="px-6 md:px-12 space-y-20 relative z-10 -mt-20 md:-mt-32">
              {searchQuery && (
                <section>
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter">Results for "{searchQuery}" <span className="h-px flex-1 bg-zinc-900"></span></h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {searchResults.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                  </div>
                </section>
              )}

              {!searchQuery && (
                <>
                  <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">Trending Now <span className="h-px flex-1 bg-zinc-900"></span></h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {trending.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                    </div>
                  </section>
                  <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">Top Rated <span className="h-px flex-1 bg-zinc-900"></span></h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {popular.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                    </div>
                  </section>
                </>
              )}
            </main>
          </>
        )}
      </div>

      <MovieDetailModal 
        movie={selectedMovie} 
        onClose={() => setSelectedMovie(null)} 
      />

      <div className="fixed bottom-8 right-8 z-40">
        <button onClick={() => setIsAIConciergeOpen(true)} className="w-16 h-16 bg-red-600 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 group"><i className="fa-solid fa-sparkles text-2xl group-hover:rotate-12 transition-transform"></i></button>
      </div>

      <AIConcierge isOpen={isAIConciergeOpen} onClose={() => setIsAIConciergeOpen(false)} onSelectMovie={(m) => { setSelectedMovie(m); setIsAIConciergeOpen(false); }} />
      <Notification message={notification || ''} isVisible={!!notification} onClose={() => setNotification(null)} />
    </div>
  );
};

export default App;
