
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- TYPES & INTERFACES (Consolidated) ---
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

export interface VideoResult {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

// --- CONFIGURATION ---
// Safely access environment variables with optional chaining to prevent the reported crash
const TMDB_API_KEY = (import.meta as any)?.env?.VITE_TMDB_API_KEY || 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// --- TMDB API LOGIC ---
const getMovieById = async (id: number): Promise<Movie | null> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching movie ${id}:`, error);
    return null;
  }
};

const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
    const data: TMDBResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

const getPopularMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    const data: TMDBResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    const data: TMDBResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

const getRecommendations = async (movieId: number): Promise<Movie[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}`);
    const data: TMDBResponse = await response.json();
    return (data.results || []).slice(0, 6);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

const getMovieVideos = async (movieId: number): Promise<VideoResult[]> => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    return [];
  }
};

const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- GEMINI AI LOGIC ---
const getMovieCritique = async (movieTitle: string, overview: string): Promise<string> => {
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

const getAIRecommendations = async (userPrompt: string): Promise<string[]> => {
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

// --- SEO HELPERS ---
const updateMetaTags = (title: string, description: string, image: string, url: string) => {
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
};

// --- COMPONENTS ---

const Notification: React.FC<{ message: string; isVisible: boolean; onClose: () => void }> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3">
        <i className="fa-solid fa-circle-check text-green-600"></i>
        {message}
      </div>
    </div>
  );
};

const MovieCard: React.FC<{ movie: Movie; onClick: (movie: Movie) => void }> = ({ movie, onClick }) => {
  return (
    <div 
      className="relative group cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 z-0 hover:z-10"
      onClick={() => onClick(movie)}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-900 shadow-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">
        <img 
          src={getImageUrl(movie.poster_path)} 
          alt={${movie.title} Hollywood Movie Poster - CineWise}
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-30"
          loading="lazy"
        />
        <div className="p-3">
  <h3 className="text-white font-semibold truncate">{movie.title}</h3>
  <p className="text-gray-400 text-sm">{movie.release_date?.split('-')[0]}</p>
</div>
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <span className="text-sm font-black leading-tight mb-1 drop-shadow-md uppercase tracking-tight">{movie.title}</span>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 text-[10px] text-yellow-500 font-black">
            <i className="fa-solid fa-star"></i>
            {movie.vote_average.toFixed(1)}
          </span>
          <span className="text-[10px] text-zinc-400 font-bold">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [critique, setCritique] = useState<string>('');
  const [loadingCritique, setLoadingCritique] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (movie) {
      const originalTitle = document.title;
      const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
      const safeTitle = movie.title || 'Unknown Title';
      
      updateMetaTags(
        `${safeTitle} (${movieYear}) - CineWise`,
        (movie.overview || '').substring(0, 160),
        getImageUrl(movie.poster_path, 'w500'),
        window.location.href
      );

      setLoadingCritique(true);
      getMovieCritique(safeTitle, movie.overview || '')
        .then(text => {
          setCritique(text);
          setLoadingCritique(false);
        })
        .catch(() => {
          setCritique("A cinematic journey awaits.");
          setLoadingCritique(false);
        });

      getRecommendations(movie.id).then(setRelatedMovies);

      setLoadingVideo(true);
      getMovieVideos(movie.id).then((videos) => {
        const bestTrailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos[0];
        setTrailerKey(bestTrailer ? bestTrailer.key : null);
        setLoadingVideo(false);
      });

      return () => { document.title = originalTitle; };
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-zinc-950 transition-all animate-in fade-in duration-300">
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
          <button onClick={() => setShowTrailer(false)} className="absolute top-6 right-6 bg-zinc-800 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-xmark text-2xl"></i></button>
          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-black">
            <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <div className="relative w-full h-full overflow-y-auto bg-zinc-950 scrollbar-hide">
        <button onClick={onClose} className="fixed top-6 left-6 md:top-8 md:left-8 z-[70] bg-black/60 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-arrow-left"></i></button>

        <div className="relative h-[45vh] md:h-[70vh] w-full">
          <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover" alt={movie.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full">
            <h1 className="text-4xl md:text-8xl font-black mb-6 uppercase italic tracking-tighter">{movie.title}</h1>
            <div className="flex gap-6 text-sm font-bold items-center">
              <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-md">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="text-zinc-300">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <p className="text-xl md:text-3xl text-zinc-100 leading-snug font-light italic">"{movie.overview}"</p>
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mb-4">AI Analysis</h4>
              {loadingCritique ? <div className="h-8 w-2/3 bg-zinc-800 animate-pulse rounded-lg"></div> : <p className="text-2xl font-bold">"{critique}"</p>}
            </div>

            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Related Experiences</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {relatedMovies.map(m => (
                  <div key={m.id} className="group cursor-pointer" onClick={() => { getMovieById(m.id).then(fullMovie => { if (fullMovie) onClose(); }) }}>
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border-2 border-transparent group-hover:border-red-600 transition-all">
                      <img src={getImageUrl(m.poster_path)} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="mt-4 text-xs font-bold text-zinc-400 group-hover:text-white truncate uppercase tracking-widest">{m.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
             <button onClick={() => trailerKey && setShowTrailer(true)} disabled={!trailerKey} className={`w-full py-5 rounded-2xl font-black text-sm transition-all active:scale-95 ${!trailerKey ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                {loadingVideo ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play mr-3"></i>}
                {trailerKey ? 'WATCH TRAILER' : 'TRAILER N/A'}
             </button>
             <div className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-4">Rating</span>
                <span className="text-4xl font-black">{movie.vote_average.toFixed(1)} <span className="text-zinc-700 text-xl">/ 10</span></span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIConcierge: React.FC<{ isOpen: boolean; onClose: () => void; onSelectMovie: (movie: Movie) => void }> = ({ isOpen, onClose, onSelectMovie }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const titles = await getAIRecommendations(prompt);
      const results = await Promise.all(titles.map(title => searchMovies(title)));
      const foundMovies = results.map(r => r[0]).filter((m): m is Movie => !!m);
      setRecommendations(foundMovies);
    } catch (error) {
      console.error("AI recommendation failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><i className="fa-solid fa-sparkles text-white text-sm"></i></div>
            <h2 className="text-xl font-bold">AI Concierge</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <textarea className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-600 h-32 outline-none text-white" placeholder="I'm looking for a mind-bending sci-fi movie like Interstellar..." value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
            <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-all">
              {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'GET AI PICKS'}
            </button>
          </form>
          {recommendations.length > 0 && (
            <div className="space-y-4 pt-6">
              <h3 className="text-xs font-bold uppercase text-zinc-500">Curated Picks</h3>
              <div className="space-y-3">
                {recommendations.map(movie => (
                  <div key={movie.id} onClick={() => onSelectMovie(movie)} className="flex gap-4 p-3 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-red-600 cursor-pointer transition-all group">
                    <img src={getImageUrl(movie.poster_path, 'w500')} className="w-16 h-24 rounded object-cover" alt={movie.title} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate group-hover:text-red-500">{movie.title}</h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-2">{movie.overview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
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

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trendingData, popularData] = await Promise.all([
        getTrendingMovies(),
        getPopularMovies()
      ]);
      setTrending(trendingData);
      setPopular(popularData);
    } catch (error) {
      console.error("App init failed", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchInitialData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
        setSelectedMovie(null);
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
  };

  return (
    <div className={`min-h-screen pb-20 overflow-x-hidden bg-zinc-950 text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      <h1 className="sr-only">CineWise - Watch Trending Hollywood Movies & Trailers Online</h1>
      <header className={`fixed top-0 w-full z-[50] transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-zinc-950/95 shadow-2xl backdrop-blur-xl border-b border-zinc-900' : 'bg-transparent'}`}>
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-black text-red-600 tracking-tighter uppercase italic cursor-pointer select-none" onClick={resetView}>CineWise</h1>
        </div>

        <form onSubmit={handleSearch} className="flex items-center relative group">
          <input 
            type="text"
            placeholder="SEARCH MOVIES..."
            className="bg-zinc-900/50 border border-zinc-800 rounded-full py-2.5 pl-12 pr-6 text-[10px] font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600 w-40 md:w-80 transition-all duration-500 text-white"
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
             <p className="text-zinc-500 text-xs font-black tracking-widest uppercase">Curating Cinema...</p>
           </div>
        </div>
      ) : (
        <>
          {!searchQuery && trending[0] && (
            <section className="relative h-[85vh] w-full mb-16 overflow-hidden">
              <img src={getImageUrl(trending[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover scale-105" alt="Featured" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl space-y-6">
                <span className="text-red-600 font-black tracking-[0.4em] text-[10px] uppercase flex items-center gap-3">
                  <span className="h-px w-8 bg-red-600"></span> Spotlight Title
                </span>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">{trending[0].title}</h2>
                <p className="text-lg text-zinc-300 line-clamp-3 leading-relaxed font-light italic">"{trending[0].overview}"</p>
                <div className="flex gap-6 pt-6">
                  <button onClick={() => setSelectedMovie(trending[0])} className="bg-white text-black font-black px-10 py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-3 text-sm active:scale-95"><i className="fa-solid fa-play"></i> VIEW DETAILS</button>
                </div>
              </div>
            </section>
          )}

          <main className="px-6 md:px-12 space-y-20 relative z-10 -mt-24">
            {searchQuery && (
              <section className="pt-24">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter">Results for "{searchQuery}" <span className="h-px flex-1 bg-zinc-900"></span></h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {searchResults.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                </div>
              </section>
            )}

            {!searchQuery && (
              <>
                <section>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">Trending Globally <span className="h-px flex-1 bg-zinc-900"></span></h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {trending.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                  </div>
                </section>
                <section>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">Popular Choices <span className="h-px flex-1 bg-zinc-900"></span></h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {popular.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                  </div>
                </section>
              </>
            )}
          </main>
        </>
      )}

      <MovieDetailModal 
        movie={selectedMovie} 
        onClose={() => setSelectedMovie(null)} 
      />

      <div className="fixed bottom-8 right-8 z-[50]">
        <button onClick={() => setIsAIConciergeOpen(true)} className="w-16 h-16 bg-red-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 group">
          <i className="fa-solid fa-sparkles text-2xl group-hover:rotate-12 transition-transform"></i>
        </button>
      </div>

      <AIConcierge isOpen={isAIConciergeOpen} onClose={() => setIsAIConciergeOpen(false)} onSelectMovie={(m) => { setSelectedMovie(m); setIsAIConciergeOpen(false); }} />
      <Notification message={notification || ''} isVisible={!!notification} onClose={() => setNotification(null)} />
    </div>
  );
};

export default App;
