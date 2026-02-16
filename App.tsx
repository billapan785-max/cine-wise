import React, { useState, useEffect, useCallback } from 'react';

// --- TYPES & INTERFACES ---
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

// --- CONFIGURATION & UTILS ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=200&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- MOVIE DETAIL MODAL (TRAILER + CAST + OTT LOGIC) ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (movie) {
      // 1. Fetch Trailer Data
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          setVideoKey(trailer ? trailer.key : null);
        });

      // 2. Fetch Global Watch Providers
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const results = data.results?.US?.flatrate || data.results?.IN?.flatrate || [];
          setProviders(results.slice(0, 3));
        });

      // 3. Fetch Full Cast Details
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
    <div className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-3xl overflow-y-auto pt-24 pb-10 px-4 animate-in fade-in duration-700">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl mx-auto bg-zinc-900 rounded-[3.5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.9)] border border-zinc-800 transition-all">
        <button onClick={onClose} className="absolute top-10 right-10 z-[220] bg-black/60 hover:bg-red-600 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-2xl hover:rotate-90">
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>
        <div className="flex flex-col">
          <div className="w-full bg-black aspect-video relative group">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&showinfo=0`} title={movie.title} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full overflow-hidden">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[4000ms] ease-out" alt={movie.title} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                     <i className="fa-solid fa-play text-3xl text-white ml-2"></i>
                  </div>
                  <button onClick={() => setShowPlayer(true)} className="bg-white text-black px-12 py-5 rounded-2xl flex items-center gap-4 hover:bg-red-600 hover:text-white transition-all font-black text-xl tracking-tighter uppercase">
                    Launch Official Trailer
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="p-10 md:p-20 space-y-16">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-2xl">{movie.title}</h2>
              <div className="flex flex-wrap gap-6 text-sm font-bold items-center">
                <span className="text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">{Math.round(movie.vote_average * 10)}% Audience Score</span>
                <span className="text-zinc-400 bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-700/50 uppercase tracking-widest">{movie.release_date}</span>
                <span className="text-red-500 font-black tracking-widest border-l border-zinc-800 pl-6 uppercase">Exclusive 2026 Access</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-12 border-t border-zinc-800/50 pt-12">
              <div className="md:col-span-2 space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">The Storyline</h3>
                <p className="text-xl md:text-3xl text-zinc-300 font-light leading-relaxed italic antialiased">"{movie.overview}"</p>
              </div>
              <div className="space-y-8">
                 <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">Available Platforms</h3>
                 <div className="flex flex-wrap gap-4">
                  {providers.length > 0 ? providers.map(p => (
                    <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} className="w-14 h-14 rounded-2xl border border-zinc-700 shadow-xl hover:scale-110 transition-transform" alt={p.provider_name} />
                  )) : <p className="text-xs text-zinc-600 font-bold uppercase italic">Check local listings for digital release</p>}
                 </div>
              </div>
            </div>
            
            <div className="space-y-10 border-t border-zinc-800/50 pt-12">
              <h3 className="text-xs font-black uppercase tracking-[0.6em] text-red-600 flex items-center gap-8">
                Main Production Cast <span className="h-px flex-1 bg-zinc-800"></span>
              </h3>
              <div className="flex gap-10 overflow-x-auto pb-8 scrollbar-hide snap-x">
                {cast.map(person => (
                  <div key={person.id} className="flex-shrink-0 w-32 md:w-44 text-center space-y-5 group/actor snap-center">
                    <div className="relative overflow-hidden rounded-full aspect-square border-4 border-zinc-800 group-hover/actor:border-red-600 transition-all duration-500 shadow-2xl">
                       <img src={getImageUrl(person.profile_path, 'w185')} className="w-full h-full object-cover group-hover/actor:scale-125 transition-transform duration-700" alt={person.name} />
                    </div>
                    <div>
                      <p className="text-[12px] font-black uppercase text-white leading-tight tracking-tighter">{person.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase italic tracking-tighter mt-1">{person.character}</p>
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

// --- MAIN APPLICATION LOGIC ---
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'upcoming' | 'disclaimer'>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleOpenMovie = (m: Movie) => {
    setSelectedMovie(m);
    const slug = m.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    window.history.pushState({ movieId: m.id }, '', `/${slug}`);
    document.title = `${m.title} (2026) - Full Cast, Trailer & Info | CineWise`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', `Explore official cast, production news and trailer for ${m.title}. Ready for 2026 release.`);
  };

  const handleCloseMovie = () => {
    setSelectedMovie(null);
    window.history.pushState({}, '', '/');
    document.title = 'CineWise - 2026 Hollywood Trend Discovery Platform';
  };

  const calculateCountdown = (date: string) => {
    if (!date) return 'Coming 2026';
    const diff = +new Date(date) - +new Date();
    if (diff <= 0) return "Global Release";
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} Days Remaining`;
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

  return (
    <div className={`min-h-screen bg-zinc-950 text-white selection:bg-red-600 selection:text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-1000 px-6 md:px-20 py-8 flex items-center justify-between ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/90 border-b border-zinc-900 backdrop-blur-3xl py-5' : 'bg-transparent'}`}>
        <div className="flex items-center gap-16">
          <h1 className="text-4xl font-black text-red-600 italic tracking-tighter cursor-pointer hover:scale-105 transition-transform" onClick={() => {setViewMode('home'); setPage(1); handleCloseMovie();}}>CINEWISE</h1>
          <nav className="hidden lg:flex gap-10 text-[11px] font-black uppercase tracking-[0.3em]">
            <button onClick={() => {setViewMode('home'); setPage(1);}} className={viewMode === 'home' ? 'text-white border-b-2 border-red-600' : 'text-zinc-600 hover:text-white'}>Discovery</button>
            <button onClick={() => {setViewMode('upcoming'); setPage(1);}} className={viewMode === 'upcoming' ? 'text-white border-b-2 border-red-600' : 'text-zinc-600 hover:text-white'}>Coming 2026</button>
            <button onClick={() => {setViewMode('news'); setPage(1);}} className={viewMode === 'news' ? 'text-white border-b-2 border-red-600' : 'text-zinc-600 hover:text-white'}>Industry News</button>
          </nav>
        </div>
        <div className="relative">
           <input type="text" placeholder="GLOBAL DATABASE SEARCH..." className="bg-zinc-900/60 border border-zinc-800 rounded-full py-4 px-14 text-[11px] w-64 md:w-[28rem] outline-none focus:ring-2 focus:ring-red-600/40 transition-all font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 text-sm"></i>
        </div>
      </header>

      {viewMode === 'disclaimer' ? (
        <div className="pt-48 px-6 max-w-6xl mx-auto min-h-screen space-y-16 animate-in slide-in-from-bottom-10 duration-1000">
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white">LEGAL & PRIVACY</h1>
          <div className="space-y-10 text-2xl text-zinc-500 font-light italic leading-relaxed border-l-4 border-red-600 pl-10">
            <p>CineWise is a next-generation cinema intelligence platform. We provide metadata, trailers, and production news via TMDB and YouTube API ecosystems. Our site does not host, store, or transmit any copyrighted video files.</p>
            <p>Purpose: Educational research, cinema trend analysis for the year 2026, and community discussion. All intellectual properties belong to their respective studios and production houses.</p>
          </div>
          <button onClick={() => setViewMode('home')} className="bg-white text-black px-16 py-6 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all shadow-2xl uppercase tracking-widest">Return to Database</button>
        </div>
      ) : (
        <>
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-screen w-full flex items-center px-6 md:px-24 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px] scale-105" alt="Feature" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
              <div className="relative max-w-5xl space-y-10">
                <span className="bg-red-600 text-[11px] font-black px-6 py-2 rounded-full tracking-[0.4em] uppercase">Breaking 2026 Update</span>
                <h2 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.85] text-white">{movies[0].title}</h2>
                <button onClick={() => handleOpenMovie(movies[0])} className="bg-white text-black font-black px-16 py-6 rounded-[2rem] hover:bg-red-600 hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] text-sm tracking-widest uppercase">Explore This Title</button>
              </div>
            </section>
          )}

          <main className="px-6 md:px-20 py-32 min-h-screen">
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-700 mb-20 flex items-center gap-10">
              {viewMode === 'home' ? 'Trending Discovery' : viewMode === 'upcoming' ? '2026 Roadmap' : 'Production Feeds'} <span className="h-px flex-1 bg-zinc-900/50"></span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                <div key={m.id} onClick={() => handleOpenMovie(m)} className="group cursor-pointer">
                  <div className="aspect-[2/3] overflow-hidden rounded-[2.5rem] border-2 border-zinc-900 bg-zinc-900 relative shadow-2xl group-hover:border-red-600/40 transition-all duration-500">
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-30" alt={m.title} />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0">
                      <p className="text-sm font-black uppercase italic leading-tight mb-3 text-white">{m.title}</p>
                      <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase">⏳ {calculateCountdown(m.release_date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!searchQuery && (
              <div className="flex justify-center mt-32">
                <button onClick={() => fetchData(page + 1)} className="group bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white font-black px-20 py-7 rounded-[2.5rem] transition-all text-xs tracking-[0.4em] shadow-2xl active:scale-95 flex items-center gap-4 uppercase">
                  Explore More <i className="fa-solid fa-chevron-down group-hover:translate-y-1 transition-transform"></i>
                </button>
              </div>
            )}
          </main>
        </>
      )}

      <MovieDetailModal movie={selectedMovie} onClose={handleCloseMovie} />

      <footer className="py-24 bg-zinc-950 text-center border-t border-zinc-900 mt-20">
        <div className="flex justify-center gap-16 text-[11px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-10">
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Legal</button>
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Privacy</button>
          <button className="hover:text-red-600 transition-colors">DMCA</button>
        </div>
        <p className="text-xs text-zinc-800 font-bold tracking-tighter">CINEWISE &copy; 2026 - THE ULTIMATE CINEMA DATABASE</p>
      </footer>
    </div>
  );
};

export default App;
