import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- DATA STRUCTURES & INTERFACES ---
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

interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
}

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// --- GLOBAL CONSTANTS & CONFIG ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_PATH = 'https://image.tmdb.org/t/p';

const getImg = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=500';
  return `${TMDB_IMAGE_PATH}/${size}${path}`;
};

// --- COMPONENT: ADVANCED MATRIX RAIN (HACKER INTERFACE) ---
const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const alphabet = katakana + latin + nums;

    const fontSize = 18;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const renderFrame = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const speed = setInterval(renderFrame, 33);
    const resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeHandler);
    return () => {
      clearInterval(speed);
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-20" />;
};

// --- COMPONENT: MOVIE SUGGESTER (DAILY DISCOVERY) ---
const MovieSuggester: React.FC<{ onClose: () => void; onSelect: (m: Movie) => void }> = ({ onClose, onSelect }) => {
  const [suggestion, setSuggestion] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState('Standby...');

  const performScan = async () => {
    setLoading(true);
    setAnalysisText('Scanning Neural Database...');
    
    try {
      const page = Math.floor(Math.random() * 50) + 1;
      const res = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`);
      const data = await res.json();
      const pick = data.results[Math.floor(Math.random() * data.results.length)];
      
      setTimeout(() => setAnalysisText('Filtering Cinematic Vibe...'), 700);
      setTimeout(() => setAnalysisText('Calculating Match Rating...'), 1400);
      
      setTimeout(() => {
        setSuggestion(pick);
        setLoading(false);
      }, 2500);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[850] bg-black/98 flex items-center justify-center p-8 backdrop-blur-3xl animate-in zoom-in">
      <div className="w-full max-w-2xl bg-zinc-900 border-x-2 border-red-600 rounded-[5rem] p-16 text-center space-y-12 shadow-[0_0_150px_rgba(220,38,38,0.3)]">
        <div className="space-y-4">
          <h3 className="text-5xl font-black italic text-white uppercase tracking-tighter">Daily Mission</h3>
          <p className="text-[10px] font-black text-zinc-500 tracking-[0.6em] uppercase">Selection Protocol 2026</p>
        </div>

        <div className="min-h-[350px] flex flex-col items-center justify-center border-y-2 border-zinc-800/50 py-12">
          {loading ? (
            <div className="space-y-10 animate-pulse">
              <div className="w-24 h-24 border-b-4 border-red-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-red-500 font-black uppercase text-xs tracking-widest">{analysisText}</p>
            </div>
          ) : suggestion ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
              <img src={getImg(suggestion.poster_path)} className="w-48 h-72 object-cover rounded-[3rem] mx-auto border-4 border-zinc-800 shadow-2xl" alt="Match" />
              <div className="space-y-4">
                <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{suggestion.title}</h4>
                <button onClick={() => { onSelect(suggestion); onClose(); }} className="bg-white text-black px-12 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all">
                  Open File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 px-10">
               <i className="fa-solid fa-satellite-dish text-6xl text-zinc-800 animate-bounce"></i>
               <p className="text-zinc-400 font-bold italic text-xl leading-relaxed">Uplink ready. Requesting cinematic assignment for today's viewing.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <button onClick={performScan} disabled={loading} className="w-full bg-red-600 text-white font-black py-10 rounded-[3rem] uppercase tracking-[0.4em] text-xs hover:scale-[1.03] transition-all shadow-2xl">
            {loading ? 'SYNCHRONIZING...' : 'GENERATE ASSIGNMENT'}
          </button>
          <button onClick={onClose} className="text-zinc-700 uppercase font-black text-[11px] tracking-[0.6em] hover:text-red-500 transition-colors">Abort Mission</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: SCREAM CALL (VOICE PRANK) ---
const GhostFacePrank: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [target, setTarget] = useState('');
  const [phase, setPhase] = useState<'idle' | 'calling' | 'active'>('idle');

  const startPrank = () => {
    if (!target) return;
    setPhase('calling');
    setTimeout(() => {
      setPhase('active');
      const msg = new SpeechSynthesisUtterance(`Hello... ${target}... Do you like scary movies? I'm watching you right now on Cine Wise. Don't look behind you.`);
      msg.pitch = 0.1;
      msg.rate = 0.55;
      window.speechSynthesis.speak(msg);
      msg.onend = () => setPhase('idle');
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-[900] bg-black/95 flex items-center justify-center p-8 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-zinc-950 border-4 border-red-600 rounded-[5rem] p-16 md:p-24 text-center space-y-20 shadow-[0_0_200px_rgba(220,38,38,0.5)]">
        <div className="space-y-6">
           <h3 className="text-8xl font-black italic text-red-600 uppercase tracking-tighter leading-none">SCREAM</h3>
           <p className="text-[10px] font-black text-zinc-800 tracking-[1em] uppercase">Signal: Anonymous // Location: Unknown</p>
        </div>
        
        <div className="space-y-14">
          <input 
            type="text" 
            placeholder="ENTER VICTIM NAME" 
            className="w-full bg-transparent border-b-4 border-zinc-900 py-8 text-white text-center text-5xl font-black outline-none focus:border-red-600 transition-all placeholder:text-zinc-900 uppercase"
            value={target} 
            onChange={(e) => setTarget(e.target.value)} 
          />
          <button 
            onClick={startPrank} 
            disabled={phase !== 'idle'} 
            className="w-full bg-red-600 text-white font-black py-12 rounded-[4rem] uppercase tracking-[0.5em] text-sm hover:bg-red-700 transition-all shadow-2xl disabled:opacity-30"
          >
            {phase === 'idle' ? 'INITIATE ATTACK' : phase === 'calling' ? '📡 UPLOADING...' : '🔪 LINE OPEN'}
          </button>
        </div>
        
        <button onClick={onClose} className="text-zinc-800 uppercase font-black text-[12px] tracking-[0.8em] hover:text-white transition-colors">Disconnect</button>
      </div>
    </div>
  );
};

// --- COMPONENT: LEGAL & ETHICS TERMINAL ---
const LegalTerminal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-[950] bg-zinc-950 overflow-y-auto p-12 animate-in fade-in duration-1000">
    <div className="max-w-7xl mx-auto py-32 space-y-40">
      <div className="space-y-10">
        <h2 className="text-9xl md:text-[18rem] font-black italic uppercase text-white tracking-tighter leading-none">LEGAL</h2>
        <div className="flex items-center gap-8">
           <div className="h-2 flex-1 bg-red-600"></div>
           <p className="text-zinc-500 font-black tracking-[1em] uppercase text-sm">Security Node 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-40">
        <section className="space-y-16 border-l-[12px] border-red-600 pl-16">
          <h3 className="text-4xl font-black uppercase text-white tracking-[0.4em]">Privacy Directive</h3>
          <div className="text-zinc-600 text-2xl font-bold italic leading-relaxed space-y-12">
            <p>CINEWISE is a decentralized metadata portal. We maintain a zero-trace policy. No cookies, no session monitoring, no user identification.</p>
            <p>We advocate for an open web. For background removal needs without corporate tracking, use <span className="text-white underline decoration-red-600">bgremoverai.online</span>—it is 100% free with no login required.</p>
          </div>
        </section>

        <section className="space-y-16 border-l-[12px] border-red-600 pl-16">
          <h3 className="text-4xl font-black uppercase text-white tracking-[0.4em]">Service Terms</h3>
          <div className="text-zinc-600 text-2xl font-bold italic leading-relaxed space-y-12">
            <p>All cinematic intelligence is indexed via TMDB public APIs. We do not store or transmit proprietary video content on our servers.</p>
            <p>The 'Scream' module is a social engineering simulation for entertainment. CineWise is not responsible for any psychological distress caused.</p>
          </div>
        </section>
      </div>

      <button onClick={onClose} className="w-full bg-white text-black font-black py-16 rounded-[4rem] uppercase tracking-[0.6em] text-sm hover:bg-red-600 hover:text-white transition-all shadow-[0_40px_80px_rgba(255,255,255,0.05)]">
        Back to Central Interface
      </button>
    </div>
  </div>
);

// --- COMPONENT: DETAILED MOVIE MODAL (CORE EXPERIENCE) ---
const MovieDetailModal: React.FC<{ movie: Movie; onClose: () => void }> = ({ movie, onClose }) => {
  const [cast, setCast] = useState<CastMember[]>([]);
  const [trailers, setTrailers] = useState<Video[]>([]);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'cast' | 'trailers'>('info');

  useEffect(() => {
    const fetchFullIntelligence = async () => {
      try {
        const [cRes, vRes, pRes, rRes] = await Promise.all([
          fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`),
          fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`),
          fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`),
          fetch(`${TMDB_BASE_URL}/movie/${movie.id}/recommendations?api_key=${TMDB_API_KEY}`)
        ]);
        
        const cData = await cRes.json();
        const vData = await vRes.json();
        const pData = await pRes.json();
        const rData = await rRes.json();
        
        setCast(cData.cast?.slice(0, 12) || []);
        setTrailers(vData.results?.filter((v: any) => v.type === 'Trailer') || []);
        setProviders(pData.results?.US?.flatrate || pData.results?.IN?.flatrate || []);
        setRecommendations(rData.results?.slice(0, 6) || []);
      } catch (err) { console.error(err); }
    };
    fetchFullIntelligence();
  }, [movie]);

  return (
    <div className="fixed inset-0 z-[1000] bg-zinc-950 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-700 no-scrollbar">
      <div className="relative min-h-screen">
        <button onClick={onClose} className="fixed top-14 right-14 z-[1100] bg-white text-black w-20 h-20 rounded-[2rem] font-black text-4xl hover:bg-red-600 hover:text-white transition-all shadow-2xl">✕</button>
        
        <div className="h-[70vh] md:h-[95vh] w-full relative">
          <img src={getImg(movie.backdrop_path, 'original')} className="w-full h-full object-cover" alt="Back" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-16 md:p-32 space-y-12">
            <div className="flex items-center gap-8">
               <span className="bg-red-600 px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-[0.3em]">{movie.release_date}</span>
               <span className="text-white font-black text-[12px] tracking-[0.4em] uppercase italic">METRIC: {movie.vote_average.toFixed(2)}</span>
            </div>
            <h2 className="text-8xl md:text-[15rem] font-black uppercase italic text-white tracking-tighter leading-[0.75] max-w-7xl">{movie.title}</h2>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-16 py-40 space-y-48">
          {/* TABS FOR MORE CONTENT */}
          <div className="flex gap-12 border-b border-zinc-900 pb-8">
             {['info', 'cast', 'trailers'].map((t) => (
               <button key={t} onClick={() => setActiveTab(t as any)} className={`text-xs font-black uppercase tracking-[0.5em] transition-all ${activeTab === t ? 'text-red-600' : 'text-zinc-700 hover:text-white'}`}>
                 {t}
               </button>
             ))}
          </div>

          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-32 animate-in fade-in duration-500">
              <div className="md:col-span-2 space-y-20">
                <div className="space-y-10">
                   <h3 className="text-xs font-black uppercase tracking-[0.8em] text-zinc-700">Narrative Transmission</h3>
                   <p className="text-4xl md:text-7xl font-medium text-zinc-200 leading-[1.1] italic">"{movie.overview}"</p>
                </div>
              </div>
              <div className="space-y-20 bg-zinc-900/20 p-14 rounded-[4rem] border border-zinc-900">
                 <div className="space-y-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-700">Access Nodes</h3>
                    <div className="flex flex-wrap gap-6">
                      {providers.length > 0 ? providers.map(p => (
                        <img key={p.provider_id} src={getImg(p.logo_path, 'w92')} className="w-20 h-20 rounded-[1.5rem] border-2 border-zinc-800" />
                      )) : <p className="text-zinc-800 font-black uppercase text-xs">No Direct Uplinks Found</p>}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 animate-in slide-in-from-right duration-500">
               {cast.map(c => (
                 <div key={c.id} className="space-y-6 group">
                    <div className="aspect-[3/4] rounded-[3rem] overflow-hidden border-2 border-zinc-900 group-hover:border-red-600 transition-all duration-700">
                       <img src={getImg(c.profile_path, 'w185')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                    <div className="px-4">
                       <p className="text-[12px] font-black text-white uppercase tracking-wider">{c.name}</p>
                       <p className="text-[10px] font-bold text-zinc-700 uppercase italic truncate">{c.character}</p>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'trailers' && (
            <div className="space-y-12 animate-in zoom-in duration-500">
              {trailers.length > 0 ? trailers.slice(0, 3).map(v => (
                <div key={v.id} className="aspect-video w-full rounded-[4rem] overflow-hidden border-4 border-zinc-900">
                  <iframe 
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${v.key}`}
                    title={v.name}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              )) : <p className="text-center text-zinc-800 font-black uppercase text-2xl py-20">No Video Transmissions Available</p>}
            </div>
          )}

          {/* SIMILAR RECS */}
          <div className="space-y-20 pt-20 border-t border-zinc-900">
            <h3 className="text-xs font-black uppercase tracking-[0.8em] text-zinc-700">Neural Recommendations</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
              {recommendations.map(r => (
                <div key={r.id} className="space-y-4 cursor-pointer group" onClick={() => { setRecommendations([]); movie.id = r.id; /* Refresh logic simplified for brevity */ }}>
                  <img src={getImg(r.poster_path)} className="aspect-[2/3] object-cover rounded-[2rem] border-2 border-zinc-900 group-hover:border-red-600 transition-all" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase truncate text-center">{r.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ARCHITECTURAL FRAMEWORK ---
export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [view, setView] = useState<'home' | 'upcoming' | 'news' | 'legal'>('home');
  const [selected, setSelected] = useState<Movie | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  
  // Feature states
  const [showPrank, setShowPrank] = useState(false);
  const [showSuggester, setShowSuggester] = useState(false);
  const [hackerMode, setHackerMode] = useState(false);

  const fetchStream = useCallback(async (p: number) => {
    let uri = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${p}`;
    if (view === 'upcoming') uri = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${p}`;
    if (view === 'news') uri = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${p}`;
    
    try {
      const r = await fetch(uri);
      const d = await r.json();
      setMovies(prev => p === 1 ? d.results : [...prev, ...d.results]);
      setPage(p);
    } catch (e) { console.error(e); }
  }, [view]);

  useEffect(() => {
    fetchStream(1);
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchStream]);

  return (
    <div className={`min-h-screen transition-all duration-[1500ms] ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-white selection:bg-red-600'}`}>
      
      {hackerMode && <MatrixRain />}

      {/* HEADER: Ultra-Spaced for Mobile & Desktop (Screenshot Overlap Fix) */}
      <header className={`fixed top-0 w-full z-[500] transition-all px-10 py-12 md:py-20 ${scrolled || view !== 'home' ? 'bg-zinc-950/95 border-b-2 border-zinc-900 backdrop-blur-3xl' : 'bg-transparent'}`}>
        <div className="max-w-[1800px] mx-auto flex flex-col gap-16">
          <div className="flex items-center justify-between">
            <h1 className="text-6xl md:text-[6.5rem] font-black italic tracking-tighter text-red-600 cursor-pointer hover:skew-x-6 transition-transform" onClick={() => { setView('home'); window.scrollTo(0,0); }}>CINEWISE</h1>
            
            <div className="flex items-center gap-10">
               <button onClick={() => setShowPrank(true)} className="bg-red-600 p-8 rounded-[2.5rem] text-white shadow-[0_0_60px_rgba(220,38,38,0.6)] hover:rotate-12 transition-all">
                  <i className="fa-solid fa-skull text-3xl"></i>
               </button>
               <div className="relative group hidden lg:block">
                  <input type="text" placeholder="QUERY DATABASE..." className="bg-zinc-900/40 border-2 border-zinc-800 rounded-[2rem] py-6 px-16 text-[13px] w-[500px] outline-none focus:border-red-600 transition-all font-black tracking-[0.2em]" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <i className="fa-solid fa-ghost absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 text-lg"></i>
               </div>
            </div>
          </div>

          {/* NAVIGATION: Large Spaced Buttons */}
          <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar pb-8 md:justify-start">
            {['home', 'upcoming', 'news'].map(m => (
              <button key={m} onClick={() => { setView(m as any); setPage(1); }} className={`flex-shrink-0 px-16 py-6 rounded-3xl text-[13px] font-black uppercase tracking-[0.4em] transition-all ${view === m ? 'bg-red-600 text-white shadow-2xl scale-105' : 'bg-zinc-900 text-zinc-600 hover:text-white'}`}>
                {m}
              </button>
            ))}
            <div className="w-px h-12 bg-zinc-800 mx-8 flex-shrink-0"></div>
            <button onClick={() => setShowSuggester(true)} className="flex-shrink-0 px-12 py-6 bg-zinc-900 rounded-3xl text-[13px] font-black uppercase text-yellow-500 border-2 border-yellow-500/10 hover:border-yellow-500 transition-all">Assignment</button>
            <button onClick={() => setHackerMode(!hackerMode)} className={`flex-shrink-0 px-12 py-6 rounded-3xl text-[13px] font-black uppercase border-2 transition-all ${hackerMode ? 'bg-green-600 text-black border-green-400 shadow-[0_0_40px_rgba(34,197,94,0.5)]' : 'bg-zinc-900 text-zinc-700 border-zinc-800'}`}>Matrix</button>
          </nav>
        </div>
      </header>

      {view === 'legal' ? <LegalTerminal onClose={() => setView('home')} /> : (
        <main className={`px-10 md:px-32 py-40 ${search || view !== 'home' ? 'pt-96 md:pt-[450px]' : ''}`}>
          
          {/* SUPREME CINEMATIC HERO */}
          {!search && view === 'home' && movies[0] && (
            <div className="relative h-[85vh] md:h-[100vh] w-full rounded-[5rem] md:rounded-[8rem] overflow-hidden mb-64 border-4 border-zinc-900 group shadow-[0_80px_150px_rgba(0,0,0,0.7)]">
              <img src={getImg(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[3000ms] group-hover:scale-110" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-20 md:p-48 space-y-16 animate-in fade-in slide-in-from-left duration-[1500ms]">
                <div className="flex items-center gap-10">
                    <div className="h-2 w-32 bg-red-600"></div>
                    <p className="text-red-600 font-black tracking-[1em] uppercase text-sm">Priority Sequence 01</p>
                </div>
                <h2 className="text-9xl md:text-[20rem] font-black italic uppercase text-white leading-[0.7] tracking-tighter max-w-[90%]">{movies[0].title}</h2>
                <button onClick={() => setSelected(movies[0])} className="bg-white text-black font-black px-32 py-12 rounded-[4rem] text-sm uppercase tracking-[0.6em] hover:bg-red-600 hover:text-white transition-all shadow-2xl">Initialize Uplink</button>
              </div>
            </div>
          )}

          {/* DYNAMIC DATA GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16 md:gap-32">
            {movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).map((m, idx) => (
              <div key={`${m.id}-${idx}`} onClick={() => setSelected(m)} className="group cursor-pointer">
                <div className="aspect-[2/3] overflow-hidden rounded-[4.5rem] border-2 border-zinc-900 group-hover:border-red-600 transition-all duration-1000 group-hover:scale-[1.12] shadow-2xl relative">
                  <img src={getImg(m.poster_path)} className="h-full w-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-1000" alt={m.title} />
                  <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors"></div>
                </div>
                <div className="mt-12 space-y-5 px-6">
                    <p className="text-[12px] font-black text-red-600 uppercase tracking-[0.4em]">{m.release_date.split('-')[0]}</p>
                    <h3 className="text-sm md:text-lg font-black uppercase italic text-zinc-500 group-hover:text-white transition-colors truncate leading-tight tracking-widest">{m.title}</h3>
                </div>
              </div>
            ))}
          </div>

          {!search && (
            <div className="flex flex-col items-center mt-72 space-y-16">
              <div className="h-2 w-48 bg-zinc-900"></div>
              <button onClick={() => fetchStream(page + 1)} className="bg-zinc-900 text-white font-black px-40 py-14 rounded-[5rem] text-[13px] uppercase tracking-[0.8em] border-2 border-zinc-800 hover:bg-white hover:text-black hover:border-white transition-all shadow-2xl">
                Fetch Next Protocol
              </button>
            </div>
          )}
        </main>
      )}

      {/* FOOTER: Supreme Ethical Compliance & Spacing */}
      <footer className="py-80 bg-zinc-950 border-t-2 border-zinc-900 mt-64">
        <div className="max-w-[1800px] mx-auto px-16 grid grid-cols-1 md:grid-cols-4 gap-48">
          <div className="space-y-16">
            <h3 className="text-7xl font-black italic tracking-tighter text-red-600">CINEWISE</h3>
            <p className="text-[14px] font-bold text-zinc-700 leading-loose uppercase italic tracking-[0.2em] max-w-lg">The definitive 2026 standard for high-fidelity cinema intelligence. Built with total anonymity at its core. No logs. No limits.</p>
          </div>
          
          <div className="space-y-16">
            <h4 className="text-[18px] font-black uppercase text-white tracking-[0.6em]">Navigation</h4>
            <ul className="space-y-10 text-[13px] font-black text-zinc-600 uppercase italic">
              <li><button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="hover:text-red-600 transition-colors">Universal Archive</button></li>
              <li><button onClick={() => setView('upcoming')} className="hover:text-red-600 transition-colors">Future Temporal Nodes</button></li>
              <li><button onClick={() => setView('news')} className="hover:text-red-600 transition-colors">Active Transmission</button></li>
            </ul>
          </div>

          <div className="space-y-16">
            <h4 className="text-[18px] font-black uppercase text-white tracking-[0.6em]">Resources</h4>
            <ul className="space-y-10 text-[13px] font-black text-zinc-600 uppercase italic">
              <li><a href="https://bgremoverai.online" target="_blank" className="text-zinc-500 underline underline-offset-[14px] decoration-zinc-800 hover:text-white hover:decoration-red-600 transition-all">FREE BACKGROUND REMOVAL</a></li>
              <li><button onClick={() => setView('legal')} className="hover:text-white transition-colors">Privacy Protocols</button></li>
              <li><button onClick={() => setView('legal')} className="hover:text-white transition-colors">Ethical Compliance</button></li>
            </ul>
          </div>

          <div className="md:text-right flex flex-col items-start md:items-end justify-between space-y-20">
             <div className="flex items-center gap-8 bg-zinc-900/50 px-14 py-8 rounded-[3rem] border-2 border-zinc-900">
                <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse shadow-[0_0_40px_rgba(34,197,94,0.8)]"></div>
                <span className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.3em]">Network: Synchronized</span>
             </div>
             <div className="space-y-6">
                <p className="text-[12px] font-black text-zinc-800 tracking-[1em] uppercase leading-none">CINEWISE // ANONYMOUS ENGINE 2026</p>
                <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">ZERO DATA RETENTION • NO LOGIN REQUIRED</p>
             </div>
          </div>
        </div>
      </footer>

      {/* MODAL OVERLAYS */}
      {showPrank && <GhostFacePrank onClose={() => setShowPrank(false)} />}
      {showSuggester && <MovieSuggester onClose={() => setShowSuggester(false)} onSelect={(m) => setSelected(m)} />}
      {selected && <MovieDetailModal movie={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
