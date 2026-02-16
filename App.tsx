import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ==========================================
// 1. TYPES & INTERFACES (Architecture)
// ==========================================
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

// ==========================================
// 2. CONFIGURATION & CONSTANTS
// ==========================================
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const GENRES: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi"
};

const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// ==========================================
// 3. THE DATE ENGINE (Requested Feature)
// ==========================================
const DateEngine = {
  getDaysRemaining: (dateString: string): number => {
    const releaseDate = new Date(dateString);
    const today = new Date();
    const diffTime = releaseDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  formatHumanDate: (dateString: string): string => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  getReleaseLabel: (dateString: string) => {
    const diff = DateEngine.getDaysRemaining(dateString);
    if (diff > 0) return { text: `In ${diff} Days`, color: 'bg-blue-600', isFuture: true };
    if (diff === 0) return { text: "Releasing Today", color: 'bg-green-600', isFuture: true };
    return { text: `Released ${Math.abs(diff)} days ago`, color: 'bg-zinc-800', isFuture: false };
  },

  isNewRelease: (dateString: string): boolean => {
    const diff = DateEngine.getDaysRemaining(dateString);
    return diff < 0 && diff > -30; // Last 30 days
  }
};

// ==========================================
// 4. UI COMPONENTS (Modular)
// ==========================================

// --- Matrix Rain Backdrop ---
const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = canvas.width / 20;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = '15px monospace';
      drops.forEach((y, i) => {
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(render, 33);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-20 pointer-events-none" />;
};

// --- Movie Card Component ---
const MovieCard: React.FC<{ movie: Movie; onClick: (m: Movie) => void }> = ({ movie, onClick }) => {
  const dateInfo = useMemo(() => DateEngine.getReleaseLabel(movie.release_date), [movie.release_date]);
  
  return (
    <div 
      onClick={() => onClick(movie)}
      className="group relative bg-zinc-900 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-zinc-800 hover:border-red-600"
    >
      <div className="aspect-[2/3] relative">
        <img 
          src={getImageUrl(movie.poster_path)} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={movie.title}
        />
        <div className="absolute top-4 right-4">
          <span className={`${dateInfo.color} text-[8px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-full text-white backdrop-blur-md`}>
            {dateInfo.text}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
          <button className="bg-white text-black text-[10px] font-black py-3 rounded-xl uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform">
            Analyze File
          </button>
        </div>
      </div>
      <div className="p-5 space-y-1">
        <h4 className="text-[12px] font-black uppercase text-white truncate">{movie.title}</h4>
        <div className="flex justify-between items-center">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
            {movie.release_date.split('-')[0]} • {GENRES[movie.genre_ids[0]] || 'Cinema'}
          </p>
          <span className="text-red-600 text-[10px] font-black italic">{Math.round(movie.vote_average * 10)}%</span>
        </div>
      </div>
    </div>
  );
};

// --- Detailed Modal ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [data, setData] = useState<{cast: CastMember[], providers: WatchProvider[], video: string | null}>({
    cast: [], providers: [], video: null
  });

  useEffect(() => {
    if (movie) {
      Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`).then(r => r.json()),
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`).then(r => r.json()),
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`).then(r => r.json())
      ]).then(([v, c, p]) => {
        setData({
          video: v.results?.find((x: any) => x.type === 'Trailer')?.key || null,
          cast: c.cast?.slice(0, 12) || [],
          providers: p.results?.US?.flatrate || []
        });
      });
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in zoom-in duration-300">
      <div className="max-w-7xl mx-auto min-h-screen py-20 px-6">
        <button onClick={onClose} className="fixed top-10 right-10 z-[510] bg-white text-black w-14 h-14 rounded-full font-black text-xl hover:bg-red-600 hover:text-white transition-all">✕</button>
        
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="aspect-video bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl">
              {data.video ? (
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${data.video}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
              ) : (
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50" />
              )}
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="bg-red-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest">Confidential File</span>
                <span className="text-zinc-500 font-mono text-xs">ID: {movie.id}-2026</span>
              </div>
              <h2 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">{movie.title}</h2>
              <div className="flex gap-8 border-y border-zinc-800 py-6">
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Release Protocol</p>
                  <p className="text-white font-bold">{DateEngine.formatHumanDate(movie.release_date)}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Critical Rating</p>
                  <p className="text-red-600 font-bold">{movie.vote_average.toFixed(1)} / 10</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Popularity Rank</p>
                  <p className="text-white font-bold">#{Math.round(movie.popularity)}</p>
                </div>
              </div>
              <p className="text-2xl text-zinc-400 font-light italic leading-relaxed">{movie.overview}</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Personnel Involved</h3>
              <div className="grid grid-cols-2 gap-6">
                {data.cast.map(c => (
                  <div key={c.id} className="flex items-center gap-3">
                    <img src={getImageUrl(c.profile_path, 'w92')} className="w-12 h-12 rounded-full object-cover grayscale" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-white truncate uppercase">{c.name}</p>
                      <p className="text-[8px] text-zinc-600 truncate uppercase">{c.character}</p>
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

// ==========================================
// 5. CORE APPLICATION LOGIC
// ==========================================
const App: React.FC = () => {
  // --- States ---
  const [movies, setMovies] = useState<Movie[]>([]);
  const [view, setView] = useState<'trending' | 'upcoming' | 'top'>('trending');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hackerMode, setHackerMode] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  // --- Data Fetching ---
  const loadData = useCallback(async (pageNum: number, currentView: string, isAppend: boolean) => {
    setLoading(true);
    let endpoint = '/trending/movie/day';
    if (currentView === 'upcoming') endpoint = '/movie/upcoming';
    if (currentView === 'top') endpoint = '/movie/top_rated';

    try {
      const res = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&page=${pageNum}`);
      const data = await res.json();
      setMovies(prev => isAppend ? [...prev, ...data.results] : data.results);
      setPage(pageNum);
    } catch (err) {
      console.error("System Override Failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1, view, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view, loadData]);

  // --- Helpers ---
  const filteredMovies = useMemo(() => {
    return movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [movies, searchQuery]);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${hackerMode ? 'bg-black text-green-500' : 'bg-zinc-950 text-white'}`}>
      
      {hackerMode && <MatrixRain />}

      {/* --- NAVIGATION BAR --- */}
      <nav className="fixed top-0 w-full z-[400] px-6 py-8 md:px-16 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-10">
          <h1 
            onClick={() => setView('trending')}
            className="text-4xl font-black italic tracking-tighter text-red-600 cursor-pointer select-none"
          >
            CINEWISE.
          </h1>
          <div className="hidden xl:flex items-center gap-2 bg-black/50 backdrop-blur-3xl p-2 rounded-2xl border border-white/5">
            {['trending', 'upcoming', 'top'].map(tab => (
              <button 
                key={tab}
                onClick={() => setView(tab as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === tab ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Query Database..."
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest focus:border-red-600 outline-none w-64 transition-all focus:w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setHackerMode(!hackerMode)}
            className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${hackerMode ? 'bg-green-600 border-green-400 text-black' : 'bg-zinc-900 border-zinc-800 text-white'}`}
          >
            {hackerMode ? '?' : 'M'}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      {view === 'trending' && !searchQuery && movies[0] && (
        <section className="relative h-screen flex items-center px-6 md:px-24 overflow-hidden select-none">
          <div className="absolute inset-0 z-0">
            <img 
              src={getImageUrl(movies[0].backdrop_path, 'original')} 
              className="w-full h-full object-cover opacity-30 scale-105" 
              alt="Hero Backdrop" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
          </div>

          <div className="relative z-10 max-w-5xl space-y-12">
            <div className="space-y-4">
              <span className="bg-white text-black px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em]">Featured Protocol</span>
              <h2 className="text-8xl md:text-[14rem] font-black italic uppercase tracking-tighter leading-[0.75] text-white">
                {movies[0].title}
              </h2>
            </div>
            <div className="flex gap-6 items-center">
              <button 
                onClick={() => setSelected(movies[0])}
                className="bg-red-600 text-white px-12 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-2xl"
              >
                Access Details
              </button>
              <div className="h-px w-20 bg-zinc-800" />
              <p className="text-zinc-500 font-black text-[10px] uppercase tracking-widest italic">Score: {movies[0].vote_average}/10</p>
            </div>
          </div>
        </section>
      )}

      {/* --- MAIN GRID --- */}
      <main className={`px-6 md:px-16 py-32 transition-all duration-1000 ${view !== 'trending' || searchQuery ? 'mt-20' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.6em] text-red-600">Secure Database</h3>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter">{view} Records</h2>
          </div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-xs text-right">
            Displaying synchronized metadata from global cinematic nodes. Total results: {filteredMovies.length}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 md:gap-12">
          {filteredMovies.map((movie, idx) => (
            <div key={`${movie.id}-${idx}`} className="animate-in fade-in slide-in-from-bottom-10 duration-700" style={{animationDelay: `${idx * 50}ms`}}>
              <MovieCard movie={movie} onClick={setSelected} />
            </div>
          ))}
        </div>

        {/* --- PAGINATION --- */}
        {!searchQuery && (
          <div className="mt-40 flex flex-col items-center gap-10">
            <div className="h-px w-full bg-zinc-900" />
            <button 
              onClick={() => loadData(page + 1, view, true)}
              disabled={loading}
              className="group relative px-20 py-8 bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden transition-all hover:bg-white"
            >
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-white group-hover:text-black">
                {loading ? 'Decrypting...' : 'Load Next Sequence'}
              </span>
            </button>
          </div>
        )}
      </main>

      {/* --- STATS SECTION --- */}
      <section className="bg-zinc-900/30 border-y border-zinc-900 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-20">
          {[
            { label: 'Files Indexed', val: '842,000+' },
            { label: 'Active Uplinks', val: '1,402' },
            { label: 'Data Latency', val: '14ms' },
            { label: 'System Year', val: '2026' }
          ].map(s => (
            <div key={s.label} className="space-y-4 text-center md:text-left">
              <p className="text-5xl md:text-7xl font-black italic tracking-tighter text-white">{s.val}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-zinc-950 pt-40 pb-20 px-6 md:px-16 border-t border-zinc-900">
        <div className="max-w-screen-2xl mx-auto grid md:grid-cols-12 gap-20">
          <div className="md:col-span-4 space-y-10">
            <h4 className="text-4xl font-black italic tracking-tighter text-white">CINEWISE.</h4>
            <p className="text-sm font-bold text-zinc-600 uppercase italic leading-loose">
              Anonymized movie intelligence platform. We provide metadata without tracking.
              For image processing, use <span className="text-red-600 underline cursor-pointer">bgremoverai.online</span> - no login, no cost.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nodes</h5>
            <ul className="space-y-4 text-[11px] font-black uppercase text-zinc-600 italic">
              <li className="hover:text-red-600 cursor-pointer" onClick={() => setView('trending')}>Global Trending</li>
              <li className="hover:text-red-600 cursor-pointer" onClick={() => setView('upcoming')}>Future Archives</li>
              <li className="hover:text-red-600 cursor-pointer" onClick={() => setView('top')}>Historical Best</li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-8">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Security</h5>
            <ul className="space-y-4 text-[11px] font-black uppercase text-zinc-600 italic">
              <li className="hover:text-white cursor-pointer" onClick={() => setShowLegal(true)}>Privacy Protocol</li>
              <li className="hover:text-white cursor-pointer" onClick={() => setShowLegal(true)}>Terms of Access</li>
            </ul>
          </div>

          <div className="md:col-span-4 flex flex-col items-end justify-between">
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 w-full md:w-auto">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Network Status</p>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-tighter">ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
            <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em] mt-10">
              © 2026 CINEWISE DECENTRALIZED NETWORK
            </p>
          </div>
        </div>
      </footer>

      {/* --- MODALS & OVERLAYS --- */}
      <MovieDetailModal movie={selected} onClose={() => setSelected(null)} />
      
      {showLegal && (
        <div className="fixed inset-0 z-[600] bg-black p-10 md:p-40 overflow-y-auto animate-in slide-in-from-top duration-500">
          <div className="max-w-4xl mx-auto space-y-20">
            <h2 className="text-9xl font-black italic uppercase tracking-tighter">Legal</h2>
            <div className="space-y-12 border-l-2 border-red-600 pl-10">
              <p className="text-2xl text-zinc-500 font-light italic">
                CINEWISE is a 2026 cinematic metadata provider. We do not store user data or cookies. 
                Background removal services are recommended via <span className="text-white">bgremoverai.online</span> for privacy-conscious users.
              </p>
              <button onClick={() => setShowLegal(false)} className="bg-white text-black px-10 py-4 font-black uppercase text-[10px] tracking-widest">Back to Console</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
