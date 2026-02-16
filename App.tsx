import React, { useState, useEffect, useCallback } from 'react';

// --- TYPES ---
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
}

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// --- CONFIGURATION ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getImageUrl = (path: string, size: 'w92' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- MODAL COMPONENT (WITH PLAYER & PROVIDERS) ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (movie) {
      // Fetch Trailer
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          setVideoKey(trailer ? trailer.key : null);
        });

      // Fetch Watch Providers
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const results = data.results?.US?.flatrate || data.results?.IN?.flatrate || [];
          setProviders(results.slice(0, 3));
        });
    } else {
      setVideoKey(null);
      setProviders([]);
      setShowPlayer(false);
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-md overflow-y-auto pt-24 pb-10 px-4">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl mx-auto bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-5 right-5 z-[220] bg-black/50 hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-xl">
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="flex flex-col">
          <div className="w-full bg-black aspect-video relative">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} title="Trailer" frameBorder="0" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full group">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-60" alt={movie.title} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={() => setShowPlayer(true)} className="bg-red-600 text-white px-8 py-4 rounded-full flex items-center gap-3 hover:scale-110 transition-transform font-black shadow-2xl">
                    <i className="fa-solid fa-play"></i> WATCH TRAILER
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="p-8 md:p-12">
            <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none">{movie.title}</h2>
            <div className="flex flex-wrap gap-6 mb-8 items-center">
              <div className="flex gap-4 text-sm font-bold border-r border-zinc-800 pr-6">
                <span className="text-green-500">{Math.round(movie.vote_average * 10)}% Match</span>
                <span className="text-zinc-400">{movie.release_date?.split('-')[0]}</span>
              </div>
              {providers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Available On:</span>
                  {providers.map(p => (
                    <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} className="w-8 h-8 rounded shadow border border-zinc-700" title={p.provider_name} alt={p.provider_name} />
                  ))}
                </div>
              )}
            </div>
            <p className="text-lg md:text-2xl text-zinc-300 italic font-light leading-relaxed">"{movie.overview}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'upcoming' | 'disclaimer'>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- LOGIC: SEO & URL ---
  const handleOpenMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    const slug = movie.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    window.history.pushState({ movieId: movie.id }, '', `/${slug}`);
    document.title = `${movie.title} (2026) - Watch Trailers & News on CineWise`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', `Get details for ${movie.title}. Release date: ${movie.release_date}. Overview: ${movie.overview.slice(0, 150)}...`);
  };

  const handleCloseMovie = () => {
    setSelectedMovie(null);
    window.history.pushState({}, '', '/');
    document.title = 'CineWise - 2026 Trending Hollywood Updates';
  };

  const calculateCountdown = (date: string) => {
    if (!date) return 'TBA 2026';
    const diff = +new Date(date) - +new Date();
    if (diff <= 0) return "Released";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} Days to Go`;
  };

  const fetchData = useCallback(async (page: number = 1) => {
    let endpoint = "";
    if (viewMode === 'home') endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${page}`;
    else if (viewMode === 'news') endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
    else if (viewMode === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
    
    const res = await fetch(endpoint);
    const data = await res.json();
    
    let filteredResults = data.results;
    if (viewMode === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      filteredResults = data.results.filter((m: Movie) => m.release_date > today);
    }

    setMovies(prev => page === 1 ? filteredResults : [...prev, ...filteredResults]);
  }, [viewMode]);

  useEffect(() => {
    fetchData(1);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  const displayedMovies = searchQuery.length > 2 
    ? movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : movies;

  return (
    <div className={`min-h-screen bg-zinc-950 text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      {/* --- HEADER --- */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/95 border-b border-zinc-900 backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="flex items-center gap-10">
          <h1 className="text-2xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => {setViewMode('home'); setSearchQuery(''); handleCloseMovie();}}>CINEWISE</h1>
          <nav className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <button onClick={() => setViewMode('home')} className={viewMode === 'home' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500 hover:text-white'}>Home</button>
            <button onClick={() => setViewMode('upcoming')} className={viewMode === 'upcoming' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500 hover:text-white'}>Upcoming</button>
            <button onClick={() => setViewMode('news')} className={viewMode === 'news' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500 hover:text-white'}>2026 News</button>
          </nav>
        </div>
        <div className="relative">
          <input type="text" placeholder="SEARCH MOVIES..." className="bg-zinc-900/80 border border-zinc-800 rounded-full py-2 px-10 text-[10px] w-40 md:w-80 outline-none focus:ring-1 focus:ring-red-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
        </div>
      </header>

      {viewMode === 'disclaimer' ? (
        <div className="pt-32 px-6 max-w-4xl mx-auto min-h-screen animate-in fade-in duration-500">
          <h1 className="text-4xl font-black italic mb-6">DISCLAIMER & PRIVACY</h1>
          <p className="text-zinc-400 italic leading-relaxed">CineWise is a movie discovery platform. All trailer content and movie data are served via official YouTube and TMDB APIs. We do not host copyrighted files on our servers. This site is for educational and news purposes regarding 2026 cinema trends.</p>
          <button onClick={() => setViewMode('home')} className="mt-8 text-red-600 font-bold hover:underline">← BACK TO DISCOVERY</button>
        </div>
      ) : (
        <>
          {/* --- HERO BANNER --- */}
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-[80vh] w-full flex items-center px-6 md:px-16 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              <div className="relative max-w-3xl space-y-6">
                <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">{movies[0].title}</h2>
                <button onClick={() => handleOpenMovie(movies[0])} className="bg-white text-black font-black px-10 py-4 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-2xl">VIEW DETAILS</button>
              </div>
            </section>
          )}

          {/* --- MAIN GRID --- */}
          <main className="px-6 md:px-12 py-20 min-h-screen">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">
              {searchQuery ? 'Search Results' : viewMode === 'home' ? 'Trending Global' : viewMode === 'upcoming' ? 'Upcoming 2026' : 'Production News'}
              <span className="h-px flex-1 bg-zinc-800"></span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {displayedMovies.map(m => (
                <div key={m.id} onClick={() => handleOpenMovie(m)} className="relative group cursor-pointer transition-all hover:scale-105">
                  <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg relative">
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:opacity-20 transition-opacity" alt={m.title} />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black">
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className="text-[10px] font-black uppercase italic leading-none">{m.title}</span>
                        <span className="text-[8px] text-red-500 font-bold tracking-widest uppercase">
                          ⏳ {calculateCountdown(m.release_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- LOAD MORE --- */}
            {!searchQuery && (
              <div className="flex justify-center mt-16 mb-10">
                <button 
                  onClick={() => fetchData((movies.length / 20) + 1)} 
                  className="bg-zinc-900 hover:bg-red-600 border border-zinc-800 text-white font-black px-12 py-4 rounded-2xl transition-all active:scale-95 shadow-xl tracking-widest text-xs"
                >
                  LOAD MORE MOVIES
                </button>
              </div>
            )}
          </main>
        </>
      )}

      {/* --- MODAL --- */}
      <MovieDetailModal movie={selectedMovie} onClose={handleCloseMovie} />

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-zinc-950 text-center border-t border-zinc-900">
        <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Disclaimer</button>
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Privacy Policy</button>
        </div>
        <p className="text-xs text-zinc-700 font-bold tracking-tighter">&copy; 2026 CINEWISE - EXPLORE TRENDING MOVIES</p>
      </footer>
    </div>
  );
};

export default App;
