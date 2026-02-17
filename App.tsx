import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

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

export interface VideoResult {
  key: string;
  site: string;
  type: string;
  official: boolean;
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

// --- INLINED SERVICES ---
const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=200&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

const getMovieCritique = async (movieTitle: string, overview: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a professional movie critic, provide a one-sentence witty hook for the movie "${movieTitle}". Overview: ${overview}. Keep it engaging and modern.`,
    });
    return response.text || "A cinematic experience you won't forget.";
  } catch (error) {
    return "The critics are speechless on this one.";
  }
};

const updateMetaTags = (title: string, description: string, image: string, url: string) => {
  document.title = title;
  const setMeta = (property: string, content: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      if (isProperty) element.setAttribute('property', property);
      else element.name = property;
      document.head.appendChild(element);
    }
    element.content = content;
  };
  setMeta('description', description);
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:image', image, true);
  setMeta('og:url', url, true);
};

// --- COMPONENT: MatrixRain ---
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
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-20 pointer-events-none" />;
};

// --- COMPONENT: MovieDetailModal ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [critique, setCritique] = useState<string>('');
  const [loadingCritique, setLoadingCritique] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (movie) {
      const originalTitle = document.title;
      updateMetaTags(`${movie.title} - CineWise`, movie.overview, getImageUrl(movie.poster_path), `https://cinewise.ai/movie/${movie.id}`);
      
      setLoadingCritique(true);
      getMovieCritique(movie.title, movie.overview).then(text => { setCritique(text); setLoadingCritique(false); });

      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`).then(res => res.json()).then(data => {
        const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        setVideoKey(trailer ? trailer.key : null);
      });
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`).then(res => res.json()).then(data => {
        setCast(data.cast?.slice(0, 10) || []);
      });
      return () => { document.title = originalTitle; };
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-zinc-950/98 backdrop-blur-3xl overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl mx-auto bg-zinc-900 md:rounded-[4rem] overflow-hidden border border-zinc-800 shadow-2xl my-0 md:my-10">
        <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 z-[520] bg-black/60 hover:bg-red-600 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white transition-all shadow-xl"><i className="fa-solid fa-xmark text-xl"></i></button>
        
        <div className="flex flex-col">
          <div className="aspect-video relative bg-black group">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
            ) : (
              <>
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50" alt={movie.title} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse"><i className="fa-solid fa-play text-2xl md:text-3xl ml-1"></i></div>
                  <button onClick={() => setShowPlayer(true)} className="bg-white text-black px-8 md:px-12 py-3 md:py-5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all">Watch Trailer</button>
                </div>
              </>
            )}
          </div>

          <div className="p-6 md:p-20 space-y-12 md:space-y-16">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-tight">{movie.title}</h2>
              <div className="flex flex-wrap gap-3 md:gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                <span className="text-green-500 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">{Math.round(movie.vote_average * 10)}% Match</span>
                <span className="text-zinc-400 bg-zinc-800 px-3 py-2 rounded-lg">{movie.release_date}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              <div className="md:col-span-2 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Story Overview</h3>
                <p className="text-lg md:text-3xl text-zinc-100 font-light italic leading-relaxed md:leading-snug">"{movie.overview}"</p>
                
                <div className="pt-4 md:pt-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-4 md:mb-6">Merch Hub</h3>
                  <a 
                    href={`https://www.redbubble.com/shop/${movie.title.replace(/\s+/g, '+')}+t-shirts`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 md:gap-4 bg-[#EAB308] text-black font-black px-6 md:px-10 py-4 md:py-5 rounded-2xl uppercase text-[10px] md:text-[11px] tracking-widest hover:scale-105 transition-transform shadow-2xl"
                  >
                    <i className="fa-solid fa-shirt"></i> Buy {movie.title} Merch
                  </a>
                </div>

                <div className="p-6 md:p-8 rounded-3xl bg-zinc-950/50 border border-zinc-800">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mb-4">AI Analysis</h4>
                  {loadingCritique ? <div className="h-6 w-2/3 bg-zinc-800 animate-pulse rounded-lg"></div> : <p className="text-lg md:text-xl font-bold italic">"{critique}"</p>}
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Top Cast</h3>
                <div className="flex flex-col gap-3 md:gap-4">
                  {cast.map(p => (
                    <div key={p.id} className="flex items-center gap-4">
                      <img src={getImageUrl(p.profile_path, 'w185')} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-zinc-800" alt={p.name} />
                      <div>
                        <p className="text-[10px] md:text-[11px] font-black uppercase text-white truncate max-w-[120px] md:max-w-none">{p.name}</p>
                        <p className="text-[8px] md:text-[9px] text-zinc-500 uppercase italic truncate max-w-[120px] md:max-w-none">{p.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: BlindPickRoulette ---
const BlindPickRoulette: React.FC<{ movies: Movie[]; isOpen: boolean; onClose: (m?: Movie) => void }> = ({ movies, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    if (isOpen && movies.length > 0) {
      setIsSpinning(true);
      setHasFinished(false);
      let count = 0;
      let speed = 40; 
      const totalSteps = 30;
      const tick = () => {
        setCurrentIndex(prev => Math.floor(Math.random() * movies.length));
        count++;
        if (count < totalSteps) {
          if (count > totalSteps - 10) speed += 40;
          setTimeout(tick, speed);
        } else {
          setIsSpinning(false);
          setHasFinished(true);
        }
      };
      tick();
    }
  }, [isOpen, movies]);

  if (!isOpen || movies.length === 0) return null;
  const currentMovie = movies[currentIndex];

  return (
    <div className="fixed inset-0 z-[900] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-zinc-900 border-2 border-red-600 rounded-[3rem] p-8 md:p-12 text-center space-y-6 md:space-y-8 overflow-hidden shadow-2xl">
        <h3 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">{isSpinning ? 'SPINNING...' : 'BINGO!'}</h3>
        <div className="aspect-[2/3] w-48 md:w-64 mx-auto overflow-hidden rounded-2xl shadow-2xl border-4 border-zinc-800">
           <img src={getImageUrl(currentMovie.poster_path)} className="w-full h-full object-cover transition-all duration-300" alt="Roulette" />
        </div>
        <h4 className="text-lg md:text-xl font-black text-white uppercase italic truncate px-4">{currentMovie.title}</h4>
        <div className="flex flex-col gap-3">
          {hasFinished ? (
            <button onClick={() => onClose(currentMovie)} className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px] md:text-xs hover:scale-105 transition-transform shadow-2xl">GET DETAILS</button>
          ) : <div className="h-[48px] md:h-[60px]"></div>}
          <button onClick={() => onClose()} className="text-zinc-500 hover:text-white uppercase font-black text-[9px] tracking-[0.4em]">Close</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: GhostFacePrank ---
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
      const msg = new SpeechSynthesisUtterance(`Hello... ${victimName}... Do you like scary movies?`);
      msg.pitch = 0.1; msg.rate = 0.6;
      window.speechSynthesis.speak(msg);
      msg.onend = () => setStatus('idle');
    }, 4500);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-600 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 text-center space-y-8 md:space-y-12 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-600 hover:text-white text-2xl">✕</button>
        <h3 className="text-4xl md:text-6xl font-black italic text-red-600 uppercase tracking-tighter leading-none">Scream Call</h3>
        <input type="text" placeholder="VICTIM NAME" className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl md:rounded-3xl py-6 md:py-8 px-8 md:px-10 text-white text-center text-xl md:text-2xl outline-none focus:border-red-600 font-black transition-all" value={victimName} onChange={(e) => setVictimName(e.target.value)} />
        <button onClick={startPrank} disabled={status !== 'idle'} className="w-full bg-red-600 text-white font-black py-6 md:py-10 rounded-2xl md:rounded-[2.5rem] uppercase tracking-widest text-[10px] md:text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl">
          {status === 'idle' ? 'Start Call' : '📞 CONNECTED...'}
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT: VibeMatcher ---
const VibeMatcher: React.FC<{onClose: () => void}> = ({onClose}) => {
  const moods = [
    { name: 'Villain Era', desc: 'Powerful, dark, and misunderstood.' },
    { name: 'Lonely God', desc: 'Melancholic excellence in solitude.' },
    { name: 'Main Character', desc: 'The world revolves around you.' },
    { name: 'Cyberpunk Soul', desc: 'High tech, low life, neon dreams.' }
  ];
  const [match, setMatch] = useState<{name: string, desc: string} | null>(null);
  return (
    <div className="fixed inset-0 z-[600] bg-zinc-950/98 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white rounded-[2rem] md:rounded-[4rem] p-8 md:p-16 text-black space-y-8 md:space-y-12 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">Vibe Check</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {moods.map(m => (
            <button key={m.name} onClick={() => setMatch(m)} className="border-4 border-black py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-xs hover:bg-black hover:text-white transition-all transform hover:-translate-y-1">{m.name}</button>
          ))}
        </div>
        {match && <div className="bg-zinc-100 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-center animate-in zoom-in duration-500"><p className="text-3xl md:text-5xl font-black italic uppercase text-red-600 mb-2 md:mb-4">{match.name}</p><p className="text-[10px] md:text-sm font-bold text-zinc-500 italic uppercase">{match.desc}</p></div>}
        <button onClick={onClose} className="w-full text-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] opacity-30 hover:opacity-100">Back Home</button>
      </div>
    </div>
  );
};

// --- COMPONENT: SpoilerRoulette ---
const SpoilerRoulette: React.FC<{onClose: () => void}> = ({onClose}) => {
  const leaks = ["SCREAM 7: The killer is actually a fan of original movies.", "AVATAR 3: Varang, the leader of Ash People, will survive.", "SPIDER-MAN 4: Miles Morales will make a cameo.", "JOKER 2: Massive musical number at the end."];
  const [spoiler, setSpoiler] = useState('');
  return (
    <div className="fixed inset-0 z-[600] bg-black/98 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-900 border-2 border-yellow-500 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-12 text-center space-y-8 md:space-y-10 shadow-2xl">
        <h3 className="text-4xl md:text-5xl font-black italic text-yellow-500 uppercase tracking-tighter leading-none">Leaks</h3>
        <div className="py-8 md:py-12 border-y border-zinc-800"><p className="text-lg md:text-2xl font-bold italic text-white leading-snug">{spoiler || "Want to see 2026 leaks?"}</p></div>
        <button onClick={() => setSpoiler(leaks[Math.floor(Math.random() * leaks.length)])} className="w-full bg-yellow-500 text-black font-black py-5 md:py-7 rounded-2xl uppercase tracking-widest text-[10px] md:text-sm shadow-2xl">REVEAL SPOILER</button>
        <button onClick={onClose} className="text-zinc-600 uppercase font-black text-[9px] md:text-[10px] tracking-[0.4em] hover:text-white">Close</button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'upcoming' | 'legal'>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hackerMode, setHackerMode] = useState(false);
  
  const [showPrank, setShowPrank] = useState(false);
  const [showVibe, setShowVibe] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [showBlindRoulette, setShowBlindRoulette] = useState(false);

  const fetchData = useCallback(async (targetPage: number) => {
    let endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    if (viewMode === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    else if (viewMode === 'news') endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${targetPage}`;

    const res = await fetch(endpoint);
    const data = await res.json();
    let results = data.results || [];
    setMovies(prev => targetPage === 1 ? results : [...prev, ...results]);
    setPage(targetPage);
  }, [viewMode]);

  useEffect(() => {
    fetchData(1);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-white'} selection:bg-red-600`}>
      {hackerMode && <MatrixRain />}

      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 flex flex-col ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/95 border-b border-zinc-900 backdrop-blur-xl shadow-2xl' : 'bg-transparent'}`}>
        <div className="w-full px-4 md:px-12 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-2xl md:text-5xl font-black italic tracking-tighter text-red-600 cursor-pointer transition-transform hover:scale-105" onClick={() => {setViewMode('home'); window.scrollTo(0,0);}}>CINEWISE</h1>
            <button onClick={() => setShowPrank(true)} className="md:hidden bg-red-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-xl">SCREAM</button>
          </div>
          
          <nav className="flex items-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="flex gap-1 min-w-max">
              {['home', 'upcoming', 'news'].map((m) => (
                <button key={m} onClick={() => {setViewMode(m as any); window.scrollTo(0,0);}} className={`px-4 md:px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                  {m === 'home' ? 'Home' : m === 'upcoming' ? 'Soon' : 'News'}
                </button>
              ))}
              <div className="w-px h-4 bg-zinc-800 self-center mx-1 hidden md:block"></div>
              <button onClick={() => setShowBlindRoulette(true)} className="px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">🎲 Roulette</button>
            </div>
          </nav>

          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <button onClick={() => setShowPrank(true)} className="hidden md:flex bg-red-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all">SCREAM CALL</button>
            <div className="relative group flex-1 md:flex-none">
               <input type="text" placeholder="SEARCH..." className="bg-zinc-900/80 border-2 border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-[10px] md:text-[11px] outline-none focus:border-red-600 font-black w-full md:w-48 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
               <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px]"></i>
            </div>
          </div>
        </div>
      </header>

      {viewMode === 'legal' ? (
        <div className="min-h-screen pt-40 px-6 max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl font-black italic uppercase text-red-600">Legal Center</h2>
            <div className="prose prose-invert max-w-none text-zinc-400 font-bold leading-relaxed space-y-8 uppercase tracking-widest text-[10px] md:text-xs">
              <section className="space-y-4">
                <h3 className="text-white text-xl border-l-4 border-red-600 pl-4 italic">Privacy</h3>
                <p>CineWise operates on a zero-tracking model. We do not store, log, or share your data. All movie metadata is provided via the official TMDB API for educational discovery purposes.</p>
              </section>
              <section className="space-y-4">
                <h3 className="text-white text-xl border-l-4 border-red-600 pl-4 italic">Terms</h3>
                <p>By using this platform, you acknowledge it is a directory for information only. We do not host video content. All trademarks belong to their respective owners.</p>
              </section>
            </div>
            <button onClick={() => setViewMode('home')} className="bg-white text-black font-black px-12 py-4 rounded-xl uppercase text-[10px] tracking-widest shadow-2xl">Back Home</button>
        </div>
      ) : (
        <>
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-[60vh] md:h-screen w-full flex items-center px-4 md:px-24 overflow-hidden pt-20 md:pt-0">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-20 md:opacity-30" alt="Feature" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="relative max-w-6xl space-y-6 md:space-y-8 mt-10 md:mt-20">
                <span className="inline-block bg-red-600 text-[9px] md:text-[11px] font-black px-4 md:px-6 py-1.5 md:py-2 rounded-full tracking-[0.3em] uppercase shadow-2xl">Trending</span>
                {/* Reduced heading size as previously requested */}
                <h2 className={`text-3xl md:text-8xl font-black italic uppercase tracking-tighter leading-tight md:leading-none drop-shadow-2xl ${hackerMode ? 'text-green-500' : 'text-white'}`}>{movies[0].title}</h2>
                <div className="flex gap-4">
                  <button onClick={() => setSelectedMovie(movies[0])} className="bg-white text-black font-black px-6 md:px-16 py-3.5 md:py-6 rounded-xl md:rounded-2xl hover:bg-red-600 hover:text-white transition-all text-[10px] md:text-xs uppercase tracking-widest shadow-2xl transform hover:scale-105 active:scale-95">Details</button>
                  <button onClick={() => setHackerMode(!hackerMode)} className="bg-transparent border-2 border-white text-white font-black px-6 md:px-16 py-3.5 md:py-6 rounded-xl md:rounded-2xl hover:bg-white hover:text-black transition-all text-[10px] md:text-xs uppercase tracking-widest shadow-2xl transform hover:scale-105 active:scale-95">{hackerMode ? 'Matrix' : 'Enter'}</button>
                </div>
              </div>
            </section>
          )}

          <main className="px-4 md:px-20 py-20 md:py-40 min-h-screen relative z-10">
            <h2 className="text-[10px] md:text-[13px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-zinc-800 mb-10 md:mb-16 flex items-center gap-4 md:gap-8">
              {viewMode === 'home' ? 'Trending Movies' : viewMode === 'upcoming' ? 'Coming Soon' : 'Movie News'} 
              <span className="h-px flex-1 bg-zinc-900/50"></span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-12">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(m => {
                 const dateTag = { label: 'OUT NOW', color: 'text-red-600' }; // simplified tag logic for display
                 return (
                  <div key={m.id} onClick={() => setSelectedMovie(m)} className="group cursor-pointer">
                    <div className={`aspect-[2/3] overflow-hidden rounded-xl md:rounded-[2.5rem] border bg-zinc-900 relative shadow-xl transition-all duration-700 ${hackerMode ? 'border-green-900' : 'border-zinc-800 group-hover:border-red-600'}`}>
                      <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] opacity-90 group-hover:opacity-40" alt={m.title} loading="lazy" />
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                         <span className={`bg-black/90 backdrop-blur-md px-2 md:px-3 py-1 rounded-lg text-[7px] md:text-[8px] font-black tracking-widest ${dateTag.color} border border-white/5`}>{dateTag.label}</span>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-white">
                        <p className="text-[10px] md:text-lg font-black uppercase italic mb-1 md:mb-2 truncate leading-tight">{m.title}</p>
                        <p className="text-[7px] md:text-[8px] text-red-500 font-black tracking-widest uppercase">{Math.round(m.vote_average * 10)}% VIBE</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {!searchQuery && (
              <div className="flex justify-center mt-20 md:mt-24">
                <button onClick={() => fetchData(page + 1)} className="bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white font-black px-10 md:px-20 py-4 md:py-6 rounded-xl md:rounded-[2rem] transition-all text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase shadow-2xl transform hover:scale-105 active:scale-95">Load More</button>
              </div>
            )}
          </main>
        </>
      )}

      <footer className="py-16 md:py-32 bg-zinc-950 border-t border-zinc-900 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-20 text-center md:text-left">
          <div className="space-y-6 md:space-y-10">
            <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter text-red-600">CINEWISE</h3>
            <p className="text-[9px] md:text-xs font-bold text-zinc-600 leading-loose uppercase italic tracking-wider">Your decentralized movie search engine. No logins. No trackers. Just Cinema 2026.</p>
          </div>
          <div className="space-y-6 md:space-y-8">
            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white">Interactive</h4>
            <ul className="space-y-4 md:space-y-5 text-[9px] md:text-[10px] font-black text-zinc-500 uppercase italic tracking-widest">
              <li><button onClick={() => setShowVibe(true)} className="hover:text-red-600 transition-colors">VIBE CHECK</button></li>
              <li><button onClick={() => setShowSpoiler(true)} className="hover:text-yellow-500 transition-colors">LEAKS</button></li>
              <li><button onClick={() => setHackerMode(!hackerMode)} className="hover:text-green-500 transition-colors">{hackerMode ? 'EXIT MATRIX' : 'ENTER MATRIX'}</button></li>
            </ul>
          </div>
          <div className="space-y-6 md:space-y-8">
            <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white">Legal</h4>
            <ul className="space-y-4 md:space-y-5 text-[9px] md:text-[10px] font-black text-zinc-500 uppercase italic tracking-widest">
              <li><button onClick={() => setViewMode('legal')} className="hover:text-white transition-colors">PRIVACY</button></li>
              <li><button onClick={() => setViewMode('legal')} className="hover:text-white transition-colors">TERMS</button></li>
              <li><a href="https://bgremoverai.online" target="_blank" className="hover:text-white underline underline-offset-4">BG REMOVER</a></li>
            </ul>
          </div>
          <div className="space-y-6 md:space-y-8 flex flex-col items-center md:items-end">
             <div className="flex items-center gap-3 bg-zinc-900/50 px-5 md:px-6 py-2 md:py-3 rounded-xl border border-zinc-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">SYSTEM ONLINE</span>
             </div>
             <p className={`text-[9px] md:text-[10px] font-black tracking-[0.4em] md:tracking-[0.6em] md:pt-10 ${hackerMode ? 'text-green-900' : 'text-zinc-800'}`}>CINEWISE 2026 // NO LOGIN REQUIRED</p>
          </div>
        </div>
      </footer>

      {showPrank && <GhostFacePrank onClose={() => setShowPrank(false)} />}
      {showVibe && <VibeMatcher onClose={() => setShowVibe(false)} />}
      {showSpoiler && <SpoilerRoulette onClose={() => setShowSpoiler(false)} />}
      <BlindPickRoulette movies={movies} isOpen={showBlindRoulette} onClose={(m) => { setShowBlindRoulette(false); if (m) setSelectedMovie(m); }} />
      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      {/* Skimlinks Script Step 2: Final Placement */}
      <script type="text/javascript" src="https://s.skimresources.com/js/298886X178650.js"></script>
    </div>
  );
};

export default App;
