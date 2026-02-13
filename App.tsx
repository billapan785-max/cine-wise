
import React, { useState, useEffect, useCallback } from 'react';
import { Movie } from './types';
import { getTrendingMovies, getPopularMovies, searchMovies, getImageUrl, getMovieById } from './services/tmdbService';
import MovieCard from './components/MovieCard';
import MovieDetailModal from './components/MovieDetailModal';
import AIConcierge from './components/AIConcierge';
import Notification from './components/Notification';

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

  // Intelligent base path detection
  const getBasePath = () => {
    const path = window.location.pathname;
    const movieIndex = path.indexOf('/movie/');
    if (movieIndex !== -1) {
      return path.substring(0, movieIndex) || '/';
    }
    return path.endsWith('/') ? path : `${path}/`;
  };

  const parseIdFromPath = (path: string): number | null => {
    // Look for movie/ID pattern anywhere in the path
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
        getTrendingMovies().catch(() => []),
        getPopularMovies().catch(() => [])
      ]);
      setTrending(trendingData);
      setPopular(popularData);
      await handleRoute();
    } catch (error) {
      console.error("Error fetching data", error);
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

  // Sync state to URL with base-path awareness
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
      console.debug('History update skipped (Environment limitation)');
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

  const closeMoviePage = () => {
    setSelectedMovie(null);
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

          <form onSubmit={handleSearch} className="flex items-center relative group" role="search">
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
        onClose={closeMoviePage} 
      />

      <div className="fixed bottom-8 right-8 z-40">
        <button onClick={() => setIsAIConciergeOpen(true)} className="w-16 h-16 bg-red-600 text-white rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.4)] flex items-center justify-center hover:scale-110 transition-all active:scale-95 group"><i className="fa-solid fa-sparkles text-2xl group-hover:rotate-12 transition-transform"></i></button>
      </div>

      <AIConcierge isOpen={isAIConciergeOpen} onClose={() => setIsAIConciergeOpen(false)} onSelectMovie={(m) => { setSelectedMovie(m); setIsAIConciergeOpen(false); }} />
      <Notification message={notification || ''} isVisible={!!notification} onClose={() => setNotification(null)} />
    </div>
  );
};

export default App;
