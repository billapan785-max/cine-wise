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

// --- MODAL COMPONENT (TRAILER + SEO CONTEXT) ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (movie) {
      // Fetch Trailer from TMDB
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          setVideoKey(trailer ? trailer.key : null);
        });

      // Fetch Watch Providers (OTT Platforms)
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
    <div className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-xl overflow-y-auto pt-24 pb-10 px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl mx-auto bg-zinc-900 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-zinc-800">
        <button onClick={onClose} className="absolute top-8 right-8 z-[220] bg-black/60 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-2xl">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <div className="flex flex-col">
          <div className="w-full bg-black aspect-video relative">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`} title={movie.title} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full group">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[2000ms]" alt={movie.title} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <button onClick={() => setShowPlayer(true)} className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-2xl flex items-center gap-4 hover:scale-110 transition-all font-black text-xl shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                    <i className="fa-solid fa-play"></i> PLAY TRAILER
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="p-10 md:p-16 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-white">{movie.title}</h2>
              <div className="flex flex-wrap gap-4 items-center text-sm font-bold">
                <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-md">{Math.round(movie.vote_average * 10)}% Match</span>
                <span className="text-zinc-500">{movie.release_date}</span>
                <span className="border border-zinc-700 px-2 py-0.5 rounded text-[10px] text-zinc-400">4K HDR</span>
              </div>
            </div>
            <p className="text-xl md:text-3xl text-zinc-400 font-light leading-relaxed italic">"{movie.overview}"</p>
            {providers.length > 0 && (
              <div className="pt-8 border-t border-zinc-800">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Stream On Official Platforms</p>
                <div className="flex gap-4">
                  {providers.map(p => (
                    <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} className="w-12 h-12 rounded-xl border border-zinc-800" title={p.provider_name} alt={p.provider_name} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'upcoming' | 'disclaimer'>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // SEO: Meta Data Management
  const updateSEOMeta = (movie?: Movie) => {
    if (movie) {
      const slug = movie.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      window.history.pushState({ movieId: movie.id }, '', `/${slug}`);
      document.title = `${movie.title} (2026) - Watch Trailers & News | CineWise`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', `Streaming details and trailers for ${movie.title}. Released: ${movie.release_date}`);
    } else {
      window.history.pushState({}, '', '/');
      document.title = 'CineWise - 2026 Hollywood Movies & Trending Trailers';
      document.querySelector('meta[name="description"]')?.setAttribute('content', 'Explore upcoming 2026 Hollywood movies, trending trailers, and production news.');
    }
  };

  const calculateCountdown = (date: string) => {
    if (!date) return 'TBA 2026';
    const diff = +new Date(date) - +new Date();
    if (diff <= 0) return "Global Release";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} Days to Go`;
  };

  const fetchData = useCallback(async (targetPage: number) => {
    let endpoint = "";
    if (viewMode === 'home') endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    else if (viewMode === 'news') endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    else if (viewMode === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      let results = data.results || [];

      // Logic: Sirf Future Movies for Upcoming Tab
      if (viewMode === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        results = results.filter((m: Movie) => m.release_date > today);
      }

      setMovies(prev => {
        const movieMap = new Map();
        [...prev, ...results].forEach(m => movieMap.set(m.id, m));
        return targetPage === 1 ? results : Array.from(movieMap.values());
      });
      setPage(targetPage);
    } catch (err) { console.error("Fetch Error:", err); }
  }, [viewMode]);

  useEffect(() => {
    fetchData(1);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  const handleMovieClick = (m: Movie) => {
    setSelectedMovie(m);
    updateSEOMeta(m);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
    updateSEOMeta();
  };

  const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`min-h-screen bg-zinc-950 text-white selection:bg-red-600 selection:text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      {/* HEADER */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-700 px-6 md:px-16 py-6 flex items-center justify-between ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/90 border-b border-zinc-900 backdrop-blur-2xl py-4' : 'bg-transparent'}`}>
        <div className="flex items-center gap-12">
          <h1 className="text-3xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => {setViewMode('home'); setPage(1); window.scrollTo(0,0);}}>CINEWISE</h1>
          <nav className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
            <button onClick={() => {setViewMode('home'); setPage(1);}} className={viewMode === 'home' ? 'text-white underline underline-offset-8 decoration-2 decoration-red-600' : 'text-zinc-500 hover:text-white'}>Home</button>
            <button onClick={() => {setViewMode('upcoming'); setPage(1);}} className={viewMode === 'upcoming' ? 'text-white underline underline-offset-8 decoration-2 decoration-red-600' : 'text-zinc-500 hover:text-white'}>Upcoming</button>
            <button onClick={() => {setViewMode('news'); setPage(1);}} className={viewMode === 'news' ? 'text-white underline underline-offset-8 decoration-2 decoration-red-600' : 'text-zinc-500 hover:text-white'}>2026 News</button>
          </nav>
        </div>
        <div className="relative group">
          <input type="text" placeholder="SEARCH MOVIES..." className="bg-zinc-900/50 border border-zinc-800 rounded-full py-3 px-12 text-[10px] w-48 md:w-96 outline-none focus:ring-2 focus:ring-red-600/50 focus:bg-zinc-900 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
        </div>
      </header>

      {viewMode === 'disclaimer' ? (
        <div className="pt-40 px-6 max-w-5xl mx-auto min-h-screen space-y-10">
          <h1 className="text-6xl font-black italic tracking-tighter">LEGAL DISCLAIMER</h1>
          <div className="space-y-6 text-xl text-zinc-500 font-light leading-relaxed italic">
            <p>CineWise is an AI-powered movie information database. We do not host or upload any video files, movies, or copyrighted content. All movie metadata, posters, and trailers are pulled from the official TMDB (The Movie Database) and YouTube APIs.</p>
            <p>Our platform is designed for news, educational, and research purposes regarding 2026 cinema trends. For official streaming, please use the links provided to authorized platforms like Netflix, Disney+, or Amazon Prime.</p>
          </div>
          <button onClick={() => setViewMode('home')} className="bg-white text-black px-12 py-4 rounded-full font-black text-xs hover:bg-red-600 hover:text-white transition-all">RETURN TO HOME</button>
        </div>
      ) : (
        <>
          {/* HERO SECTION */}
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-[90vh] w-full flex items-center px-6 md:px-20 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px] opacity-40" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
              <div className="relative max-w-4xl space-y-8">
                <span className="bg-red-600 text-[10px] font-black px-4 py-1 rounded-full tracking-[0.3em]">TRENDING NOW</span>
                <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">{movies[0].title}</h2>
                <div className="flex gap-4">
                  <button onClick={() => handleMovieClick(movies[0])} className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-2xl text-sm">EXPLORE MOVIE</button>
                </div>
              </div>
            </section>
          )}

          {/* MOVIE GRID */}
          <main className="px-6 md:px-16 py-24 min-h-screen">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-6">
                {viewMode === 'home' ? 'Global Trending' : viewMode === 'upcoming' ? 'Coming Soon 2026' : 'Industry News'}
                <span className="h-px w-40 bg-zinc-900"></span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {filteredMovies.map(m => (
                <div key={m.id} onClick={() => handleMovieClick(m)} className="group cursor-pointer space-y-4">
                  <div className="aspect-[2/3] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 relative shadow-2xl group-hover:border-red-600/50 transition-all">
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-40" alt={m.title} />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <p className="text-xs font-black uppercase italic leading-tight mb-2">{m.title}</p>
                      <p className="text-[9px] text-red-500 font-bold tracking-[0.2em] uppercase">⏳ {calculateCountdown(m.release_date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {!searchQuery && (
              <div className="flex flex-col items-center justify-center mt-24 gap-6">
                <p className="text-[10px] font-bold text-zinc-700 tracking-widest uppercase">Showing {movies.length} exclusive titles</p>
                <button onClick={() => fetchData(page + 1)} className="bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white font-black px-16 py-5 rounded-3xl transition-all active:scale-95 shadow-2xl text-xs tracking-widest">
                  LOAD MORE UPDATES
                </button>
              </div>
            )}
          </main>
        </>
      )}

      <MovieDetailModal movie={selectedMovie} onClose={handleCloseModal} />

      {/* FOOTER */}
      <footer className="py-20 bg-zinc-950 text-center border-t border-zinc-900 mt-20">
        <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Disclaimer</button>
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Privacy Policy</button>
          <button className="hover:text-red-600 transition-colors">DMCA</button>
        </div>
        <p className="text-xs text-zinc-800 font-bold tracking-tighter">CINEWISE &copy; 2026 - THE NEXT GENERATION OF CINEMA DISCOVERY</p>
      </footer>
    </div>
  );
};

export default App;
