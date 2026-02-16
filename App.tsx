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
  genre_ids: number[];
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

// --- FEATURE: MATRIX RAIN (HACKER MODE) ---
const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$@#%";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) drops[i] = 1;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-20" />;
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
    "BEYOND THE SPIDER-VERSE: Production uses a new AI engine for 2026.",
    "THE BATMAN II: Clayface is confirmed as the secondary antagonist.",
    "DEADPOOL 4: Ryan Reynolds signs a record-breaking 10-year deal."
  ];
  const spin = () => {
    setIsSpinning(true);
    setSpoiler('');
    setTimeout(() => {
      setSpoiler(leaks[Math.floor(Math.random() * leaks.length)]);
      setIsSpinning(false);
    }, 1500);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border-2 border-yellow-500 rounded-[3.5rem] p-10 text-center space-y-12 shadow-[0_0_100px_rgba(234,179,8,0.2)]">
        <div className="space-y-4">
          <h3 className="text-4xl md:text-6xl font-black italic text-yellow-500 uppercase tracking-tighter">Leaks // 2026</h3>
          <p className="text-[10px] font-black text-zinc-500 tracking-[0.5em] uppercase">Confidential Movie Information</p>
        </div>
        <div className="min-h-[150px] flex items-center justify-center border-y border-zinc-800">
          <p className={`text-xl md:text-3xl font-bold italic transition-all duration-700 ${isSpinning ? 'opacity-20 blur-2xl scale-75 rotate-3' : 'opacity-100 text-white'}`}>
            {spoiler || (isSpinning ? "Decoding Data..." : "Decrypt a Spoiler?")}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <button onClick={spin} disabled={isSpinning} className="w-full bg-yellow-500 text-black font-black py-8 rounded-[2.5rem] hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-widest text-sm shadow-xl">
             {isSpinning ? "SPINNING..." : "GENERATE LEAK"}
          </button>
          <button onClick={onClose} className="text-zinc-600 uppercase font-black text-[11px] tracking-[0.4em] hover:text-white transition-colors">Abort Access</button>
        </div>
      </div>
    </div>
  );
};

// --- FEATURE: VIBE MATCHER ---
const VibeMatcher: React.FC<{onClose: () => void}> = ({onClose}) => {
  const moods = [
    { name: 'Villain Era', desc: 'Powerful, dark, and misunderstood.', color: 'text-red-600' },
    { name: 'Lonely God', desc: 'Melancholic excellence in solitude.', color: 'text-blue-500' },
    { name: 'Main Character', desc: 'The world revolves around you.', color: 'text-yellow-400' },
    { name: 'Cyberpunk Soul', desc: 'High tech, low life, neon dreams.', color: 'text-purple-500' },
    { name: 'Anti-Hero', desc: 'Doing the right things the wrong way.', color: 'text-emerald-500' }
  ];
  const [match, setMatch] = useState<{name: string, desc: string, color: string} | null>(null);
  return (
    <div className="fixed inset-0 z-[600] bg-zinc-950/98 flex items-center justify-center p-6 backdrop-blur-md animate-in zoom-in duration-300">
      <div className="w-full max-w-3xl bg-white rounded-[4rem] p-10 md:p-20 text-black space-y-16 shadow-2xl">
        <div className="text-center space-y-4">
          <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Vibe Check</h3>
          <p className="font-bold text-[10px] tracking-[0.3em] uppercase opacity-30">Select your current mental state</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moods.map(m => (
            <button key={m.name} onClick={() => setMatch(m)} className="border-4 border-black py-6 rounded-[2.5rem] font-black uppercase text-xs hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">
              {m.name}
            </button>
          ))}
        </div>
        {match && (
          <div className="bg-zinc-100 p-10 rounded-[3rem] text-center border-4 border-black animate-in fade-in slide-in-from-bottom-4">
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">Identity Confirmed</p>
            <p className={`text-4xl md:text-6xl font-black italic uppercase ${match.color} tracking-tighter mb-4`}>{match.name}</p>
            <p className="text-sm font-bold text-zinc-600 italic uppercase leading-relaxed">{match.desc}</p>
          </div>
        )}
        <button onClick={onClose} className="w-full text-center text-[11px] font-black uppercase tracking-[0.5em] opacity-30 hover:opacity-100 transition-opacity">Return to Interface</button>
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
      setResult(null);
      setTimeout(() => {
        const chars = ["Tony Stark", "Joker", "Wednesday Addams", "Batman", "Thomas Shelby", "Patrick Bateman", "Barbie", "Tyler Durden"];
        setResult(chars[Math.floor(Math.random() * chars.length)]);
        setMatching(false);
      }, 2500);
    };
    return (
      <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in">
        <div className="w-full max-w-xl bg-zinc-950 border-2 border-blue-600 rounded-[4rem] p-12 text-center space-y-12 shadow-[0_0_100px_rgba(37,99,235,0.2)]">
          <div className="space-y-4">
            <h3 className="text-5xl font-black italic text-blue-500 uppercase tracking-tighter leading-none">AI Mirror</h3>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Neural Face Analysis v4.0</p>
          </div>
          <div className="py-16 bg-zinc-900/50 rounded-[3rem] border border-zinc-800 relative overflow-hidden">
            {matching && <div className="absolute inset-0 bg-blue-600/10 animate-pulse"></div>}
            {matching ? <p className="text-white animate-bounce font-black uppercase tracking-widest text-[11px]">Scanning Bio-Metrics...</p> : 
             result ? <div className="space-y-4 animate-in zoom-in">
                <p className="text-5xl font-black text-blue-400 uppercase italic tracking-tighter leading-none">{result}</p>
                <p className="text-[10px] font-black text-blue-900 uppercase">98.4% Match Found</p>
             </div> : 
             <p className="text-zinc-600 text-[11px] font-black uppercase italic">Initialize facial recognition scan</p>}
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={result ? () => setResult(null) : startAnalysis} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2.5rem] text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
              {result ? 'Scan Again' : 'Start AI Analysis'}
            </button>
            <button onClick={onClose} className="text-zinc-800 uppercase font-black text-[10px] tracking-[0.4em] hover:text-white">Close</button>
          </div>
        </div>
      </div>
    );
};

// --- FEATURE: GHOSTFACE PRANK ---
const GhostFacePrank: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [victimName, setVictimName] = useState('');
  const [status, setStatus] = useState<'idle' | 'ringing' | 'talking'>('idle');
  const startPrank = () => {
    if (!victimName) return;
    setStatus('ringing');
    setTimeout(() => {
      setStatus('talking');
      const msg = new SpeechSynthesisUtterance(`Hello... ${victimName}... This is Ghostface. I'm watching you browse Cine Wise. What's your favorite scary movie?`);
      msg.pitch = 0.1; msg.rate = 0.6;
      window.speechSynthesis.speak(msg);
      msg.onend = () => { setStatus('idle'); };
    }, 4000);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/98 flex items-center justify-center p-6 backdrop-blur-2xl">
      <div className="w-full max-w-2xl bg-zinc-950 border-4 border-red-600 rounded-[4rem] p-12 md:p-20 relative shadow-[0_0_150px_rgba(220,38,38,0.3)]">
        <button onClick={onClose} className="absolute top-10 right-10 text-zinc-800 hover:text-red-600 text-4xl transition-colors font-light">✕</button>
        <div className="text-center space-y-16">
          <div className="space-y-4">
            <h3 className="text-6xl md:text-8xl font-black italic text-red-600 uppercase tracking-tighter leading-none">The Call</h3>
            <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.5em]">Encryption: Secure // Caller: Unknown</p>
          </div>
          <div className="space-y-8">
            <input type="text" placeholder="ENTER TARGET NAME" className="w-full bg-transparent border-b-4 border-zinc-900 py-6 text-white text-center text-2xl md:text-4xl font-black outline-none focus:border-red-600 transition-all uppercase placeholder:text-zinc-900" value={victimName} onChange={(e) => setVictimName(e.target.value)} />
            <button onClick={startPrank} disabled={status !== 'idle'} className="w-full bg-red-600 text-white font-black py-10 rounded-[3rem] uppercase tracking-[0.3em] text-sm hover:bg-red-700 transition-all shadow-2xl disabled:opacity-50">
              {status === 'idle' ? 'SEND ANONYMOUS CALL' : status === 'ringing' ? '📞 CONNECTING...' : '🔪 TRANSMITTING...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MOVIE DETAIL MODAL (FULL 150+ LINES) ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movie) {
      setLoading(true);
      const api_key = TMDB_API_KEY;
      // Fetch Trailer
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${api_key}`).then(res => res.json()).then(data => {
        const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        setVideoKey(trailer ? trailer.key : null);
      });
      // Fetch Providers
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${api_key}`).then(res => res.json()).then(data => {
        const results = data.results?.US?.flatrate || data.results?.IN?.flatrate || [];
        setProviders(results.slice(0, 5));
      });
      // Fetch Cast
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${api_key}`).then(res => res.json()).then(data => {
        setCast(data.cast?.slice(0, 12) || []);
        setLoading(false);
      });
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 overflow-y-auto animate-in fade-in duration-500">
      <div className="min-h-screen w-full bg-zinc-900/50">
        {/* MODAL HEADER / HERO */}
        <div className="relative h-[60vh] md:h-[85vh] w-full">
          <button onClick={onClose} className="fixed top-8 right-8 z-[250] bg-white text-black w-14 h-14 rounded-2xl font-black text-2xl hover:bg-red-600 hover:text-white transition-all shadow-2xl">✕</button>
          <div className="absolute inset-0">
            <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover" alt={movie.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-24 space-y-8">
             <div className="flex items-center gap-6">
                <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">{movie.release_date.split('-')[0]}</span>
                <span className="text-white font-black text-[10px] uppercase tracking-widest italic">Rating: {movie.vote_average.toFixed(1)} / 10</span>
             </div>
             <h2 className="text-6xl md:text-[10rem] font-black uppercase italic text-white tracking-tighter leading-[0.85]">{movie.title}</h2>
             <div className="flex flex-wrap gap-4">
                <button onClick={() => setShowPlayer(true)} className="bg-white text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-4 text-sm">
                   <i className="fa-solid fa-play"></i> Watch Official Trailer
                </button>
             </div>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="max-w-7xl mx-auto px-8 md:px-24 py-24 space-y-32">
          {/* SYNOPSIS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
             <div className="md:col-span-2 space-y-10">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">The Narrative</h3>
                <p className="text-2xl md:text-5xl font-medium text-zinc-200 leading-tight italic">"{movie.overview}"</p>
             </div>
             <div className="space-y-10">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">Available On</h3>
                <div className="flex flex-wrap gap-4">
                  {providers.length > 0 ? providers.map(p => (
                    <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} className="w-16 h-16 rounded-2xl border border-zinc-800" title={p.provider_name} />
                  )) : <p className="text-zinc-700 font-black uppercase text-[10px]">No stream data available</p>}
                </div>
             </div>
          </div>

          {/* CAST GRID */}
          <div className="space-y-12">
             <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500 border-b border-zinc-800 pb-8">Principal Cast Members</h3>
             <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                {cast.map(c => (
                  <div key={c.id} className="space-y-4 group">
                    <div className="aspect-square overflow-hidden rounded-[2rem] border-2 border-zinc-800 group-hover:border-red-600 transition-all">
                       <img src={getImageUrl(c.profile_path, 'w185')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={c.name} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase truncate">{c.name}</p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase italic truncate">{c.character}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* VIDEO PLAYER OVERLAY */}
        {showPlayer && videoKey && (
          <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center p-4">
            <button onClick={() => setShowPlayer(false)} className="absolute top-10 right-10 text-white text-4xl font-light">✕</button>
            <div className="w-full max-w-6xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
               <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- LEGAL COMPONENT (FIXED: ENGLISH) ---
const LegalTerminal: React.FC<{onClose: () => void}> = ({onClose}) => (
  <div className="fixed inset-0 z-[700] bg-zinc-950 overflow-y-auto animate-in fade-in duration-700">
    <div className="max-w-5xl mx-auto px-8 py-32 space-y-32">
        <div className="space-y-6">
           <h2 className="text-7xl md:text-[14rem] font-black italic uppercase tracking-tighter text-white leading-none">LEGAL</h2>
           <div className="flex items-center gap-6">
              <div className="h-px flex-1 bg-zinc-900"></div>
              <p className="text-red-600 font-black tracking-[0.6em] uppercase text-xs">Security Protocol 2026</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <section className="space-y-10">
             <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-white border-l-8 border-red-600 pl-8">Privacy Policy</h3>
             <div className="text-zinc-500 font-bold leading-relaxed text-lg space-y-8 italic">
                <p>CINEWISE operates as a fully anonymous movie discovery engine. We do not use tracking cookies, we do not log IP addresses, and we never ask for your personal information.</p>
                <p>All movie metadata is provided by the TMDB community API. For users requiring image tools, we recommend <span className="text-white underline font-black">bgremoverai.online</span> as it aligns with our philosophy of free, no-login access.</p>
             </div>
          </section>

          <section className="space-y-10">
             <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-white border-l-8 border-red-600 pl-8">Terms of Service</h3>
             <div className="text-zinc-500 font-bold leading-relaxed text-lg space-y-8 italic">
                <p>By accessing this site, you acknowledge that CINEWISE is a search and discovery tool. We do not host, store, or distribute any video files on our servers.</p>
                <p>The entertainment features (Mirror, Scream Call, Vibe) are for recreational use. User discretion is advised when using the prank utility.</p>
             </div>
          </section>
        </div>

        <button onClick={onClose} className="w-full bg-white text-black font-black py-10 rounded-[2.5rem] hover:bg-red-600 hover:text-white transition-all text-sm uppercase tracking-[0.4em] shadow-2xl">Return to Interface</button>
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
    if (viewMode === 'news') endpoint = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    
    const res = await fetch(endpoint);
    const data = await res.json();
    setMovies(prev => targetPage === 1 ? (data.results || []) : [...prev, ...(data.results || [])]);
    setPage(targetPage);
  }, [viewMode]);

  useEffect(() => {
    fetchData(1);
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-white selection:bg-red-600'}`}>
      
      {hackerMode && <MatrixRain />}

      {/* FIXED HEADER WITH MOBILE NAV */}
      <header className={`fixed top-0 w-full z-[150] transition-all px-6 py-6 flex flex-col gap-6 ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/98 border-b border-zinc-900 backdrop-blur-2xl' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-red-600 cursor-pointer hover:scale-105 transition-transform" onClick={() => setViewMode('home')}>CINEWISE</h1>
          
          <div className="flex items-center gap-4">
             <button onClick={() => setShowPrank(true)} className="bg-red-600 p-4 rounded-2xl text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:rotate-12 transition-all">
                <i className="fa-solid fa-skull text-xl"></i>
             </button>
             <div className="relative group">
                <input type="text" placeholder="SEARCH DATABASE..." className="bg-zinc-900/80 border-2 border-zinc-800 rounded-2xl py-3 px-10 text-[10px] w-40 md:w-80 outline-none focus:border-red-600 transition-all font-black" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px]"></i>
             </div>
          </div>
        </div>

        {/* MOBILE RESPONSIVE SCROLLABLE MENU */}
        <nav className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar max-w-[1600px] mx-auto w-full">
          {['home', 'upcoming', 'news'].map((m) => (
            <button key={m} onClick={() => setViewMode(m as any)} className={`flex-shrink-0 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${viewMode === m ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-900/50 text-zinc-600 hover:text-white'}`}>
              {m}
            </button>
          ))}
          <div className="w-px h-6 bg-zinc-800 flex-shrink-0 mx-2"></div>
          <button onClick={() => setShowVibe(true)} className="flex-shrink-0 px-6 py-3 bg-zinc-900/50 rounded-2xl text-[10px] font-black uppercase text-zinc-400 border border-zinc-800 hover:bg-white hover:text-black transition-all">Vibe</button>
          <button onClick={() => setShowMirror(true)} className="flex-shrink-0 px-6 py-3 bg-zinc-900/50 rounded-2xl text-[10px] font-black uppercase text-blue-500 border border-blue-900/30 hover:bg-blue-600 hover:text-white transition-all">Mirror</button>
          <button onClick={() => setShowSpoiler(true)} className="flex-shrink-0 px-6 py-3 bg-zinc-900/50 rounded-2xl text-[10px] font-black uppercase text-yellow-500 border border-yellow-900/30 hover:bg-yellow-500 hover:text-black transition-all">Leaks</button>
          <button onClick={() => setHackerMode(!hackerMode)} className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${hackerMode ? 'bg-green-600 text-black border-green-400' : 'bg-zinc-900/50 text-zinc-700 border-zinc-800'}`}>Matrix</button>
        </nav>
      </header>

      {viewMode === 'legal' ? <LegalTerminal onClose={() => setViewMode('home')} /> : (
        <>
          {/* LARGE HERO SECTION */}
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-[80vh] md:h-screen w-full flex items-center px-8 md:px-32">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
              <div className="relative z-10 space-y-10 max-w-6xl animate-in fade-in slide-in-from-left duration-1000">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-1 bg-red-600"></div>
                   <p className="text-red-600 font-black tracking-[0.6em] uppercase text-xs">Featured Experience</p>
                </div>
                <h2 className="text-7xl md:text-[14rem] font-black italic uppercase text-white leading-[0.8] tracking-tighter">{movies[0].title}</h2>
                <div className="flex gap-6">
                   <button onClick={() => setSelectedMovie(movies[0])} className="bg-white text-black font-black px-16 py-7 rounded-[2rem] text-[11px] uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-2xl">Initialize Access</button>
                </div>
              </div>
            </section>
          )}

          {/* DYNAMIC MOVIE GRID */}
          <main className={`px-8 md:px-32 py-40 ${searchQuery || viewMode !== 'home' ? 'pt-64' : ''}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-16">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((m, idx) => (
                <div key={`${m.id}-${idx}`} onClick={() => setSelectedMovie(m)} className="group cursor-pointer relative">
                  <div className="aspect-[2/3] overflow-hidden rounded-[3rem] border-2 border-zinc-900 group-hover:border-red-600 transition-all duration-700 group-hover:scale-[1.08] group-hover:shadow-[0_30px_60px_rgba(220,38,38,0.25)]">
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" alt={m.title} />
                  </div>
                  <div className="mt-6 space-y-2 px-2">
                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">{m.release_date.split('-')[0]}</p>
                    <h3 className="text-xs font-black uppercase italic text-zinc-400 group-hover:text-white transition-colors truncate">{m.title}</h3>
                  </div>
                </div>
              ))}
            </div>
            
            {/* PAGINATION */}
            {!searchQuery && (
               <div className="flex flex-col items-center mt-40 space-y-8">
                  <div className="h-px w-32 bg-zinc-900"></div>
                  <button onClick={() => fetchData(page + 1)} className="bg-zinc-900 text-white font-black px-24 py-8 rounded-[3rem] text-[11px] uppercase tracking-[0.4em] border border-zinc-800 hover:bg-white hover:text-black transition-all shadow-xl">
                     Load Next Sequence
                  </button>
               </div>
            )}
          </main>
        </>
      )}

      {/* FOOTER (50+ LINES RESTORED) */}
      <footer className="py-40 bg-zinc-950 border-t border-zinc-900 mt-40">
        <div className="max-w-[1600px] mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-32">
          <div className="space-y-10 md:col-span-1">
            <h3 className="text-5xl font-black italic tracking-tighter text-red-600">CINEWISE</h3>
            <p className="text-[11px] font-bold text-zinc-700 leading-loose uppercase italic tracking-widest max-w-xs">
              The premier destination for anonymous cinematic discovery in 2026. Built for the movie-obsessed.
            </p>
          </div>
          
          <div className="space-y-10">
            <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Navigation</h4>
            <ul className="space-y-6 text-[11px] font-black text-zinc-600 uppercase italic">
              <li><button onClick={() => setViewMode('home')} className="hover:text-red-600 transition-colors">Home Archive</button></li>
              <li><button onClick={() => setViewMode('upcoming')} className="hover:text-red-600 transition-colors">Future Releases</button></li>
              <li><button onClick={() => setViewMode('news')} className="hover:text-red-600 transition-colors">Current Theatre</button></li>
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Compliance</h4>
            <ul className="space-y-6 text-[11px] font-black text-zinc-600 uppercase italic">
              <li><button onClick={() => setViewMode('legal')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => setViewMode('legal')} className="hover:text-white transition-colors">Terms of Use</button></li>
              <li><a href="https://bgremoverai.online" target="_blank" className="text-zinc-400 hover:text-red-500 underline underline-offset-8 decoration-zinc-800 hover:decoration-red-600 transition-all font-black">BG REMOVER AI (FREE)</a></li>
            </ul>
          </div>

          <div className="space-y-10 md:text-right flex flex-col items-start md:items-end justify-between">
             <div className="space-y-4">
                <div className="flex items-center gap-4 bg-zinc-900/30 px-8 py-4 rounded-[2rem] border border-zinc-900">
                   <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.8)]"></div>
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Node: Active</span>
                </div>
                <p className="text-[9px] font-black text-zinc-800 tracking-[0.6em] uppercase">Architecture // CineWise 2026</p>
             </div>
             <p className="text-[10px] font-black text-zinc-900 uppercase">NO LOGIN • NO TRACKING • NO COOKIES</p>
          </div>
        </div>
      </footer>

      {/* OVERLAY COMPONENTS */}
      {showPrank && <GhostFacePrank onClose={() => setShowPrank(false)} />}
      {showVibe && <VibeMatcher onClose={() => setShowVibe(false)} />}
      {showSpoiler && <SpoilerRoulette onClose={() => setShowSpoiler(false)} />}
      {showMirror && <CharacterMirror onClose={() => setShowMirror(false)} />}
      {selectedMovie && <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </div>
  );
};

export default App;
