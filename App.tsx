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

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
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

const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=200&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- MODAL COMPONENT (TRAILERS + CAST + OTT) ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (movie) {
      // 1. Fetch Trailer
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          setVideoKey(trailer ? trailer.key : null);
        });

      // 2. Fetch Providers
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const results = data.results?.US?.flatrate || data.results?.IN?.flatrate || [];
          setProviders(results.slice(0, 3));
        });

      // 3. Fetch Cast (NEW FEATURE)
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          setCast(data.cast?.slice(0, 10) || []);
        });
    } else {
      setVideoKey(null);
      setProviders([]);
      setCast([]);
      setShowPlayer(false);
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-2xl overflow-y-auto pt-24 pb-10 px-4 animate-in fade-in duration-500">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl mx-auto bg-zinc-900 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-zinc-800">
        <button onClick={onClose} className="absolute top-8 right-8 z-[220] bg-black/60 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <div className="flex flex-col">
          <div className="w-full bg-black aspect-video relative">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`} title={movie.title} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full group">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[3000ms]" alt={movie.title} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={() => setShowPlayer(true)} className="bg-red-600 text-white px-12 py-6 rounded-2xl flex items-center gap-4 hover:scale-110 transition-all font-black text-xl shadow-2xl">
                    <i className="fa-solid fa-play"></i> WATCH TRAILER
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="p-10 md:p-16 space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-8xl font-black uppercase italic tracking-tighter leading-none text-white">{movie.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm font-bold items-center">
                <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-md">{Math.round(movie.vote_average * 10)}% Match</span>
                <span className="text-zinc-500">{movie.release_date}</span>
                <span className="border border-zinc-700 px-2 py-0.5 rounded text-[10px] text-zinc-400">ULTRA HD</span>
              </div>
            </div>
            <p className="text-xl md:text-3xl text-zinc-400 font-light leading-relaxed italic">"{movie.overview}"</p>
            
            {/* CAST SECTION */}
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-600 flex items-center gap-6">
                Leading Cast <span className="h-px flex-1 bg-zinc-800"></span>
              </h3>
              <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
                {cast.map(person => (
                  <div key={person.id} className="flex-shrink-0 w-28 md:w-36 text-center space-y-4 group/actor">
                    <img src={getImageUrl(person.profile_path, 'w185')} className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-full border-2 border-zinc-800 group-hover/actor:border-red-600 transition-all shadow-xl" alt={person.name} />
                    <div>
                      <p className="text-[11px] font-black uppercase text-white leading-tight">{person.name}</p>
                      <p className="text-[9px] text-zinc-500 uppercase italic tracking-tighter">{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

  // SEO: History & Meta Logic
  const handleOpenMovie = (m: Movie) => {
    setSelectedMovie(m);
    const slug = m.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    window.history.pushState({ movieId: m.id }, '', `/${slug}`);
    document.title = `${m.title} (2026) - Watch Trailers & Cast | CineWise`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', `Full cast, trailer, and release details for ${m.title}.`);
  };

  const handleCloseMovie = () => {
    setSelectedMovie(null);
    window.history.pushState({}, '', '/');
    document.title = 'CineWise - 2026 Hollywood Movies & Trending Trailers';
  };

  const calculateCountdown = (date: string) => {
    if (!date) return 'TBA 2026';
    const diff = +new Date(date) - +new Date();
    if (diff <= 0) return "Global Release";
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} Days to Go`;
  };

  const fetchData = useCallback(async (targetPage: number) => {
    let endpoint = "";
    if (viewMode === 'home') endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    else if (viewMode === 'news') endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    else if (viewMode === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    
    const res = await fetch(endpoint);
    const data = await res.json();
    let results = data.results || [];

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
  }, [viewMode]);

  useEffect(() => {
    fetchData(1);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  const filtered = movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`min-h-screen bg-zinc-950 text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      {/* HEADER */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-700 px-6 md:px-16 py-6 flex items-center justify-between ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/90 border-b border-zinc-900 backdrop-blur-2xl py-4' : 'bg-transparent'}`}>
        <div className="flex items-center gap-12">
          <h1 className="text-3xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => {setViewMode('home'); setPage(1); handleCloseMovie();}}>CINEWISE</h1>
          <nav className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
            <button onClick={() => {setViewMode('home'); setPage(1);}} className={viewMode === 'home' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500'}>Home</button>
            <button onClick={() => {setViewMode('upcoming'); setPage(1);}} className={viewMode === 'upcoming' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500'}>Upcoming</button>
            <button onClick={() => {setViewMode('news'); setPage(1);}} className={viewMode === 'news' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500'}>2026 News</button>
          </nav>
        </div>
        <input type="text" placeholder="SEARCH..." className="bg-zinc-900 border border-zinc-800 rounded-full py-3 px-12 text-[10px] w-48 md:w-96 outline-none focus:ring-2 focus:ring-red-600/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </header>

      {viewMode === 'disclaimer' ? (
        <div className="pt-40 px-6 max-w-5xl mx-auto min-h-screen space-y-12 animate-in fade-in duration-700">
          <h1 className="text-6xl font-black italic tracking-tighter">DISCLAIMER & DMCA</h1>
          <p className="text-2xl text-zinc-500 font-light italic leading-relaxed">CineWise is an AI-driven discovery platform. We do not host copyrighted files. All data is sourced via official TMDB and YouTube APIs for research and news purposes regarding 2026 cinema trends.</p>
          <button onClick={() => setViewMode('home')} className="bg-white text-black px-12 py-5 rounded-full font-black text-xs hover:bg-red-600 hover:text-white transition-all">BACK TO HOME</button>
        </div>
      ) : (
        <>
          {/* HERO BANNER */}
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-[90vh] w-full flex items-center px-6 md:px-20 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[1px]" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="relative max-w-4xl space-y-8">
                <span className="bg-red-600 text-[10px] font-black px-4 py-1 rounded-full tracking-widest">GLOBAL TRENDING</span>
                <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">{movies[0].title}</h2>
                <button onClick={() => handleOpenMovie(movies[0])} className="bg-white text-black font-black px-14 py-5 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-2xl text-sm">VIEW DETAILS</button>
              </div>
            </section>
          )}

          {/* MAIN GRID */}
          <main className="px-6 md:px-16 py-24 min-h-screen">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-12 flex items-center gap-6">
              {viewMode === 'home' ? 'Trending' : viewMode === 'upcoming' ? 'Upcoming' : 'News'} <span className="h-px flex-1 bg-zinc-900"></span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
              {filtered.map(m => (
                <div key={m.id} onClick={() => handleOpenMovie(m)} className="group cursor-pointer">
                  <div className="aspect-[2/3] overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 relative shadow-2xl group-hover:border-red-600/50 transition-all">
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-40" alt={m.title} />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <p className="text-xs font-black uppercase italic leading-tight mb-2">{m.title}</p>
                      <p className="text-[9px] text-red-500 font-bold tracking-widest uppercase">⏳ {calculateCountdown(m.release_date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!searchQuery && (
              <div className="flex justify-center mt-24">
                <button onClick={() => fetchData(page + 1)} className="bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white font-black px-16 py-6 rounded-[2rem] transition-all text-xs tracking-[0.2em] shadow-2xl active:scale-95">LOAD MORE UPDATES</button>
              </div>
            )}
          </main>
        </>
      )}

      <MovieDetailModal movie={selectedMovie} onClose={handleCloseMovie} />

      {/* FOOTER */}
      <footer className="py-24 bg-zinc-950 text-center border-t border-zinc-900">
        <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Disclaimer</button>
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Privacy Policy</button>
        </div>
        <p className="text-xs text-zinc-800 font-bold tracking-tighter">CINEWISE &copy; 2026 - THE NEXT GENERATION OF CINEMA DISCOVERY</p>
      </footer>
    </div>
  );
};

export default App;
