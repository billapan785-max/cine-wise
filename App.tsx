import React, { useState, useEffect, useCallback, useRef } from 'react';

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

// --- CONFIGURATION ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=200&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- FEATURE: SPOILER ROULETTE ---
const SpoilerRoulette: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [spoiler, setSpoiler] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const leaks = [
    "SCREAM 7: The killer is actually a fan of the original 'Stab' movies.",
    "AVATAR 3: Varang, the leader of the Ash People, will survive until the 5th movie.",
    "SPIDER-MAN 4: Miles Morales will make a 5-second cameo in the post-credits.",
    "JOKER 2: The ending features a massive musical number inside a burning hospital.",
    "BEYOND THE SPIDER-VERSE: Production uses a new AI engine for 2026."
  ];
  const spin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setSpoiler(leaks[Math.floor(Math.random() * leaks.length)]);
      setIsSpinning(false);
    }, 1200);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-zinc-900 border-2 border-yellow-500 rounded-[3.5rem] p-8 md:p-12 text-center space-y-10 shadow-[0_0_100px_rgba(234,179,8,0.15)]">
        <h3 className="text-4xl md:text-5xl font-black italic text-yellow-500 uppercase tracking-tighter">Movie Spoilers</h3>
        <div className="py-12 border-y border-zinc-800">
          <p className={`text-xl md:text-2xl font-bold italic transition-all duration-500 ${isSpinning ? 'opacity-20 blur-xl scale-90' : 'opacity-100 text-white'}`}>
            {spoiler || "Want to see 2026 movie leaks?"}
          </p>
        </div>
        <div className="space-y-4">
          <button onClick={spin} className="w-full bg-yellow-500 text-black font-black py-7 rounded-[2rem] hover:scale-105 transition-all uppercase tracking-widest text-sm">Show Spoiler</button>
          <button onClick={onClose} className="text-zinc-600 uppercase font-black text-[10px] tracking-[0.4em] hover:text-white">Go Back</button>
        </div>
      </div>
    </div>
  );
};

// --- FEATURE: VIBE MATCHER ---
const VibeMatcher: React.FC<{onClose: () => void}> = ({onClose}) => {
  const moods = [
    { name: 'Villain Era', desc: 'Powerful, dark, and misunderstood.' },
    { name: 'Lonely God', desc: 'Melancholic excellence in solitude.' },
    { name: 'Main Character', desc: 'The world revolves around you.' },
    { name: 'Cyberpunk Soul', desc: 'High tech, low life, neon dreams.' }
  ];
  const [match, setMatch] = useState<{name: string, desc: string} | null>(null);
  return (
    <div className="fixed inset-0 z-[600] bg-zinc-950/98 flex items-center justify-center p-6 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 text-black space-y-12 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
        <h3 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-center">Vibe Check</h3>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {moods.map(m => (
            <button key={m.name} onClick={() => setMatch(m)} className="border-2 border-black py-6 rounded-[2rem] font-black uppercase text-[10px] hover:bg-black hover:text-white transition-all">
              {m.name}
            </button>
          ))}
        </div>
        {match && (
          <div className="bg-zinc-100 p-8 rounded-[2.5rem] text-center border-2 border-black/5 animate-in zoom-in duration-500">
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">Your Persona</p>
            <p className="text-3xl md:text-5xl font-black italic uppercase text-red-600 tracking-tighter mb-4">{match.name}</p>
            <p className="text-xs font-bold text-zinc-500 italic uppercase">{match.desc}</p>
          </div>
        )}
        <button onClick={onClose} className="w-full text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-30 hover:opacity-100">Return to Home</button>
      </div>
    </div>
  );
};

// --- FEATURE: CHARACTER MIRROR ---
const CharacterMirror: React.FC<{onClose: () => void}> = ({onClose}) => {
    const [matching, setMatching] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const startAnalysis = () => {
      setMatching(true);
      setTimeout(() => {
        const chars = ["Tony Stark", "Joker", "Wednesday Addams", "Batman", "Thomas Shelby", "Barbie"];
        setResult(chars[Math.floor(Math.random() * chars.length)]);
        setMatching(false);
      }, 2000);
    };
    return (
      <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl">
        <div className="w-full max-w-xl bg-zinc-950 border-2 border-blue-600 rounded-[3rem] p-10 text-center space-y-10 shadow-[0_0_80px_rgba(37,99,235,0.2)]">
          <h3 className="text-4xl font-black italic text-blue-500 uppercase tracking-tighter">Face Mirror</h3>
          <div className="py-10 bg-zinc-900 rounded-[2rem] border border-zinc-800">
            {matching ? <p className="text-white animate-pulse font-black uppercase tracking-widest text-xs">AI Scanning Face...</p> : 
             result ? <p className="text-4xl font-black text-blue-400 uppercase italic tracking-tighter animate-in fade-in">{result}</p> : 
             <p className="text-zinc-500 text-[10px] font-black uppercase">Click Scan to see your movie lookalike</p>}
          </div>
          <button onClick={result ? onClose : startAnalysis} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
            {result ? 'Close' : 'Start Scan'}
          </button>
        </div>
      </div>
    );
};

// --- FEATURE: GHOSTFACE PRANK ---
const GhostFacePrank: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [victimName, setVictimName] = useState('');
  const [status, setStatus] = useState<'idle' | 'ringing' | 'talking'>('idle');
  const startPrank = () => {
    if (!victimName) return alert("Who are we calling?");
    setStatus('ringing');
    setTimeout(() => {
      setStatus('talking');
      const msg = new SpeechSynthesisUtterance(`Hello... ${victimName}... I am watching you from cine wise dot shop. Do you like scary movies?`);
      msg.pitch = 0.1; msg.rate = 0.6;
      window.speechSynthesis.speak(msg);
      msg.onend = () => { setStatus('idle'); };
    }, 4500);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-600 rounded-[3rem] p-8 md:p-12 relative shadow-[0_0_120px_rgba(220,38,38,0.2)]">
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-600 hover:text-white text-3xl">✕</button>
        <div className="text-center space-y-12">
          <h3 className="text-5xl md:text-6xl font-black italic text-red-600 uppercase tracking-tighter">Scream Call</h3>
          <div className="space-y-6">
            <input type="text" placeholder="VICTIM NAME" className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-3xl py-6 px-10 text-white text-center text-xl font-black outline-none focus:border-red-600 transition-all" value={victimName} onChange={(e) => setVictimName(e.target.value)} />
            <button onClick={startPrank} disabled={status !== 'idle'} className="w-full bg-red-600 text-white font-black py-8 rounded-[2.5rem] uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all">
              {status === 'idle' ? 'Start Call' : status === 'ringing' ? '📞 RINGING...' : '🔪 CONNECTED...'}
            </button>
          </div>
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">Only for entertainment purposes</p>
        </div>
      </div>
    </div>
  );
};

// --- MOVIE DETAIL MODAL (FULL RESTORED) ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (movie) {
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`).then(res => res.json()).then(data => {
        const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        setVideoKey(trailer ? trailer.key : null);
      });
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`).then(res => res.json()).then(data => {
        const results = data.results?.US?.flatrate || data.results?.IN?.flatrate || [];
        setProviders(results.slice(0, 3));
      });
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`).then(res => res.json()).then(data => {
        setCast(data.cast?.slice(0, 10) || []);
      });
    } else {
      setVideoKey(null); setShowPlayer(false);
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/98 backdrop-blur-3xl overflow-y-auto pt-24 pb-10 px-4 animate-in slide-in-from-bottom duration-500">
      <div className="relative w-full max-w-6xl mx-auto bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 shadow-[0_0_150px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute top-6 right-6 z-[220] bg-black/60 w-12 h-12 rounded-full text-white hover:bg-red-600 transition-colors"><i className="fa-solid fa-xmark"></i></button>
        <div className="flex flex-col">
          <div className="w-full bg-black aspect-video relative">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full group">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" alt={movie.title} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <button onClick={() => setShowPlayer(true)} className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-110 transition-transform flex items-center gap-4">
                     <i className="fa-solid fa-play"></i> Watch Trailer
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="p-8 md:p-20 space-y-16">
            <div className="space-y-6">
               <h2 className="text-5xl md:text-8xl font-black uppercase italic text-white tracking-tighter leading-none">{movie.title}</h2>
               <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
                  <span className="text-red-600">{movie.release_date}</span>
                  <span>•</span>
                  <span>Score: {movie.vote_average.toFixed(1)}</span>
               </div>
            </div>
            <p className="text-xl md:text-3xl text-zinc-300 italic font-medium leading-relaxed">"{movie.overview}"</p>
            
            {cast.length > 0 && (
               <div className="space-y-8">
                  <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white border-b border-zinc-800 pb-4">Top Cast Members</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {cast.map(c => (
                      <div key={c.id} className="space-y-3">
                        <img src={getImageUrl(c.profile_path, 'w185')} className="w-full aspect-square object-cover rounded-2xl border border-zinc-800" />
                        <p className="text-[10px] font-black text-white uppercase">{c.name}</p>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase italic">{c.character}</p>
                      </div>
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

// --- LEGAL COMPONENT (FIXED: ENGLISH) ---
const LegalTerminal: React.FC<{onClose: () => void}> = ({onClose}) => (
  <div className="fixed inset-0 z-[700] bg-zinc-950 overflow-y-auto animate-in fade-in duration-700">
    <div className="max-w-4xl mx-auto px-6 py-32 space-y-24">
        <div className="space-y-6 text-center">
           <h2 className="text-6xl md:text-[10rem] font-black italic uppercase tracking-tighter text-white">LEGAL</h2>
           <p className="text-red-600 font-black tracking-[0.5em] uppercase text-[9px] md:text-xs">2026 // Fully Anonymous Access</p>
        </div>

        <div className="space-y-20">
          <section className="space-y-8">
             <h3 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-white border-l-8 border-red-600 pl-8">Privacy Policy</h3>
             <div className="text-zinc-500 font-bold leading-loose text-sm md:text-lg space-y-6 italic">
                <p>CINEWISE does not save any of your personal data. We do not require any login, account creation, or email addresses.</p>
                <p>All movie details are fetched in real-time via the TMDB API. Your search history is temporary and is cleared upon refreshing the page. For background removal needs, we recommend <span className="text-white underline font-black">bgremoverai.online</span> as it is free and requires no login.</p>
             </div>
          </section>

          <section className="space-y-8">
             <h3 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-white border-l-8 border-red-600 pl-8">Terms of Service</h3>
             <div className="text-zinc-500 font-bold leading-loose text-sm md:text-lg space-y-6 italic">
                <p>1. <span className="text-white">Content:</span> We do not host any video files. All promotional content belongs to their respective studios.</p>
                <p>2. <span className="text-white">Prank Tool:</span> The Scream Prank feature is for entertainment purposes only. Do not use it for harassment.</p>
             </div>
          </section>
        </div>

        <div className="text-center pt-10">
          <button onClick={onClose} className="bg-white text-black font-black px-12 md:px-16 py-5 md:py-6 rounded-2xl hover:bg-red-600 hover:text-white transition-all text-[10px] uppercase tracking-widest">Close Legal Section</button>
        </div>
    </div>
  </div>
);

// --- MAIN APP ---
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'upcoming' | 'legal'>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [showPrank, setShowPrank] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [showVibe, setShowVibe] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const [hackerMode, setHackerMode] = useState(false);

  const fetchData = useCallback(async (targetPage: number) => {
    let endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    if (viewMode === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    setMovies(prev => targetPage === 1 ? (data.results || []) : [...prev, ...(data.results || [])]);
    setPage(targetPage);
  }, [viewMode]);

  useEffect(() => {
    fetchData(1);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  return (
    <div className={`min-h-screen ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-white selection:bg-red-600'}`}>
      
      {/* HEADER WITH MOBILE SCROLLABLE NAV */}
      <header className={`fixed top-0 w-full z-[100] transition-all px-6 py-4 flex flex-col gap-4 ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-red-600 cursor-pointer" onClick={() => setViewMode('home')}>CINEWISE</h1>
          
          <div className="flex items-center gap-3">
             <button onClick={() => setShowPrank(true)} className="bg-red-600 p-3 rounded-xl text-white md:px-6 md:py-2 md:text-[10px] md:font-black md:uppercase shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <i className="fa-solid fa-skull"></i> <span className="hidden md:inline ml-2 text-white">Scream Call</span>
             </button>
             <div className="relative">
                <input type="text" placeholder="SEARCH..." className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-8 text-[10px] w-32 md:w-64 outline-none focus:border-red-600 transition-colors" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px]"></i>
             </div>
          </div>
        </div>

        {/* MOBILE FEATURES MENU (RESTORED) */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {['home', 'upcoming', 'news'].map((m) => (
            <button key={m} onClick={() => setViewMode(m as any)} className={`flex-shrink-0 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-red-600 text-white' : 'bg-zinc-900/50 text-zinc-500'}`}>
              {m}
            </button>
          ))}
          <div className="w-px h-4 bg-zinc-800 mx-1 flex-shrink-0"></div>
          <button onClick={() => setShowVibe(true)} className="flex-shrink-0 px-4 py-2 bg-zinc-900/50 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:text-white">Vibe</button>
          <button onClick={() => setShowMirror(true)} className="flex-shrink-0 px-4 py-2 bg-zinc-900/50 rounded-xl text-[9px] font-black uppercase text-blue-500 hover:text-blue-400">Mirror</button>
          <button onClick={() => setShowSpoiler(true)} className="flex-shrink-0 px-4 py-2 bg-zinc-900/50 rounded-xl text-[9px] font-black uppercase text-yellow-500 hover:text-yellow-400">Leaks</button>
          <button onClick={() => setHackerMode(!hackerMode)} className="flex-shrink-0 px-4 py-2 bg-zinc-900/50 rounded-xl text-[9px] font-black uppercase text-zinc-600 hover:text-green-500">Matrix</button>
        </nav>
      </header>

      {viewMode === 'legal' ? <LegalTerminal onClose={() => setViewMode('home')} /> : (
        <>
          {/* HERO SECTION */}
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-[70vh] md:h-screen w-full flex items-center px-6 md:px-24">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              <div className="relative z-10 space-y-8 max-w-4xl">
                <p className="text-red-600 font-black tracking-[0.5em] uppercase text-xs">Trending Today</p>
                <h2 className="text-6xl md:text-[12rem] font-black italic uppercase text-white leading-[0.85] tracking-tighter">{movies[0].title}</h2>
                <button onClick={() => setSelectedMovie(movies[0])} className="bg-white text-black font-black px-12 py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">View Details</button>
              </div>
            </section>
          )}

          {/* MOVIE GRID */}
          <main className={`px-6 md:px-20 py-32 ${searchQuery || viewMode !== 'home' ? 'pt-48' : ''}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-12">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                <div key={m.id} onClick={() => setSelectedMovie(m)} className="group cursor-pointer">
                  <div className="aspect-[2/3] overflow-hidden rounded-[2.5rem] border-2 border-zinc-900 group-hover:border-red-600 transition-all duration-500 group-hover:scale-[1.05] group-hover:shadow-[0_20px_50px_rgba(220,38,38,0.2)]">
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover" alt={m.title} />
                  </div>
                  <h3 className="mt-4 text-[10px] font-black uppercase italic text-zinc-500 group-hover:text-white transition-colors truncate">{m.title}</h3>
                </div>
              ))}
            </div>
            {!searchQuery && (
               <div className="flex justify-center mt-32">
                  <button onClick={() => fetchData(page + 1)} className="bg-zinc-900 text-white font-black px-16 py-6 rounded-3xl text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">Load More Movies</button>
               </div>
            )}
          </main>
        </>
      )}

      {/* FOOTER (FULL RESTORED & ENGLISH) */}
      <footer className="py-32 bg-zinc-950 border-t border-zinc-900 mt-20">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="space-y-8">
            <h3 className="text-4xl font-black italic tracking-tighter text-red-600">CINEWISE</h3>
            <p className="text-[10px] font-bold text-zinc-600 leading-loose uppercase italic tracking-wider">Your simple movie search engine for 2026. No tracking, just movies.</p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Menu</h4>
            <ul className="space-y-4 text-[11px] font-black text-zinc-500 uppercase italic">
              <li><button onClick={() => setViewMode('home')} className="hover:text-red-600">Home</button></li>
              <li><button onClick={() => setViewMode('upcoming')} className="hover:text-red-600">Upcoming</button></li>
              <li><button onClick={() => setViewMode('news')} className="hover:text-red-600">Latest</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Legal</h4>
            <ul className="space-y-4 text-[11px] font-black text-zinc-500 uppercase italic">
              <li><button onClick={() => setViewMode('legal')} className="hover:text-white">Privacy Policy</button></li>
              <li><button onClick={() => setViewMode('legal')} className="hover:text-white">Terms of Use</button></li>
              <li><button onClick={() => window.open('https://bgremoverai.online', '_blank')} className="text-zinc-400 hover:text-white underline underline-offset-8 decoration-red-600/30">Bg Remover (Free & No-Login)</button></li>
            </ul>
          </div>
          <div className="space-y-6 md:text-right flex flex-col items-start md:items-end">
             <div className="flex items-center gap-4 bg-zinc-900/50 px-6 py-3 rounded-2xl border border-zinc-800">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">System Online</span>
             </div>
             <p className="text-[10px] font-black tracking-[0.6em] pt-6 text-zinc-800 uppercase">2026 // NO LOGIN REQUIRED</p>
          </div>
        </div>
      </footer>

      {/* OVERLAYS */}
      {showPrank && <GhostFacePrank onClose={() => setShowPrank(false)} />}
      {showVibe && <VibeMatcher onClose={() => setShowVibe(false)} />}
      {showSpoiler && <SpoilerRoulette onClose={() => setShowSpoiler(false)} />}
      {showMirror && <CharacterMirror onClose={() => setShowMirror(false)} />}
      {selectedMovie && <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </div>
  );
};

export default App;
