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

// --- UTILITY: DATE CALCULATOR ---
const getReleaseStatus = (date: string) => {
  if (!date) return 'Unknown Date';
  const releaseDate = new Date(date);
  const today = new Date();
  const diffTime = releaseDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} Days to Go`;
  } else if (diffDays === 0) {
    return "Releasing Today";
  } else {
    return `Released ${Math.abs(diffDays)} Days Ago`;
  }
};

const formatFullDate = (date: string) => {
  if (!date) return "TBA";
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// --- FEATURE: MATRIX EFFECT ---
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
    const draw = () => {
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
    const timer = setInterval(draw, 33);
    return () => clearInterval(timer);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-20 pointer-events-none" />;
};

// --- FEATURE: SPOILER ROULETTE ---
const SpoilerRoulette: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [spoiler, setSpoiler] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const leaks = [
    "SCREAM 7: Ghostface is actually working for a secret cinema society.",
    "AVATAR 3: The fire nation will use volcanic technology to attack.",
    "SPIDER-MAN 4: Peter starts working at a tech startup to fund his suit.",
    "JOKER 2: Arthur Fleck's cell mate is a former circus performer.",
    "BEYOND THE SPIDER-VERSE: Gwen Stacy from 5 alternate timelines appear.",
    "SUPERMAN 2025: Lex Luthor discovers Kryptonite in an ancient temple.",
    "BATMAN 2: The Penguin hires a mercenary to hunt the bat.",
    "GLADIATOR 2: The final battle takes place in a flooded Colosseum.",
    "MISSION IMPOSSIBLE 9: Ethan Hunt goes into space for a 20-minute sequence."
  ];
  const spin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setSpoiler(leaks[Math.floor(Math.random() * leaks.length)]);
      setIsSpinning(false);
    }, 1200);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-xl bg-zinc-900 border-2 border-yellow-500 rounded-[3.5rem] p-12 text-center space-y-10 shadow-[0_0_100px_rgba(234,179,8,0.15)]">
        <h3 className="text-5xl font-black italic text-yellow-500 uppercase tracking-tighter">Movie Leaks</h3>
        <div className="py-12 border-y border-zinc-800">
          <p className={`text-2xl font-bold italic transition-all duration-500 ${isSpinning ? 'opacity-20 blur-xl scale-90' : 'opacity-100 text-white'}`}>
            {spoiler || "Accessing 2026 confidential files..."}
          </p>
        </div>
        <div className="space-y-4">
          <button onClick={spin} className="w-full bg-yellow-500 text-black font-black py-7 rounded-[2rem] hover:scale-105 transition-all uppercase tracking-widest text-sm">SPIN ROULETTE</button>
          <button onClick={onClose} className="text-zinc-600 uppercase font-black text-[10px] tracking-[0.4em] hover:text-white transition-colors">Abort Access</button>
        </div>
      </div>
    </div>
  );
};

// --- FEATURE: VIBE MATCHER ---
const VibeMatcher: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [match, setMatch] = useState<{name: string, desc: string} | null>(null);
  const vibes = [
    { name: 'Villain Era', desc: 'Powerful, dark, and completely misunderstood.' },
    { name: 'Lonely God', desc: 'Melancholic excellence in total solitude.' },
    { name: 'Main Character', desc: 'The universe literally revolves around you.' },
    { name: 'Cyberpunk Soul', desc: 'High tech, low life, and bright neon dreams.' },
    { name: 'Plot Armor', desc: 'Invincible energy, nothing can touch you today.' },
    { name: 'Final Girl', desc: 'Survival instincts are at an all-time high.' },
    { name: 'The Mentor', desc: 'Wise, calm, and slightly detached from reality.' }
  ];
  return (
    <div className="fixed inset-0 z-[600] bg-zinc-950/98 flex items-center justify-center p-6 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white rounded-[4rem] p-16 text-black space-y-12">
        <h3 className="text-6xl font-black italic uppercase tracking-tighter">Vibe Check</h3>
        <div className="grid grid-cols-2 gap-4">
          {vibes.map(v => (
            <button key={v.name} onClick={() => setMatch(v)} className="border-4 border-black py-6 rounded-3xl font-black uppercase text-[10px] hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">
              {v.name}
            </button>
          ))}
        </div>
        {match && (
          <div className="bg-zinc-100 p-10 rounded-[3rem] text-center animate-bounce-short border-2 border-black/5">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-40">Matched Persona</p>
            <p className="text-5xl font-black italic uppercase text-red-600 tracking-tighter mb-2">{match.name}</p>
            <p className="text-xs font-bold text-zinc-500 italic uppercase">{match.desc}</p>
          </div>
        )}
        <button onClick={onClose} className="w-full text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Back to Cinema</button>
      </div>
    </div>
  );
};

// --- FEATURE: SCREAM CALL ---
const GhostFacePrank: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [victim, setVictim] = useState('');
  const [status, setStatus] = useState<'idle' | 'calling' | 'active'>('idle');
  const triggerCall = () => {
    if (!victim) return;
    setStatus('calling');
    setTimeout(() => {
      setStatus('active');
      const speech = new SpeechSynthesisUtterance(`Hello... ${victim}... I am outside. Do you want to see a movie?`);
      speech.pitch = 0.1; speech.rate = 0.7;
      window.speechSynthesis.speak(speech);
      speech.onend = () => setStatus('idle');
    }, 3000);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-600 rounded-[4rem] p-12 text-center space-y-12">
        <div className="space-y-4">
          <h3 className="text-6xl font-black italic text-red-600 uppercase tracking-tighter">Scream Call</h3>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Encrypted Voice Link</p>
        </div>
        <input type="text" placeholder="Enter Victim Name" className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-3xl py-8 px-8 text-white text-center text-xl outline-none focus:border-red-600 transition-all" value={victim} onChange={e => setVictim(e.target.value)} />
        <button onClick={triggerCall} className="w-full bg-red-600 text-white font-black py-8 rounded-[2rem] hover:scale-105 transition-all uppercase tracking-widest">
          {status === 'idle' ? 'START CALL' : status === 'calling' ? '📞 CONNECTING...' : '🔪 ACTIVE'}
        </button>
        <button onClick={onClose} className="text-[10px] text-zinc-500 uppercase font-black">Close Prank</button>
      </div>
    </div>
  );
};

// --- MOVIE DETAIL MODAL ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [video, setVideo] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      setLoading(true);
      Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`).then(r => r.json()),
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`).then(r => r.json()),
        fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`).then(r => r.json())
      ]).then(([vData, cData, pData]) => {
        const trailer = vData.results?.find((v: any) => v.type === 'Trailer');
        setVideo(trailer?.key || null);
        setCast(cData.cast?.slice(0, 15) || []);
        setProviders(pData.results?.US?.flatrate || pData.results?.IN?.flatrate || []);
        setLoading(false);
      });
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/98 backdrop-blur-3xl overflow-y-auto pt-20 px-4 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto bg-zinc-900 rounded-[4rem] overflow-hidden border border-zinc-800 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 z-[210] bg-black/50 text-white w-12 h-12 rounded-full hover:bg-red-600 transition-all flex items-center justify-center">✕</button>
        
        <div className="aspect-video bg-black relative">
          {video ? (
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${video}?autoplay=1`} title="Trailer" frameBorder="0" allowFullScreen></iframe>
          ) : (
            <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-40" alt="Backdrop" />
          )}
        </div>

        <div className="p-10 md:p-20 space-y-16">
          <div className="space-y-6">
            <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter text-white">{movie.title}</h2>
            <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="bg-red-600 px-6 py-2 rounded-full text-white">{getReleaseStatus(movie.release_date)}</span>
              <span className="bg-zinc-800 px-6 py-2 rounded-full text-zinc-400">Score: {Math.round(movie.vote_average * 10)}%</span>
              <span className="bg-zinc-800 px-6 py-2 rounded-full text-zinc-400">{formatFullDate(movie.release_date)}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">The Storyline</h3>
              <p className="text-2xl md:text-3xl font-light text-zinc-300 italic leading-relaxed leading-snug">"{movie.overview}"</p>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-600">Where to Watch</h3>
              <div className="flex flex-wrap gap-4">
                {providers.length > 0 ? providers.map(p => (
                  <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} className="w-14 h-14 rounded-2xl border border-zinc-700" alt={p.provider_name} title={p.provider_name} />
                )) : <p className="text-[10px] text-zinc-600 font-bold uppercase">No streaming data available for 2026</p>}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Starring Cast</h3>
            <div className="flex gap-10 overflow-x-auto pb-10 scrollbar-hide">
              {cast.map(c => (
                <div key={c.id} className="flex-shrink-0 w-32 md:w-44 text-center space-y-4">
                  <div className="aspect-square rounded-full overflow-hidden border-2 border-zinc-800 hover:border-red-600 transition-all">
                    <img src={getImageUrl(c.profile_path, 'w185')} className="w-full h-full object-cover" alt={c.name} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-white leading-none mb-1">{c.name}</p>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase italic leading-none">{c.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LEGAL MODAL ---
const LegalTerminal: React.FC<{onClose: () => void}> = ({onClose}) => (
  <div className="fixed inset-0 z-[700] bg-zinc-950 overflow-y-auto animate-in fade-in duration-500">
    <div className="max-w-4xl mx-auto py-32 px-10 space-y-20">
      <div className="text-center space-y-4">
        <h2 className="text-8xl md:text-[12rem] font-black italic uppercase tracking-tighter text-white">LEGAL</h2>
        <p className="text-red-600 font-black tracking-[1em] uppercase text-[10px]">CINEWISE // 2026 ENCRYPTION</p>
      </div>
      <div className="space-y-12">
        <section className="border-l-4 border-red-600 pl-8 space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-widest text-white">Privacy Protocol</h3>
          <p className="text-zinc-500 font-bold text-lg italic leading-relaxed">
            Hum koi bhi personal information collect nahi karte. CINEWISE is built for total anonymity. 
            Movies ka data TMDB se load hota hai. Agar aapko images se background hatana hai, toh hum sirf 
            <span className="text-white mx-2 underline cursor-pointer">bgremoverai.online</span> suggest karte hain kyunki wahan koi login nahi chahiye.
          </p>
        </section>
        <section className="border-l-4 border-red-600 pl-8 space-y-4">
          <h3 className="text-2xl font-black uppercase tracking-widest text-white">Usage Terms</h3>
          <p className="text-zinc-500 font-bold text-lg italic leading-relaxed">
            1. Yeh platform sirf educational aur entertainment ke liye hai. <br />
            2. Hum koi pirated content host nahi karte, sirf metadata provide karte hain. <br />
            3. Scream Prank tool ka use harrasment ke liye na karein.
          </p>
        </section>
      </div>
      <div className="text-center">
        <button onClick={onClose} className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:bg-red-600 hover:text-white transition-all text-xs uppercase tracking-widest">Acknowledge</button>
      </div>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'upcoming' | 'latest' | 'legal'>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hackerMode, setHackerMode] = useState(false);
  
  // Feature States
  const [prank, setPrank] = useState(false);
  const [roulette, setRoulette] = useState(false);
  const [vibe, setVibe] = useState(false);

  const fetchMovies = useCallback(async (p: number, mode: string) => {
    let url = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${p}`;
    if (mode === 'upcoming') url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${p}`;
    if (mode === 'latest') url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${p}`;
    
    const res = await fetch(url);
    const data = await res.json();
    setMovies(prev => p === 1 ? data.results : [...prev, ...data.results]);
    setPage(p);
  }, []);

  useEffect(() => {
    fetchMovies(1, view);
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view, fetchMovies]);

  return (
    <div className={`min-h-screen ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-white'} transition-colors duration-1000`}>
      
      {hackerMode && <MatrixRain />}

      <header className={`fixed top-0 w-full z-[100] px-6 md:px-20 py-8 flex items-center justify-between transition-all duration-500 ${isScrolled || view !== 'home' ? 'bg-black/80 backdrop-blur-3xl py-4 border-b border-zinc-900' : 'bg-transparent'}`}>
        <div className="flex items-center gap-12">
          <h1 className="text-4xl font-black italic tracking-tighter text-red-600 cursor-pointer" onClick={() => setView('home')}>CINEWISE</h1>
          <nav className="hidden xl:flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
            {['home', 'upcoming', 'latest'].map(m => (
              <button key={m} onClick={() => setView(m as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === m ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                {m}
              </button>
            ))}
            <div className="w-px h-4 bg-zinc-800 mx-2" />
            <button onClick={() => setVibe(true)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">Vibe</button>
            <button onClick={() => setRoulette(true)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:text-white">Leaks</button>
            <button onClick={() => setHackerMode(!hackerMode)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-white">{hackerMode ? 'Exit' : 'Matrix'}</button>
          </nav>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <button onClick={() => setPrank(true)} className="bg-red-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all">
            <span className="hidden md:inline">Scream Call</span> 📞
          </button>
          <div className="relative group max-w-xs w-full">
            <input type="text" placeholder="Search Database..." className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-xl py-3 px-6 text-[10px] font-black outline-none focus:border-red-600 transition-all text-white" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </header>

      {view === 'legal' ? (
        <LegalTerminal onClose={() => setView('home')} />
      ) : (
        <div className="relative z-10">
          {!search && view === 'home' && movies[0] && (
            <section className="relative h-screen flex items-center px-10 md:px-24 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              <div className="relative max-w-5xl space-y-10">
                <span className="bg-red-600 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">Trending Choice</span>
                <h2 className="text-7xl md:text-[10rem] font-black uppercase italic tracking-tighter leading-[0.85] text-white">{movies[0].title}</h2>
                <button onClick={() => setSelected(movies[0])} className="bg-white text-black font-black px-16 py-6 rounded-[2rem] hover:bg-red-600 hover:text-white transition-all text-xs uppercase tracking-widest shadow-2xl">View Detailed File</button>
              </div>
            </section>
          )}

          <main className="px-6 md:px-20 py-40">
            <div className="flex items-center gap-8 mb-20">
              <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-zinc-700">{view} Archive</h2>
              <div className="h-px flex-1 bg-zinc-900" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 md:gap-16">
              {movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).map(m => (
                <div key={m.id} onClick={() => setSelected(m)} className="group cursor-pointer space-y-6">
                  <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden border-2 border-zinc-900 group-hover:border-red-600 transition-all duration-700 relative bg-zinc-900">
                    <img src={getImageUrl(m.poster_path)} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000 group-hover:opacity-40" alt={m.title} />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">{getReleaseStatus(m.release_date)}</p>
                      <h4 className="text-lg font-black uppercase italic text-white leading-tight">{m.title}</h4>
                    </div>
                  </div>
                  <div className="px-4">
                    <h4 className="text-[11px] font-black uppercase text-zinc-300 truncate">{m.title}</h4>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{m.release_date.split('-')[0]} // {Math.round(m.vote_average * 10)}%</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-32">
              <button onClick={() => fetchMovies(page + 1, view)} className="bg-zinc-900 border-2 border-zinc-800 text-white font-black px-20 py-7 rounded-[2.5rem] hover:bg-white hover:text-black transition-all text-[10px] uppercase tracking-[0.4em]">Load More Records</button>
            </div>
          </main>
        </div>
      )}

      {/* --- SITE STATS SECTION --- */}
      <section className="px-10 py-24 border-y border-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Database Hits', val: '4.2M+' },
            { label: 'Streaming Nodes', val: '128' },
            { label: 'Daily Requests', val: '890K' },
            { label: 'Uptime 2026', val: '100%' }
          ].map(stat => (
            <div key={stat.label} className="space-y-2">
              <p className="text-4xl md:text-6xl font-black italic tracking-tighter text-white">{stat.val}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-32 px-10 bg-zinc-950 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="space-y-8">
            <h3 className="text-4xl font-black italic tracking-tighter text-red-600">CINEWISE</h3>
            <p className="text-xs font-bold text-zinc-600 uppercase italic leading-loose tracking-wider">
              An open movie database protocol. Built for speed, privacy, and cinema enthusiasts. No registration, no cookies, just raw data.
            </p>
          </div>
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Navigation</h4>
            <ul className="space-y-4 text-[11px] font-black text-zinc-500 uppercase italic">
              <li><button onClick={() => setView('home')} className="hover:text-red-600">Archive Home</button></li>
              <li><button onClick={() => setView('upcoming')} className="hover:text-red-600">Future Releases</button></li>
              <li><button onClick={() => setView('latest')} className="hover:text-red-600">Current Waves</button></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Resources</h4>
            <ul className="space-y-4 text-[11px] font-black text-zinc-500 uppercase italic">
              <li><button onClick={() => setView('legal')} className="hover:text-white">Security Policy</button></li>
              <li><button onClick={() => window.open('https://bgremoverai.online', '_blank')} className="text-zinc-400 hover:text-white underline">Bg Remover (Free Tool)</button></li>
              <li className="text-zinc-700">API Documentation</li>
            </ul>
          </div>
          <div className="flex flex-col items-end gap-6">
            <div className="flex items-center gap-4 bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]" />
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Global Server Online</span>
            </div>
            <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] text-right">
              2026 © CINEWISE DECENTRALIZED <br />
              POWERED BY TMDB ENGINE
            </p>
          </div>
        </div>
      </footer>

      {/* Feature Components */}
      {prank && <GhostFacePrank onClose={() => setPrank(false)} />}
      {roulette && <SpoilerRoulette onClose={() => setRoulette(false)} />}
      {vibe && <VibeMatcher onClose={() => setVibe(false)} />}
      <MovieDetailModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default App;
