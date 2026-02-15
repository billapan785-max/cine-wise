import React, { useState, useEffect, useCallback } from 'react';
import MovieCard from './components/MovieCard';
import MovieDetailModal from './components/MovieDetailModal';
import AIConcierge from './components/AIConcierge';
import Notification from './components/Notification';
import { getTrendingMovies, getPopularMovies, getMovieById, searchMovies, getImageUrl } from './services/tmdbService';
import { Movie } from './types';

// Constants for local fetch logic
const TMDB_KEY = 'cfedd233fe8494b29646beabc505d193';
const BASE_URL = 'https://api.themoviedb.org/3';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'blogs'>('home');
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAIConciergeOpen, setIsAIConciergeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- 1. SEO Helper (Purane Code se) ---
  const updateMetaTags = useCallback((title: string, description: string) => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
  }, []);

  const slugify = (text: string) => (text || '').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  
  const getMovieUrlPath = (movie: Movie) => {
    return `/movie/${movie.id}-${slugify(movie.title)}`;
  };

  const fetchCategory = async (endpoint: string) => {
    try {
      const res = await fetch(`${BASE_URL}/movie/${endpoint}?api_key=${TMDB_KEY}`);
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      console.error(`Failed to fetch ${endpoint}`, e);
      return [];
    }
  };

  const checkInitialUrl = useCallback(async () => {
    try {
      const path = window.location.pathname;
      const match = path.match(/\/movie\/(\d+)/);
      if (match) {
        const movieId = parseInt(match[1]);
        if (!isNaN(movieId)) {
          const movie = await getMovieById(movieId);
          if (movie) setSelectedMovie(movie);
        }
      }
    } catch (err) {
      console.error("Routing error:", err);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trendingData, popularData, upcomingData, topRatedData] = await Promise.all([
        getTrendingMovies(),
        getPopularMovies(),
        fetchCategory('upcoming'),
        fetchCategory('top_rated')
      ]);
      setTrending(trendingData || []);
      setPopular(popularData || []);
      setUpcoming(upcomingData || []);
      setTopRated(topRatedData || []);
      await checkInitialUrl();
    } catch (error) {
      console.error("Init failed:", error);
      setNotification("Unable to fetch cinematic data.");
    } finally {
      setIsLoading(false);
    }
  }, [checkInitialUrl]);

  useEffect(() => {
    fetchInitialData();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    const handlePopState = () => checkInitialUrl();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchInitialData, checkInitialUrl]);

  // --- 2. Dynamic SEO Title Update ---
  useEffect(() => {
    if (selectedMovie) {
      updateMetaTags(`${selectedMovie.title} - 2026 Release Dates | MovieBox`, selectedMovie.overview.substring(0, 160));
      const newPath = getMovieUrlPath(selectedMovie);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ id: selectedMovie.id }, '', newPath);
      }
    } else {
      updateMetaTags("Trending AMC Movies & 2026 Release Dates | MovieBox", "Check out the latest Hollywood trending movies and upcoming 2026 release dates.");
      if (!searchQuery && window.location.pathname.startsWith('/movie/')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [selectedMovie, searchQuery, updateMetaTags]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results || []);
        setSelectedMovie(null);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetView = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMovie(null);
    setViewMode('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen pb-20 bg-zinc-950 text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      {/* --- 3. Hidden SEO H1 (Purane Code se) --- */}
      <h1 className="sr-only">Trending AMC Movies & 2026 Hollywood Release Dates Online</h1>

      <header className={`fixed top-0 w-full z-40 transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-zinc-950/95 shadow-2xl backdrop-blur-xl border-b border-zinc-900' : 'bg-transparent'}`}>
        <div className="flex items-center gap-8 md:gap-12">
          <h1 className="text-2xl font-black text-red-600 tracking-tighter uppercase italic cursor-pointer select-none" onClick={resetView}>MovieBox</h1>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => { setViewMode('home'); setSearchQuery(''); }} className={`text-[10px] font-black tracking-widest uppercase transition-colors ${viewMode === 'home' && !searchQuery ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>Home</button>
            {/* SEO Friendly Nav Labels */}
            <button onClick={() => { setViewMode('news'); setSearchQuery(''); }} className={`text-[10px] font-black tracking-widest uppercase transition-colors ${viewMode === 'news' && !searchQuery ? 'text-white border-b-2 border-red-600 pb-1' : 'text-zinc-500 hover:text-white'}`}>2026 News</button>
            <button onClick={() => { setViewMode('blogs'); setSearchQuery(''); }} className={`text-[10px] font-black tracking-widest uppercase transition-colors ${viewMode === 'blogs' && !searchQuery ? 'text-white border-b-2 border-red-600 pb-1' : 'text-zinc-500 hover:text-white'}`}>Movie Guides</button>
          </nav>
        </div>

        <form onSubmit={handleSearch} className="flex items-center relative group">
          <input type="text" placeholder="SEARCH MOVIES..." className="bg-zinc-900/50 border border-zinc-800 rounded-full py-2.5 pl-12 pr-6 text-[10px] font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-red-600 w-40 md:w-80 transition-all duration-500 text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
          {!searchQuery && (viewMode === 'home' || viewMode === 'news') && trending.length > 0 && (
            <section className="relative h-[85vh] w-full mb-16 overflow-hidden">
              <img src={getImageUrl(viewMode === 'news' && upcoming.length > 0 ? upcoming[0].backdrop_path : trending[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover scale-105" alt="Featured" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl space-y-6">
                <span className="text-red-600 font-black tracking-[0.4em] text-[10px] uppercase flex items-center gap-3"><span className="h-px w-8 bg-red-600"></span> {viewMode === 'news' ? 'Latest 2026 Production News' : 'Trending Now'}</span>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">{viewMode === 'news' && upcoming.length > 0 ? upcoming[0].title : trending[0].title}</h2>
                <p className="text-lg text-zinc-300 line-clamp-3 leading-relaxed font-light italic">"{viewMode === 'news' && upcoming.length > 0 ? upcoming[0].overview : trending[0].overview}"</p>
                <div className="flex gap-6 pt-6">
                  <button onClick={() => setSelectedMovie(viewMode === 'news' ? upcoming[0] : trending[0])} className="bg-white text-black font-black px-10 py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-3 text-sm active:scale-95">VIEW DETAILS</button>
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

            {!searchQuery && viewMode === 'home' && (
              <>
                <section>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">2026 Release Schedule <span className="h-px flex-1 bg-zinc-900"></span></h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {trending.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                  </div>
                </section>
              </>
            )}

            {!searchQuery && viewMode === 'news' && (
              <section className="pt-24 md:pt-0">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">Production News <span className="h-px flex-1 bg-zinc-900"></span></h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {upcoming.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                </div>
              </section>
            )}

            {!searchQuery && viewMode === 'blogs' && (
              <section className="pt-24">
                <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-red-600 mb-4">Editorial Guides</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {topRated.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />)}
                </div>
              </section>
            )}
          </main>
        </>
      )}

      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      <div className="fixed bottom-8 right-8 z-30">
        <button onClick={() => setIsAIConciergeOpen(true)} className="w-16 h-16 bg-red-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 group">
          <i className="fa-solid fa-sparkles text-2xl group-hover:rotate-12 transition-transform"></i>
        </button>
      </div>

      <AIConcierge isOpen={isAIConciergeOpen} onClose={() => setIsAIConciergeOpen(false)} onSelectMovie={(m) => { setSelectedMovie(m); setIsAIConciergeOpen(false); }} />
      <Notification message={notification || ''} isVisible={!!notification} onClose={() => setNotification(null)} />

      {/* --- 4. Professional Footer (Purane Code se) --- */}
      <footer className="w-full py-8 bg-zinc-950 text-zinc-500 text-center border-t border-zinc-800 mt-20">
        <p className="text-sm">&copy; 2026 MovieBox - All Trending Hollywood Updates</p>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <a href="/disclaimer" className="hover:text-red-500">Disclaimer</a> | 
          <a href="/privacy" className="hover:text-red-500">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
