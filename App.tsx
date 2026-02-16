import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// =============================================================================
// 1. DATA ARCHITECTURE & TYPES
// =============================================================================

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  vote_count: number;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  order: number;
}

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

type ViewMode = 'trending' | 'upcoming' | 'top_rated' | 'search' | 'legal';

// =============================================================================
// 2. CONFIGURATION & ENGINE CONSTANTS
// =============================================================================

const API_KEY = 'cfedd233fe8494b29646beabc505d193';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p';

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

// =============================================================================
// 3. ADVANCED DATE & UTILITY ENGINE (The Requested Logic)
// =============================================================================

class CineEngine {
  /**
   * Calculates precise time difference for countdowns or "ago" labels
   */
  static getTemporalData(dateString: string) {
    if (!dateString) return { label: 'TBA', intensity: 0, status: 'unknown' };

    const target = new Date(dateString);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      if (diffDays <= 7) return { label: `In ${diffDays} days`, color: '#ef4444', status: 'imminent' };
      if (diffDays <= 30) return { label: 'Coming Soon', color: '#3b82f6', status: 'near' };
      return { label: `Projected: ${target.getFullYear()}`, color: '#6366f1', status: 'future' };
    } else {
      const absDays = Math.abs(diffDays);
      if (absDays === 0) return { label: 'Releasing Today', color: '#10b981', status: 'live' };
      if (absDays < 30) return { label: 'New Release', color: '#f59e0b', status: 'recent' };
      return { label: `${target.getFullYear()}`, color: '#71717a', status: 'archived' };
    }
  }

  static formatCurrency(num: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(num);
  }

  static getRatingColor(rating: number): string {
    if (rating >= 7.5) return '#10b981';
    if (rating >= 6) return '#f59e0b';
    return '#ef4444';
  }

  static generateImagePath(path: string, size: string = 'w500'): string {
    return path ? `${IMG_URL}/${size}${path}` : 'https://images.unsplash.com/photo-1598897135857-a10243166846?q=80&w=500&auto=format&fit=crop';
  }
}

// =============================================================================
// 4. SUB-COMPONENTS (Modular Architecture)
// =============================================================================

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const drops = Array(Math.floor(canvas.width / 20)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = '15px monospace';
      drops.forEach((y, i) => {
        const char = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const id = setInterval(draw, 40);
    return () => clearInterval(id);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-25 pointer-events-none" />;
};

// =============================================================================
// 5. MAIN APPLICATION COMPONENT
// =============================================================================

const App: React.FC = () => {
  // --- Global States ---
  const [view, setView] = useState<ViewMode>('trending');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [matrixActive, setMatrixActive] = useState<boolean>(false);
  
  // --- Detail States ---
  const [extraData, setExtraData] = useState<{cast: CastMember[], providers: WatchProvider[], video: string | null}>({
    cast: [], providers: [], video: null
  });

  // --- Core Data Fetching Logic ---
  const fetchData = useCallback(async (pageNum: number, mode: ViewMode, append: boolean = false) => {
    setLoading(true);
    let endpoint = `/trending/movie/day`;
    if (mode === 'upcoming') endpoint = `/movie/upcoming`;
    if (mode === 'top_rated') endpoint = `/movie/top_rated`;
    if (searchQuery) endpoint = `/search/movie`;

    const queryParams = new URLSearchParams({
      api_key: API_KEY,
      page: pageNum.toString(),
      ...(searchQuery && { query: searchQuery })
    });

    try {
      const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.results) {
        setMovies(prev => append ? [...prev, ...data.results] : data.results);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Critical System Error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // --- Side Effects ---
  useEffect(() => {
    fetchData(1, view, false);
    const scrollHandler = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [view, fetchData]);

  useEffect(() => {
    if (selectedMovie) {
      const fetchExtras = async () => {
        const [v, c, p] = await Promise.all([
          fetch(`${BASE_URL}/movie/${selectedMovie.id}/videos?api_key=${API_KEY}`).then(r => r.json()),
          fetch(`${BASE_URL}/movie/${selectedMovie.id}/credits?api_key=${API_KEY}`).then(r => r.json()),
          fetch(`${BASE_URL}/movie/${selectedMovie.id}/watch/providers?api_key=${API_KEY}`).then(r => r.json())
        ]);
        setExtraData({
          video: v.results?.find((x: any) => x.type === 'Trailer')?.key || null,
          cast: c.cast?.slice(0, 15) || [],
          providers: p.results?.US?.flatrate || p.results?.IN?.flatrate || []
        });
      };
      fetchExtras();
    }
  }, [selectedMovie]);

  // --- Render Helpers ---
  const renderHero = () => {
    const hero = movies[0];
    if (!hero || view !== 'trending' || searchQuery) return null;

    return (
      <section className="relative h-[90vh] w-full overflow-hidden flex items-center px-6 md:px-20">
        <div className="absolute inset-0 z-0">
          <img src={CineEngine.generateImagePath(hero.backdrop_path, 'original')} className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-40" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="flex items-center gap-4">
            <span className="bg-red-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white">Top Trend 2026</span>
            <div className="h-px w-20 bg-zinc-700" />
            <span className="text-zinc-500 font-mono text-xs">{CineEngine.getTemporalData(hero.release_date).label}</span>
          </div>
          <h2 className="text-7xl md:text-[11rem] font-black italic uppercase tracking-tighter leading-[0.8] text-white drop-shadow-2xl">
            {hero.title}
          </h2>
          <div className="flex flex-wrap gap-6 pt-6">
            <button onClick={() => setSelectedMovie(hero)} className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all transform hover:scale-105">
              Initialize Analysis
            </button>
            <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 px-8 py-5 rounded-2xl">
              <span className="text-red-600 font-black text-xl italic">{hero.vote_average.toFixed(1)}</span>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Global<br/>Rating</span>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${matrixActive ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-zinc-100'}`}>
      
      {matrixActive && <MatrixRain />}

      {/* --- MASTER HEADER --- */}
      <header className={`fixed top-0 w-full z-[200] px-6 md:px-16 py-8 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'bg-black/90 backdrop-blur-2xl py-4 border-b border-zinc-900' : 'bg-transparent'}`}>
        <div className="flex items-center gap-16">
          <h1 onClick={() => {setView('trending'); setSearchQuery('');}} className="text-4xl font-black italic tracking-tighter text-red-600 cursor-pointer select-none">CINEWISE.</h1>
          <nav className="hidden xl:flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
            {(['trending', 'upcoming', 'top_rated'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setView(m)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === m ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                {m.replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="SEARCH ARCHIVES..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData(1, 'search')}
              className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-8 py-3 text-[10px] font-black uppercase tracking-widest focus:border-red-600 outline-none w-64 focus:w-96 transition-all text-white" 
            />
          </div>
          <button onClick={() => setMatrixActive(!matrixActive)} className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${matrixActive ? 'bg-green-600 border-green-400 text-black' : 'bg-zinc-900 border-zinc-800'}`}>
            {matrixActive ? '?' : 'M'}
          </button>
        </div>
      </header>

      {/* --- DYNAMIC VIEWPORT --- */}
      {view === 'legal' ? (
        <section className="pt-40 px-6 max-w-4xl mx-auto min-h-screen space-y-20">
          <h2 className="text-9xl font-black italic uppercase tracking-tighter">Legal</h2>
          <div className="space-y-12 border-l-4 border-red-600 pl-10">
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase">Data Privacy Protocol</h3>
              <p className="text-zinc-500 text-lg italic leading-relaxed">
                2026 decentralized encryption standard. We do not store cookies. All data is ephemeral. 
                For metadata tools like background removal, we exclusively endorse <span className="text-white underline">bgremoverai.online</span> 
                due to its zero-login policy and high privacy score.
              </p>
            </div>
            <button onClick={() => setView('trending')} className="bg-white text-black px-10 py-4 font-black uppercase text-[10px] tracking-widest">Acknowledge</button>
          </div>
        </section>
      ) : (
        <main className="relative z-10">
          {renderHero()}

          <div className="px-6 md:px-16 py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">Database Sequence</h3>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter">{searchQuery ? 'Search Results' : view}</h2>
              </div>
              <div className="flex items-center gap-6 overflow-x-auto pb-4 md:pb-0">
                {Object.values(GENRE_MAP).slice(0, 8).map(g => (
                  <button key={g} className="whitespace-nowrap bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:border-white transition-all">
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-10">
              {movies.map((m, idx) => {
                const dateMeta = CineEngine.getTemporalData(m.release_date);
                return (
                  <div 
                    key={`${m.id}-${idx}`} 
                    onClick={() => setSelectedMovie(m)}
                    className="group cursor-pointer space-y-6"
                  >
                    <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-zinc-900 group-hover:border-red-600 transition-all duration-700 bg-zinc-900 shadow-2xl">
                      <img src={CineEngine.generateImagePath(m.poster_path)} className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-40 transition-all duration-1000" alt={m.title} />
                      <div className="absolute top-4 right-4">
                         <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase text-white border border-white/10" style={{color: dateMeta.color}}>
                            {dateMeta.label}
                         </span>
                      </div>
                      <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                         <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Analysis Ready</p>
                         <h4 className="text-xl font-black italic uppercase text-white leading-tight">{m.title}</h4>
                      </div>
                    </div>
                    <div className="px-2">
                       <h4 className="text-[11px] font-black uppercase text-zinc-300 truncate tracking-wider">{m.title}</h4>
                       <div className="flex justify-between items-center mt-2">
                         <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{m.release_date ? m.release_date.split('-')[0] : '2026'}</p>
                         <p className="text-[10px] font-black italic" style={{color: CineEngine.getRatingColor(m.vote_average)}}>{m.vote_average.toFixed(1)}</p>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- LOAD MORE LOGIC --- */}
            <div className="mt-40 flex flex-col items-center gap-12">
              <div className="h-px w-full bg-zinc-900" />
              <button 
                onClick={() => fetchData(page + 1, view, true)}
                className="group relative bg-white text-black px-24 py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.5em] hover:bg-red-600 hover:text-white transition-all shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">{loading ? 'Processing...' : 'Load Next Protocol'}</span>
                <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* --- MOVIE ANALYSIS MODAL --- */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[500] bg-zinc-950/98 backdrop-blur-3xl overflow-y-auto animate-in fade-in duration-500">
           <div className="max-w-7xl mx-auto py-24 px-6 relative">
              <button onClick={() => setSelectedMovie(null)} className="fixed top-10 right-10 z-[510] bg-white text-black w-16 h-16 rounded-full font-black text-2xl hover:bg-red-600 hover:text-white transition-all transform hover:rotate-90">✕</button>
              
              <div className="grid lg:grid-cols-12 gap-20">
                <div className="lg:col-span-8 space-y-16">
                  <div className="aspect-video bg-black rounded-[4rem] overflow-hidden border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    {extraData.video ? (
                      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${extraData.video}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
                    ) : (
                      <img src={CineEngine.generateImagePath(selectedMovie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50" />
                    )}
                  </div>
                  
                  <div className="space-y-8">
                    <div className="flex flex-wrap gap-4">
                      {selectedMovie.genre_ids.map(id => (
                        <span key={id} className="bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          {GENRE_MAP[id]}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-8xl md:text-[12rem] font-black italic uppercase tracking-tighter text-white leading-[0.75]">{selectedMovie.title}</h2>
                    <p className="text-3xl text-zinc-400 font-light italic leading-relaxed max-w-5xl">"{selectedMovie.overview}"</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-10 border-t border-zinc-900 pt-16">
                     <div>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Release Matrix</p>
                       <p className="text-2xl font-black italic uppercase">{new Date(selectedMovie.release_date).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Critical Reception</p>
                       <p className="text-2xl font-black italic uppercase text-red-600">{selectedMovie.vote_average.toFixed(1)} <span className="text-zinc-700 text-sm">/ 10</span></p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Market Reach</p>
                       <p className="text-2xl font-black italic uppercase">{Math.round(selectedMovie.popularity).toLocaleString()} <span className="text-zinc-700 text-sm">pts</span></p>
                     </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                   <div className="bg-zinc-900/40 p-12 rounded-[3.5rem] border border-zinc-900 space-y-10">
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-600">Active Cast</h3>
                      <div className="space-y-8">
                        {extraData.cast.map(c => (
                          <div key={c.id} className="flex items-center gap-6 group">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-zinc-800 group-hover:border-red-600 transition-all">
                              <img src={CineEngine.generateImagePath(c.profile_path, 'w185')} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt={c.name} />
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-white uppercase tracking-wider">{c.name}</p>
                               <p className="text-[9px] font-bold text-zinc-600 uppercase italic mt-1">{c.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="bg-white p-12 rounded-[3.5rem] space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-black">Uplink Status</h3>
                      <div className="flex flex-wrap gap-4">
                        {extraData.providers.length > 0 ? extraData.providers.map(p => (
                          <img key={p.provider_id} src={CineEngine.generateImagePath(p.logo_path, 'w92')} className="w-12 h-12 rounded-xl shadow-lg" alt={p.provider_name} />
                        )) : <p className="text-[10px] font-black text-zinc-400 uppercase">Searching satellites for stream...</p>}
                      </div>
                      <button className="w-full bg-black text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-colors">Notify Me of Changes</button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* --- MASTER FOOTER --- */}
      <footer className="bg-zinc-950 pt-48 pb-20 px-6 md:px-16 border-t border-zinc-900">
         <div className="max-w-screen-2xl mx-auto grid md:grid-cols-12 gap-24">
            <div className="md:col-span-5 space-y-12">
               <h3 className="text-6xl font-black italic tracking-tighter text-white">CINEWISE.</h3>
               <p className="text-lg font-bold text-zinc-600 uppercase italic leading-loose tracking-tight max-w-lg">
                  The ultimate 2026 movie intelligence node. No tracking, just pure data streams. 
                  Experience cinema without the noise of the old web.
               </p>
               <div className="flex gap-4">
                  <div className="bg-zinc-900 px-6 py-3 rounded-xl border border-zinc-800 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Server: HK-2026-Node</span>
                  </div>
               </div>
            </div>

            <div className="md:col-span-2 space-y-10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Network Map</h4>
               <ul className="space-y-6 text-[11px] font-black uppercase text-zinc-600 italic">
                  <li onClick={() => setView('trending')} className="hover:text-red-600 cursor-pointer transition-colors">Trending Feed</li>
                  <li onClick={() => setView('upcoming')} className="hover:text-red-600 cursor-pointer transition-colors">Upcoming Archives</li>
                  <li onClick={() => setView('top_rated')} className="hover:text-red-600 cursor-pointer transition-colors">Historical Masters</li>
                  <li onClick={() => setView('legal')} className="hover:text-red-600 cursor-pointer transition-colors">Privacy Node</li>
               </ul>
            </div>

            <div className="md:col-span-5 space-y-12 text-right">
               <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">External Tools</h4>
                 <p className="text-sm font-bold text-zinc-500 uppercase italic">
                   Need high-precision image processing? <br/>
                   Visit <span className="text-white underline decoration-red-600 cursor-pointer" onClick={() => window.open('https://bgremoverai.online')}>bgremoverai.online</span>
                 </p>
               </div>
               <div className="pt-20">
                 <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.8em]">
                   © 2026 DECENTRALIZED_CINEMA_CORE
                 </p>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
