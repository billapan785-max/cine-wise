import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Movie } from './types';
import { getRecommendations, getMovieVideos } from './services/tmdbService';
import { getMovieCritique } from './services/geminiService';
import { updateCanonical, updateMetaTags, injectBreadcrumbs } from './services/seoService';

// --- CONFIGURATION ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=200&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- INLINED COMPONENT: MovieDetailModal ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [critique, setCritique] = useState<string>('');
  const [loadingCritique, setLoadingCritique] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (movie) {
      const originalTitle = document.title;
      const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
      const safeTitle = movie.title || 'Unknown Title';
      const movieSlug = safeTitle.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      const movieUrlPath = `movie/${movie.id}-${movieSlug}`;
      const movieFullTitle = `${safeTitle} (${movieYear}) - Watch on CineWise`;

      try {
        updateMetaTags(
          movieFullTitle,
          (movie.overview || '').substring(0, 160),
          getImageUrl(movie.poster_path, 'w500'),
          `https://cinewise.ai/${movieUrlPath}`
        );
        updateCanonical(movieUrlPath);
        injectBreadcrumbs([
          { name: 'Home', item: '/' },
          { name: 'Movies', item: '/movies' },
          { name: safeTitle, item: `/${movieUrlPath}` }
        ]);
      } catch (e) {
        console.debug('SEO sync failed');
      }

      setLoadingCritique(true);
      getMovieCritique(safeTitle, movie.overview || '')
        .then(text => {
          setCritique(text);
          setLoadingCritique(false);
        })
        .catch(() => {
          setCritique("A cinematic journey awaits your eyes.");
          setLoadingCritique(false);
        });

      setLoadingVideo(true);
      getMovieVideos(movie.id).then((videos) => {
        const bestTrailer = 
          videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
          videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
          videos.find(v => v.site === 'YouTube' && v.type === 'Teaser');
        setTrailerKey(bestTrailer ? bestTrailer.key : null);
        setLoadingVideo(false);
      }).catch(() => {
        setTrailerKey(null);
        setLoadingVideo(false);
      });

      return () => { document.title = originalTitle; };
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-4 bg-zinc-950 transition-all animate-in fade-in duration-300" role="dialog" aria-modal="true">
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
          <button onClick={() => setShowTrailer(false)} className="absolute top-6 right-6 bg-zinc-800 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-xmark text-2xl"></i></button>
          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-black">
            <iframe className="w-full h-full" src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`} frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <div className="relative w-full h-full overflow-y-auto bg-zinc-950 scrollbar-hide">
        <button onClick={onClose} className="fixed top-6 left-6 md:top-8 md:left-8 z-[60] bg-black/60 hover:bg-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-arrow-left"></i></button>

        <div className="relative h-[45vh] md:h-[70vh] w-full">
          <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover" alt={movie.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full">
            <h1 className="text-4xl md:text-8xl font-black mb-6 uppercase italic leading-[1]">{movie.title}</h1>
            <div className="flex gap-6 text-sm font-bold">
              <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-md">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="text-zinc-300">{movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Story Overview</h3>
              <p className="text-xl md:text-3xl text-zinc-100 leading-snug font-light italic">"{movie.overview}"</p>
            </div>
            
            {/* DYNAMIC MERCH BUTTON */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Merch</h3>
              <a 
                href={`https://www.redbubble.com/shop/${movie.title.replace(/\s+/g, '+')}+t-shirts`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-[#EAB308] text-black font-black py-5 rounded-2xl text-center text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 shadow-xl"
              >
                <i className="fa-solid fa-shirt"></i>
                Get Movie Merch
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mb-4">AI Analysis</h4>
              {loadingCritique ? <div className="h-8 w-2/3 bg-zinc-800 animate-pulse rounded-lg"></div> : <p className="text-2xl font-bold">"{critique}"</p>}
            </div>
          </div>

          <div className="space-y-8">
             <button onClick={() => trailerKey && setShowTrailer(true)} disabled={!trailerKey} className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest ${!trailerKey ? 'bg-zinc-800 text-zinc-500' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                {loadingVideo ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play mr-3"></i>}
                {trailerKey ? 'WATCH TRAILER' : 'TRAILER N/A'}
             </button>
             <div className="bg-zinc-900/60 p-8 rounded-3xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-4">Rating</span>
                <span className="text-4xl font-black">{movie.vote_average.toFixed(1)} <span className="text-zinc-700 text-xl">/ 10</span></span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW FEATURE: MATRIX RAIN ENGINE ---
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

// --- DATE ENGINE ---
const DateEngine = {
  getReleaseTag: (date: string) => {
    if (!date) return { label: 'TBA', color: 'text-zinc-500' };
    const diff = +new Date(date) - +new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0 && days <= 30) return { label: `COMING IN ${days}D`, color: 'text-yellow-500' };
    if (days > 30) return { label: 'FUTURE RELEASE', color: 'text-blue-500' };
    if (days <= 0 && days > -30) return { label: 'RECENTLY ADDED', color: 'text-green-500' };
    return { label: 'OUT NOW', color: 'text-red-600' };
  }
};

// --- ROULETTE COMPONENT ---
const BlindPickRoulette: React.FC<{ movies: Movie[]; isOpen: boolean; onClose: (m?: Movie) => void }> = ({ movies, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [blurEffect, setBlurEffect] = useState(false);

  useEffect(() => {
    if (isOpen && movies.length > 0) {
      setIsSpinning(true);
      setHasFinished(false);
      setBlurEffect(true);
      let count = 0;
      let speed = 40; 
      const totalSteps = 35;

      const tick = () => {
        setCurrentIndex(prev => {
            let next = Math.floor(Math.random() * movies.length);
            while(next === prev) next = Math.floor(Math.random() * movies.length);
            return next;
        });
        count++;

        if (count < totalSteps) {
          if (count > totalSteps - 12) speed += 30;
          if (count > totalSteps - 5) speed += 100;
          setTimeout(tick, speed);
        } else {
          setIsSpinning(false);
          setHasFinished(true);
          setBlurEffect(false);
        }
      };
      tick();
    }
  }, [isOpen, movies]);

  if (!isOpen || movies.length === 0) return null;
  const currentMovie = movies[currentIndex];

  return (
    <div className="fixed inset-0 z-[900] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-500">
      <div className="relative w-full max-w-md bg-zinc-900 border-2 border-red-600 rounded-[3.5rem] p-8 md:p-12 shadow-[0_0_100px_rgba(220,38,38,0.25)] text-center space-y-8 overflow-hidden">
        <div className={`absolute inset-0 bg-red-600/10 transition-opacity duration-1000 ${isSpinning ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
        <div className="relative z-10">
          <h3 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-2">{isSpinning ? 'SPINNING...' : 'BINGO!'}</h3>
          <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.5em] mb-10">CineWise Roulette</p>
        </div>
        <div className="relative z-10 flex justify-center">
          <div className={`relative w-64 md:w-72 aspect-[2/3] rounded-[2.5rem] overflow-hidden border-4 transition-all duration-300 ${isSpinning ? 'scale-95 border-zinc-800' : 'scale-105 border-white shadow-[0_0_50px_rgba(255,255,255,0.2)]'}`}>
             <img src={getImageUrl(currentMovie.poster_path)} className={`w-full h-full object-cover transition-all duration-100 ${blurEffect ? 'blur-md scale-110' : 'blur-0 scale-100'}`} alt="Roulette" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h4 className={`text-xl md:text-2xl font-black text-white uppercase italic truncate px-4 transition-all duration-500 ${isSpinning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>{currentMovie.title}</h4>
          <div className="flex flex-col gap-4">
            {hasFinished ? (
              <button onClick={() => onClose(currentMovie)} className="w-full bg-red-600 text-white font-black py-6 rounded-[2rem] hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">DETAILS</button>
            ) : <div className="h-[64px]"></div>}
            <button onClick={() => onClose()} className="text-zinc-600 hover:text-white uppercase font-black text-[9px] tracking-[0.4em]">Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- GHOSTFACE PRANK ---
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
      msg.onend = () => { setStatus('idle'); };
    }, 4500);
  };
  return (
    <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-600 rounded-[4rem] p-12 relative shadow-[0_0_150px_rgba(220,38,38,0.3)] text-center space-y-12">
        <button onClick={onClose} className="absolute top-12 right-12 text-zinc-600 hover:text-white text-3xl transition-all">✕</button>
        <h3 className="text-6xl font-black italic text-red-600 uppercase tracking-tighter">Scream Call</h3>
        <input type="text" placeholder="VICTIM NAME" className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-3xl py-8 px-10 text-white text-center text-2xl outline-none focus:border-red-600 font-black transition-all" value={victimName} onChange={(e) => setVictimName(e.target.value)} />
        <button onClick={startPrank} disabled={status !== 'idle'} className="w-full bg-red-600 text-white font-black py-10 rounded-[2.5rem] hover:scale-105 transition-all shadow-2xl uppercase tracking-[0.2em] text-sm">
          {status === 'idle' ? 'Start Call' : '📞 CONNECTED...'}
        </button>
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

// --- MAIN APPLICATION COMPONENT ---
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

  const calculateCountdown = (date: string) => {
    if (!date) return 'TBA';
    const diff = +new Date(date) - +new Date();
    if (diff <= 0) return "Out Now";
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))}D Left`;
  };

  const fetchData = useCallback(async (targetPage: number) => {
    let endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    if (viewMode === 'upcoming') {
      endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${targetPage}&region=US`;
    } else if (viewMode === 'news') {
      endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    }

    const res = await fetch(endpoint);
    const data = await res.json();
    let results = data.results || [];

    if (viewMode === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      results = results.filter((m: Movie) => m.release_date > today);
    }

    setMovies(prev => targetPage === 1 ? results : [...prev, ...results]);
    setPage(targetPage);
  }, [viewMode]);

  useEffect(() => {
    fetchData(1);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-white'} selection:bg-red-600`}>
      {/* Matrix Rain */}
      {hackerMode && <MatrixRain />}

      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 flex flex-col ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/95 border-b border-zinc-900 shadow-2xl backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="w-full px-4 md:px-12 py-4 flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-red-600 cursor-pointer transition-transform hover:scale-105" onClick={() => setViewMode('home')}>CINEWISE</h1>
          
          <nav className="hidden lg:flex items-center bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-1">
            {['home', 'upcoming', 'news'].map((m) => (
              <button key={m} onClick={() => setViewMode(m as any)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                {m === 'home' ? 'Home' : m === 'upcoming' ? 'Soon' : 'News'}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowBlindRoulette(true)} className="hidden sm:flex bg-white text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95">🎲 Blind Pick</button>
            <button onClick={() => setShowPrank(true)} className="bg-red-600 px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all">SCREAM CALL</button>
            <div className="relative group hidden sm:block">
               <input type="text" placeholder="SEARCH..." className="bg-zinc-900/80 border-2 border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-[11px] outline-none focus:border-red-600/50 font-black w-32 md:w-48 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
               <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
            </div>
          </div>
        </div>
      </header>

      {viewMode === 'legal' ? (
        <div className="min-h-screen pt-40 px-6 max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl font-black italic uppercase text-red-600">Legal Center</h2>
            <p className="text-zinc-500 font-bold leading-relaxed uppercase tracking-widest text-xs italic">2026 Movie Discovery Portal // Zero Tracking Active</p>
            <button onClick={() => setViewMode('home')} className="bg-white text-black font-black px-12 py-4 rounded-xl uppercase text-[10px] tracking-widest shadow-2xl">Back to Hub</button>
        </div>
      ) : (
        <>
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-screen w-full flex items-center px-6 md:px-24 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[1px] scale-105" alt="Feature" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="relative max-w-6xl space-y-8 md:space-y-12 animate-in fade-in slide-in-from-left-10 duration-1000 mt-20">
                <span className="inline-block bg-red-600 text-[9px] md:text-[11px] font-black px-6 md:px-8 py-2 md:py-3 rounded-full tracking-[0.3em] md:tracking-[0.5em] uppercase shadow-2xl">Trending Now</span>
                {/* Reduced heading size */}
                <h2 className={`text-4xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[1.1] md:leading-[1] drop-shadow-2xl ${hackerMode ? 'text-green-500' : 'text-white'}`}>{movies[0].title}</h2>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <button onClick={() => setSelectedMovie(movies[0])} className="bg-white text-black font-black px-8 md:px-20 py-4 md:py-7 rounded-2xl md:rounded-[2.5rem] hover:bg-red-600 hover:text-white transition-all text-xs md:text-sm uppercase tracking-widest shadow-2xl transform hover:scale-105 active:scale-95">View Details</button>
                  <button onClick={() => setHackerMode(!hackerMode)} className="bg-transparent border-2 border-white text-white font-black px-8 md:px-20 py-4 md:py-7 rounded-2xl md:rounded-[2.5rem] hover:bg-white hover:text-black transition-all text-xs md:text-sm uppercase tracking-widest shadow-2xl transform hover:scale-105 active:scale-95">{hackerMode ? 'EXIT MATRIX' : 'ENTER MATRIX'}</button>
                </div>
              </div>
            </section>
          )}

          <main className="px-6 md:px-20 py-32 md:py-40 min-h-screen relative z-10">
            <h2 className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.5em] text-zinc-800 mb-16 md:mb-24 flex items-center gap-8 md:gap-12">
              {viewMode === 'home' ? 'Trending Movies' : viewMode === 'upcoming' ? 'Coming Soon' : 'Movie News'} 
              <span className="h-px flex-1 bg-zinc-900/50"></span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-16">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(m => {
                const dateTag = DateEngine.getReleaseTag(m.release_date);
                return (
                  <div key={m.id} onClick={() => setSelectedMovie(m)} className="group cursor-pointer">
                    <div className={`aspect-[2/3] overflow-hidden rounded-2xl md:rounded-[3rem] border-2 bg-zinc-900 relative shadow-2xl transition-all duration-700 ${hackerMode ? 'border-green-900' : 'border-zinc-900 group-hover:border-red-600'}`}>
                      <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] opacity-90 group-hover:opacity-40" alt={m.title} />
                      <div className="absolute top-4 right-4 z-20">
                         <span className={`bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black tracking-widest ${dateTag.color} border border-white/5`}>{dateTag.label}</span>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all translate-y-10 group-hover:translate-y-0 text-white">
                        <p className="text-xs md:text-lg font-black uppercase italic leading-tight mb-2">{m.title}</p>
                        <p className="text-[8px] text-red-500 font-black tracking-[0.3em] uppercase">
                          {viewMode === 'upcoming' ? calculateCountdown(m.release_date) : `Rating: ${Math.round(m.vote_average * 10)}%`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {!searchQuery && (
              <div className="flex justify-center mt-24 md:mt-40">
                <button onClick={() => fetchData(page + 1)} className="bg-zinc-900 hover:bg-white hover:text-black border-2 border-zinc-800 text-white font-black px-12 md:px-24 py-5 md:py-8 rounded-2xl md:rounded-[3rem] transition-all text-[10px] md:text-xs tracking-[0.5em] uppercase shadow-3xl transform hover:scale-105 active:scale-95">Load More</button>
              </div>
            )}
          </main>
        </>
      )}

      <footer className="py-20 md:py-32 bg-zinc-950 border-t border-zinc-900 mt-20 text-center space-y-12">
        <h3 className="text-4xl font-black italic tracking-tighter text-red-600">CINEWISE</h3>
        <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
           <button onClick={() => setShowVibe(true)} className="hover:text-white transition-colors">VIBE CHECK</button>
           <button onClick={() => setShowSpoiler(true)} className="hover:text-white transition-colors">SPOILERS</button>
           <button onClick={() => setViewMode('legal')} className="hover:text-white transition-colors">LEGAL</button>
        </div>
        <p className={`text-[10px] font-black tracking-[0.6em] text-zinc-800`}>CINEWISE 2026 // NO LOGIN REQUIRED</p>
      </footer>

      {showPrank && <GhostFacePrank onClose={() => setShowPrank(false)} />}
      {showVibe && <VibeMatcher onClose={() => setShowVibe(false)} />}
      {showSpoiler && <SpoilerRoulette onClose={() => setShowSpoiler(false)} />}
      <BlindPickRoulette movies={movies} isOpen={showBlindRoulette} onClose={(m) => { setShowBlindRoulette(false); if (m) setSelectedMovie(m); }} />
      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      {/* Skimlinks Script Injection */}
      <script type="text/javascript" src="https://s.skimresources.com/js/298886X178650.js"></script>
    </div>
  );
};

export default App;
