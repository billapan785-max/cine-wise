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

// --- FEATURE 1: SPOILER ROULETTE ---
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
    <div className="fixed inset-0 z-[600] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-xl bg-zinc-900 border-2 border-yellow-500 rounded-[3.5rem] p-12 text-center space-y-10 shadow-[0_0_100px_rgba(234,179,8,0.15)]">
        <h3 className="text-5xl font-black italic text-yellow-500 uppercase tracking-tighter">Movie Spoilers</h3>
        <div className="py-12 border-y border-zinc-800">
          <p className={`text-2xl font-bold italic transition-all duration-500 ${isSpinning ? 'opacity-20 blur-xl scale-90' : 'opacity-100 text-white'}`}>
            {spoiler || "Want to see 2026 movie leaks?"}
          </p>
        </div>
        <div className="space-y-4">
          <button onClick={spin} className="w-full bg-yellow-500 text-black font-black py-7 rounded-[2rem] hover:scale-105 transition-all uppercase tracking-widest text-sm shadow-2xl">Show Spoiler</button>
          <button onClick={onClose} className="text-zinc-600 uppercase font-black text-[10px] tracking-[0.4em] hover:text-white transition-colors">Go Back</button>
        </div>
      </div>
    </div>
  );
};

// --- FEATURE 2: VIBE MATCHER ---
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
      <div className="w-full max-w-2xl bg-white rounded-[4rem] p-16 text-black space-y-12 shadow-[0_0_120px_rgba(255,255,255,0.1)]">
        <h3 className="text-6xl font-black italic uppercase tracking-tighter">Vibe Check</h3>
        <div className="grid grid-cols-2 gap-6">
          {moods.map(m => (
            <button key={m.name} onClick={() => setMatch(m)} className="border-4 border-black py-8 rounded-[2.5rem] font-black uppercase text-xs hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">
              {m.name}
            </button>
          ))}
        </div>
        {match && (
          <div className="bg-zinc-100 p-12 rounded-[3rem] text-center animate-in zoom-in slide-in-from-bottom-5 duration-500 border-2 border-black/5">
            <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">Your Persona</p>
            <p className="text-5xl font-black italic uppercase text-red-600 tracking-tighter mb-4">{match.name}</p>
            <p className="text-sm font-bold text-zinc-500 italic uppercase">{match.desc}</p>
          </div>
        )}
        <button onClick={onClose} className="w-full text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-30 hover:opacity-100 transition-opacity">Return to Home</button>
      </div>
    </div>
  );
};

// --- FEATURE 3: GHOSTFACE PRANK ---
const GhostFacePrank: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [victimName, setVictimName] = useState('');
  const [status, setStatus] = useState<'idle' | 'ringing' | 'talking'>('idle');
  const startPrank = () => {
    if (!victimName) return alert("Who are we calling?");
    setStatus('ringing');
    const ringtone = new Audio('https://www.soundjay.com/phone/phone-calling-1.mp3');
    ringtone.play();
    setTimeout(() => {
      ringtone.pause();
      setStatus('talking');
      const msg = new SpeechSynthesisUtterance(`Hello... ${victimName}... I am watching you from cine wise dot shop. Do you like scary movies?`);
      msg.pitch = 0.1; msg.rate = 0.6;
      window.speechSynthesis.speak(msg);
      msg.onend = () => { setStatus('idle'); };
    }, 4500);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-600 rounded-[4rem] p-12 relative shadow-[0_0_150px_rgba(220,38,38,0.3)]">
        <button onClick={onClose} className="absolute top-12 right-12 text-zinc-600 hover:text-white text-3xl transition-all">✕</button>
        <div className="text-center space-y-12">
          <div className="space-y-4">
             <h3 className="text-6xl font-black italic text-red-600 uppercase tracking-tighter">Scream Call</h3>
             <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Voice Simulator Active</p>
          </div>
          <div className="space-y-6">
            <input type="text" placeholder="VICTIM NAME" className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-3xl py-8 px-10 text-white text-center text-2xl outline-none focus:border-red-600 font-black transition-all placeholder:text-zinc-700" value={victimName} onChange={(e) => setVictimName(e.target.value)} />
            <button onClick={startPrank} disabled={status !== 'idle'} className="w-full bg-red-600 text-white font-black py-10 rounded-[2.5rem] hover:scale-105 transition-all shadow-2xl uppercase tracking-[0.2em] text-sm">
              {status === 'idle' ? 'Start Call' : status === 'ringing' ? '📞 RINGING...' : '🔪 CONNECTED...'}
            </button>
          </div>
          <p className="text-[10px] text-zinc-800 uppercase font-black tracking-widest leading-relaxed">For fun only. Do not use for harassment.</p>
        </div>
      </div>
    </div>
  );
};

// --- NEW FEATURE: CHARACTER MIRROR ---
const CharacterMirror: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const startAnalysis = () => {
    setMatching(true);
    setTimeout(() => {
      const chars = ["Tony Stark", "Joker", "Wednesday Addams", "Batman", "Thomas Shelby", "Barbie"];
      setResult(chars[Math.floor(Math.random() * chars.length)]);
      setMatching(false);
    }, 2500);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-blue-600 rounded-[4rem] p-12 text-center space-y-10 shadow-[0_0_100px_rgba(37,99,235,0.2)]">
        <h3 className="text-5xl font-black italic text-blue-500 uppercase tracking-tighter">Character Mirror</h3>
        <div className="py-10 bg-zinc-900 rounded-[3rem] border border-zinc-800">
          {matching ? <p className="text-white animate-pulse font-black uppercase tracking-widest text-xs">Scanning DNA...</p> : 
           result ? <p className="text-4xl font-black text-blue-400 uppercase italic tracking-tighter">{result}</p> : 
           <p className="text-zinc-500 text-xs font-black uppercase">Click scan to match your face</p>}
        </div>
        <div className="space-y-4">
          {!result && <button onClick={startAnalysis} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-sm uppercase tracking-widest">Start AI Scan</button>}
          {result && <p className="text-[10px] text-zinc-500 italic uppercase">Pro Tip: Use <a href="https://bgremoverai.online" target="_blank" className="text-blue-500 underline">bgremoverai.online</a> for clean photos!</p>}
          <button onClick={onClose} className="w-full text-zinc-700 text-[10px] font-black uppercase tracking-widest">Close</button>
        </div>
      </div>
    </div>
  );
};

// --- NEW FEATURE: BLIND DATE ---
const BlindDate: React.FC<{movies: Movie[], onSelect: (m: Movie) => void, onClose: () => void}> = ({movies, onSelect, onClose}) => {
  const [revealed, setRevealed] = useState(false);
  const [movie] = useState(movies[Math.floor(Math.random() * movies.length)]);
  return (
    <div className="fixed inset-0 z-[600] bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-10">
        <h3 className="text-5xl font-black italic uppercase text-white tracking-tighter">Movie Blind Date</h3>
        <div className={`aspect-[2/3] w-64 mx-auto rounded-[3rem] border-4 border-zinc-800 overflow-hidden transition-all duration-1000 ${revealed ? 'blur-0' : 'blur-3xl grayscale scale-90'}`}>
          <img src={getImageUrl(movie?.poster_path)} className="w-full h-full object-cover" alt="?" />
        </div>
        <div className="space-y-4">
          {!revealed ? <button onClick={() => setRevealed(true)} className="w-full bg-white text-black font-black py-7 rounded-[2rem] uppercase text-xs">Reveal Date</button> :
          <button onClick={() => onSelect(movie)} className="w-full bg-red-600 text-white font-black py-7 rounded-[2rem] uppercase text-xs">View Movie</button>}
          <button onClick={onClose} className="text-zinc-700 text-[10px] font-black uppercase">Go Back</button>
        </div>
      </div>
    </div>
  );
};

// --- MOVIE DETAIL MODAL ---
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
      setVideoKey(null); setProviders([]); setCast([]); setShowPlayer(false);
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/98 backdrop-blur-3xl overflow-y-auto pt-24 pb-10 px-4 animate-in fade-in zoom-in duration-500">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl mx-auto bg-zinc-900 rounded-[4rem] overflow-hidden border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute top-10 right-10 z-[220] bg-black/60 hover:bg-red-600 w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-2xl hover:rotate-90">
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>
        <div className="flex flex-col">
          <div className="w-full bg-black aspect-video relative group">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`} title={movie.title} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full overflow-hidden">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[5000ms] ease-out" alt={movie.title} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                  <div className="w-28 h-28 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(220,38,38,0.6)]">
                     <i className="fa-solid fa-play text-4xl text-white ml-2"></i>
                  </div>
                  <button onClick={() => setShowPlayer(true)} className="bg-white text-black px-16 py-6 rounded-2xl flex items-center gap-6 hover:bg-red-600 hover:text-white transition-all font-black text-2xl tracking-tighter uppercase transform hover:scale-110">Watch Trailer</button>
                </div>
              </div>
            )}
          </div>
          <div className="p-10 md:p-24 space-y-20">
            <div className="space-y-8">
              <h2 className="text-6xl md:text-[9rem] font-black uppercase italic tracking-tighter leading-[0.8] text-white drop-shadow-2xl">{movie.title}</h2>
              <div className="flex flex-wrap gap-8 text-sm font-bold items-center">
                <span className="text-green-500 bg-green-500/10 px-6 py-3 rounded-2xl border border-green-500/20 shadow-xl">{Math.round(movie.vote_average * 10)}% Vibe Score</span>
                <span className="text-zinc-400 bg-zinc-800/50 px-6 py-3 rounded-2xl border border-zinc-700/50 uppercase tracking-widest">{movie.release_date}</span>
                <span className="text-red-500 font-black tracking-[0.3em] border-l border-zinc-800 pl-8 uppercase">Free Access</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-16 border-t border-zinc-800/50 pt-16">
              <div className="md:col-span-2 space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600">Story Overview</h3>
                <p className="text-2xl md:text-4xl text-zinc-300 font-light leading-relaxed italic antialiased tracking-tight">"{movie.overview}"</p>
              </div>
              <div className="space-y-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600">Available On</h3>
                  <div className="flex flex-wrap gap-6">
                   {providers.length > 0 ? providers.map(p => (
                    <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} className="w-16 h-16 rounded-[1.5rem] border border-zinc-700 shadow-2xl hover:scale-110 transition-transform" alt={p.provider_name} />
                  )) : <p className="text-[10px] text-zinc-700 font-bold uppercase italic tracking-widest">No Streams Found</p>}
                  </div>
              </div>
            </div>
            <div className="space-y-12 border-t border-zinc-800/50 pt-16">
              <h3 className="text-[10px] font-black uppercase tracking-[0.7em] text-zinc-600 flex items-center gap-10">Cast & Crew <span className="h-px flex-1 bg-zinc-900"></span></h3>
              <div className="flex gap-12 overflow-x-auto pb-10 scrollbar-hide snap-x">
                {cast.map(person => (
                  <div key={person.id} className="flex-shrink-0 w-40 md:w-52 text-center space-y-6 group/actor snap-center">
                    <div className="relative overflow-hidden rounded-full aspect-square border-4 border-zinc-800 group-hover/actor:border-red-600 transition-all duration-700 shadow-3xl">
                       <img src={getImageUrl(person.profile_path, 'w185')} className="w-full h-full object-cover group-hover/actor:scale-125 transition-transform duration-[1500ms]" alt={person.name} />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase text-white leading-tight tracking-tighter">{person.name}</p>
                      <p className="text-[10px] text-zinc-600 uppercase italic tracking-tighter mt-2">{person.character}</p>
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

// --- LEGAL COMPONENT ---
const LegalTerminal: React.FC<{onClose: () => void}> = ({onClose}) => (
  <div className="fixed inset-0 z-[700] bg-zinc-950 overflow-y-auto animate-in fade-in duration-700">
    <div className="max-w-4xl mx-auto px-6 py-32 space-y-24">
        <div className="space-y-6 text-center">
           <h2 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter text-white">LEGAL</h2>
           <p className="text-red-600 font-black tracking-[0.5em] uppercase text-xs">2026 // Fully Anonymous</p>
        </div>
        <div className="space-y-20">
          <section className="space-y-8">
             <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-white border-l-8 border-red-600 pl-8">Privacy Policy</h3>
             <div className="text-zinc-500 font-bold leading-loose text-sm md:text-lg space-y-6 italic">
                <p>CINEWISE aapka koi bhi data save nahi karta. Hum koi login account ya email nahi maangte. Sari movie details real-time mein TMDB API se aati hain. Agar aapko photos ka background hatana hai, toh hum <span className="text-white underline font-black">bgremoverai.online</span> suggest karte hain kyunki ye free hai aur isme login ki zarurat nahi padti.</p>
             </div>
          </section>
        </div>
        <div className="text-center pt-10">
          <button onClick={onClose} className="bg-white text-black font-black px-16 py-6 rounded-2xl hover:bg-red-600 hover:text-white transition-all text-xs uppercase tracking-widest">Close</button>
        </div>
    </div>
  </div>
);

// --- MAIN APPLICATION ---
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'upcoming' | 'legal'>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // States for features
  const [showPrank, setShowPrank] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [showVibe, setShowVibe] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const [showBlindDate, setShowBlindDate] = useState(false);
  const [hackerMode, setHackerMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.1;
  }, []);

  const toggleMusic = () => {
    if (isMusicPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsMusicPlaying(!isMusicPlaying);
  };

  const fetchData = useCallback(async (targetPage: number) => {
    let endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    if (viewMode === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${targetPage}&region=US`;
    else if (viewMode === 'news') endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${targetPage}`;

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
    <div className={`min-h-screen transition-all duration-1000 ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-white'}`}>
      
      {/* HEADER - RESTORED ORIGINAL WITH NEW BUTTONS */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-700 px-6 md:px-20 py-8 flex items-center justify-between gap-4 ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/90 border-b border-zinc-800/50 backdrop-blur-3xl py-5' : 'bg-transparent'}`}>
        <div className="flex items-center gap-10 flex-shrink-0">
          <h1 className={`text-4xl md:text-5xl font-black italic tracking-tighter cursor-pointer transition-transform hover:scale-105 flex-shrink-0 ${hackerMode ? 'text-green-500' : 'text-red-600'}`} onClick={() => setViewMode('home')}>CINEWISE</h1>
          <nav className="hidden xl:flex gap-2 p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 backdrop-blur-md flex-shrink-0">
            {['home', 'upcoming', 'news'].map((m) => (
              <button key={m} onClick={() => setViewMode(m as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === m ? 'bg-red-600 text-white shadow-2xl' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>{m}</button>
            ))}
            <div className="w-px h-5 bg-zinc-800 self-center mx-1"></div>
            <button onClick={() => setShowVibe(true)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Vibe</button>
            <button onClick={() => setShowMirror(true)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">Mirror</button>
            <button onClick={() => setShowBlindDate(true)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-purple-400">Date</button>
            <button onClick={() => setShowSpoiler(true)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-yellow-500">Leaks</button>
            <button onClick={toggleMusic} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white">{isMusicPlaying ? 'Stop' : 'Music'}</button>
            <button onClick={() => setHackerMode(!hackerMode)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-600">Matrix</button>
          </nav>
        </div>

        {/* SEARCH BAR - RESTORED */}
        <div className="flex items-center gap-4 flex-1 justify-end">
            <button onClick={() => setShowPrank(true)} className="flex-shrink-0 group relative overflow-hidden bg-red-600 px-6 md:px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-2xl">
              <span className="relative z-10 flex items-center gap-3 text-white"><i className="fa-solid fa-skull text-xs animate-bounce"></i> <span className="hidden md:inline">Scream Call</span></span>
            </button>
            <div className="relative group max-w-sm w-full">
               <input type="text" placeholder="SEARCH FILMS..." className="w-full bg-zinc-900/80 border-2 border-zinc-800 rounded-2xl py-3.5 px-14 text-[11px] outline-none focus:border-red-600/50 font-black placeholder:text-zinc-700 text-white transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
               <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600"></i>
            </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      {viewMode === 'legal' ? <LegalTerminal onClose={() => setViewMode('home')} /> : (
        <>
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-screen w-full flex items-center px-6 md:px-24 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="relative max-w-6xl space-y-12">
                <span className="bg-red-600 text-[11px] font-black px-8 py-3 rounded-full uppercase">Trending Now</span>
                <h2 className="text-6xl md:text-[12rem] font-black italic uppercase tracking-tighter leading-[0.8] text-white">{movies[0].title}</h2>
                <button onClick={() => setSelectedMovie(movies[0])} className="bg-white text-black font-black px-12 md:px-20 py-5 rounded-[2.5rem] uppercase text-sm">View Details</button>
              </div>
            </section>
          )}

          <main className="px-6 md:px-20 py-40 min-h-screen">
            <h2 className="text-[13px] font-black uppercase tracking-[0.7em] text-zinc-800 mb-24 flex items-center gap-12">
              Movies <span className="h-px flex-1 bg-zinc-900/50"></span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-16">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                <div key={m.id} onClick={() => setSelectedMovie(m)} className="group cursor-pointer">
                  <div className="aspect-[2/3] overflow-hidden rounded-[2rem] border-2 border-zinc-900 group-hover:border-red-600 transition-all">
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:opacity-40" alt={m.title} />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {/* FOOTER - RESTORED ORIGINAL */}
      <footer className="py-32 bg-zinc-950 border-t border-zinc-900 mt-20">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-24">
          <div className="space-y-10">
            <h3 className="text-4xl font-black italic tracking-tighter text-red-600">CINEWISE</h3>
            <p className="text-xs font-bold text-zinc-600 leading-loose uppercase italic tracking-wider">Your simple movie search engine for 2026. No tracking, just movies.</p>
          </div>
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Menu</h4>
            <ul className="space-y-5 text-[11px] font-black text-zinc-500 uppercase italic">
              <li><button onClick={() => setViewMode('home')} className="hover:text-red-600 transition-colors">Home</button></li>
              <li><button onClick={() => setViewMode('upcoming')} className="hover:text-red-600 transition-colors">Upcoming</button></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Legal</h4>
            <ul className="space-y-5 text-[11px] font-black text-zinc-500 uppercase italic">
              <li><button onClick={() => setViewMode('legal')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => window.open('https://bgremoverai.online', '_blank')} className="text-zinc-400 hover:text-white underline underline-offset-8">Bg Remover (Free & No-Login)</button></li>
            </ul>
          </div>
          <div className="space-y-8 text-right flex flex-col items-end">
             <div className="flex items-center gap-4 bg-zinc-900/50 px-6 py-3 rounded-2xl border border-zinc-800">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">System Online</span>
             </div>
             <p className={`text-[11px] font-black tracking-[0.6em] pt-10 ${hackerMode ? 'text-green-900' : 'text-zinc-800'}`}>CINEWISE 2026 // NO LOGIN REQUIRED</p>
          </div>
        </div>
      </footer>

      {/* FEATURE MODALS */}
      {showPrank && <GhostFacePrank onClose={() => setShowPrank(false)} />}
      {showVibe && <VibeMatcher onClose={() => setShowVibe(false)} />}
      {showSpoiler && <SpoilerRoulette onClose={() => setShowSpoiler(false)} />}
      {showMirror && <CharacterMirror onClose={() => setShowMirror(false)} />}
      {showBlindDate && <BlindDate movies={movies} onSelect={(m) => { setSelectedMovie(m); setShowBlindDate(false); }} onClose={() => setShowBlindDate(false)} />}
      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
};

export default App;
