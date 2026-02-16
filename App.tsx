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

// --- CONFIGURATION ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=200&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- VIRAL FEATURE 1: SPOILER ROULETTE ---
const SpoilerRoulette: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [spoiler, setSpoiler] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const leaks = [
    "SCREAM 7: The killer is actually a fan of the original 'Stab' movies working in the police.",
    "AVATAR 3: Varang, the leader of the Ash People, will survive until the 5th movie.",
    "SPIDER-MAN 4: Miles Morales will make a 5-second cameo in the post-credits.",
    "JOKER 2: The ending features a massive musical number inside a burning hospital."
  ];
  const spin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setSpoiler(leaks[Math.floor(Math.random() * leaks.length)]);
      setIsSpinning(false);
    }, 800);
  };
  return (
    <div className="fixed inset-0 z-[500] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-zinc-900 border-2 border-yellow-500 rounded-[3rem] p-12 text-center space-y-8 shadow-[0_0_80px_rgba(234,179,8,0.2)]">
        <h3 className="text-4xl font-black italic text-yellow-500 uppercase tracking-tighter">Spoiler Terminal</h3>
        <div className="py-10 border-y border-zinc-800">
          <p className={`text-xl font-bold italic transition-all ${isSpinning ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
            {spoiler || "Ready to see 2026 leaks?"}
          </p>
        </div>
        <button onClick={spin} className="w-full bg-yellow-500 text-black font-black py-6 rounded-2xl hover:scale-105 transition-all uppercase tracking-widest text-sm">Spin for Leaks</button>
        <button onClick={onClose} className="text-zinc-500 uppercase font-bold text-[10px] tracking-[0.3em]">Exit Restricted Area</button>
      </div>
    </div>
  );
};

// --- VIRAL FEATURE 2: VIBE MATCHER ---
const VibeMatcher: React.FC<{onClose: () => void}> = ({onClose}) => {
  const moods = [
    { name: 'Villain Era', movie: 'The Joker' },
    { name: 'Lonely God', movie: 'Blade Runner 2049' },
    { name: 'Main Character', movie: 'The Great Gatsby' },
    { name: 'Lost in Space', movie: 'Interstellar' }
  ];
  const [match, setMatch] = useState('');
  return (
    <div className="fixed inset-0 z-[500] bg-zinc-950/98 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[4rem] p-16 text-black space-y-12">
        <h3 className="text-5xl font-black italic uppercase tracking-tighter">Vibe Check</h3>
        <div className="grid grid-cols-2 gap-6">
          {moods.map(m => (
            <button key={m.name} onClick={() => setMatch(m.movie)} className="border-4 border-black py-6 rounded-3xl font-black uppercase text-sm hover:bg-black hover:text-white transition-all">{m.name}</button>
          ))}
        </div>
        {match && (
          <div className="bg-zinc-100 p-10 rounded-[2.5rem] text-center animate-in zoom-in duration-500">
            <p className="text-xs font-black uppercase tracking-widest mb-4 opacity-40">Your Movie Soulmate</p>
            <p className="text-4xl font-black italic uppercase text-red-600 tracking-tighter">{match}</p>
          </div>
        )}
        <button onClick={onClose} className="w-full text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Back to Database</button>
      </div>
    </div>
  );
};

// --- VIRAL FEATURE 3: GHOSTFACE PRANK ---
const GhostFacePrank: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [victimName, setVictimName] = useState('');
  const [status, setStatus] = useState<'idle' | 'ringing' | 'talking'>('idle');
  const startPrank = () => {
    if (!victimName) return alert("Who is the victim?");
    setStatus('ringing');
    const ringtone = new Audio('https://www.soundjay.com/phone/phone-calling-1.mp3');
    ringtone.play();
    setTimeout(() => {
      ringtone.pause();
      setStatus('talking');
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Hello... ${victimName}... I am watching you from movie box dot shop. Do you like scary movies?`;
      msg.pitch = 0.1; msg.rate = 0.7;
      window.speechSynthesis.speak(msg);
      msg.onend = () => { setStatus('idle'); };
    }, 4000);
  };
  return (
    <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-600 rounded-[3.5rem] p-12 relative shadow-[0_0_100px_rgba(220,38,38,0.4)]">
        <button onClick={onClose} className="absolute top-10 right-10 text-zinc-600 hover:text-white text-2xl transition-all">✕</button>
        <div className="text-center space-y-10">
          <h3 className="text-5xl font-black italic text-red-600 uppercase tracking-tighter">Scream Terminal</h3>
          <div className="space-y-6">
            <input type="text" placeholder="VICTIM NAME" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl py-6 px-10 text-white text-center text-xl outline-none focus:border-red-600 font-bold" value={victimName} onChange={(e) => setVictimName(e.target.value)} />
            <button onClick={startPrank} disabled={status !== 'idle'} className="w-full bg-red-600 text-white font-black py-8 rounded-3xl hover:scale-105 transition-all shadow-xl uppercase tracking-widest">
              {status === 'idle' ? 'Establish Call' : status === 'ringing' ? '📞 RINGING...' : '🔪 CONNECTED...'}
            </button>
          </div>
          <p className="text-[10px] text-zinc-700 uppercase font-black tracking-widest">Authorized use only. Global USA Node.</p>
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
    <div className="fixed inset-0 z-[200] bg-zinc-950/98 backdrop-blur-3xl overflow-y-auto pt-24 pb-10 px-4 animate-in fade-in duration-700">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl mx-auto bg-zinc-900 rounded-[3.5rem] overflow-hidden border border-zinc-800">
        <button onClick={onClose} className="absolute top-10 right-10 z-[220] bg-black/60 hover:bg-red-600 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-2xl hover:rotate-90">
          <i className="fa-solid fa-xmark text-2xl"></i>
        </button>
        <div className="flex flex-col">
          <div className="w-full bg-black aspect-video relative group">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`} title={movie.title} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full overflow-hidden">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[4000ms] ease-out" alt={movie.title} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(220,38,38,0.5)]">
                     <i className="fa-solid fa-play text-3xl text-white ml-2"></i>
                  </div>
                  <button onClick={() => setShowPlayer(true)} className="bg-white text-black px-12 py-5 rounded-2xl flex items-center gap-4 hover:bg-red-600 hover:text-white transition-all font-black text-xl tracking-tighter uppercase">Launch Official Trailer</button>
                </div>
              </div>
            )}
          </div>
          <div className="p-10 md:p-20 space-y-16">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-2xl">{movie.title}</h2>
              <div className="flex flex-wrap gap-6 text-sm font-bold items-center">
                <span className="text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">{Math.round(movie.vote_average * 10)}% Score</span>
                <span className="text-zinc-400 bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-700/50 uppercase tracking-widest">{movie.release_date}</span>
                <span className="text-red-500 font-black tracking-widest border-l border-zinc-800 pl-6 uppercase">Exclusive Access</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-12 border-t border-zinc-800/50 pt-12">
              <div className="md:col-span-2 space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">The Storyline</h3>
                <p className="text-xl md:text-3xl text-zinc-300 font-light leading-relaxed italic antialiased">"{movie.overview}"</p>
              </div>
              <div className="space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.5em] text-red-600">Watch Providers</h3>
                  <div className="flex flex-wrap gap-4">
                   {providers.length > 0 ? providers.map(p => (
                    <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} className="w-14 h-14 rounded-2xl border border-zinc-700 shadow-xl hover:scale-110 transition-transform" alt={p.provider_name} />
                  )) : <p className="text-xs text-zinc-600 font-bold uppercase italic">Check bgremoverai.online for posters</p>}
                  </div>
              </div>
            </div>
            <div className="space-y-10 border-t border-zinc-800/50 pt-12">
              <h3 className="text-xs font-black uppercase tracking-[0.6em] text-zinc-500 flex items-center gap-8">Main Production Cast <span className="h-px flex-1 bg-zinc-800"></span></h3>
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
  
  // States for Viral Features
  const [showPrank, setShowPrank] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [showVibe, setShowVibe] = useState(false);
  const [hackerMode, setHackerMode] = useState(false);

  const calculateCountdown = (date: string) => {
    if (!date) return 'Coming 2026';
    const diff = +new Date(date) - +new Date();
    if (diff <= 0) return "Global Release";
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} Days Left`;
  };

  const fetchData = useCallback(async (targetPage: number) => {
    let endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    if (viewMode === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${targetPage}`;
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
    <div className={`min-h-screen transition-all duration-700 ${hackerMode ? 'bg-black text-green-500 font-mono' : 'bg-zinc-950 text-white'} selection:bg-red-600`}>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-700 px-6 md:px-20 py-6 flex items-center justify-between ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/80 border-b border-zinc-800/50 backdrop-blur-2xl py-4' : 'bg-transparent'}`}>
        <div className="flex items-center gap-12">
          <h1 className={`text-4xl font-black italic tracking-tighter cursor-pointer transition-transform hover:scale-105 ${hackerMode ? 'text-green-500' : 'text-red-600'}`} onClick={() => setViewMode('home')}>CINEWISE</h1>
          
          <nav className="hidden lg:flex gap-2 p-1 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
            <button 
              onClick={() => setViewMode('home')} 
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'home' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              Discovery
            </button>
            {/* UPDATED UPCOMING BUTTON */}
            <button 
              onClick={() => setViewMode('upcoming')} 
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'upcoming' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              2026
            </button>
            <button 
              onClick={() => setViewMode('news')} 
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'news' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
              News
            </button>
            <div className="w-px h-4 bg-zinc-800 self-center mx-2"></div>
            <button onClick={() => setShowVibe(true)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Vibe Check</button>
            <button onClick={() => setShowSpoiler(true)} className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400 transition-colors">Leaks</button>
            <button onClick={() => setHackerMode(!hackerMode)} className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${hackerMode ? 'text-green-400' : 'text-zinc-500 hover:text-green-500'}`}>
              {hackerMode ? 'Exit Matrix' : 'Matrix'}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowPrank(true)} 
              className="group relative overflow-hidden bg-red-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
              <span className="relative z-10 flex items-center gap-2 text-white">
                <i className="fa-solid fa-skull text-xs animate-bounce"></i> Scream
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>

            <div className="relative group">
               <input type="text" placeholder="SEARCH CINEMA..." className="bg-zinc-900/80 border border-zinc-800 rounded-xl py-3 px-12 text-[11px] w-48 md:w-80 outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 transition-all font-bold placeholder:text-zinc-600 text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
               <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors"></i>
            </div>
        </div>
      </header>

      {viewMode === 'disclaimer' ? (
        <div className="pt-48 px-6 max-w-6xl mx-auto min-h-screen space-y-10">
          <h1 className="text-7xl md:text-[10rem] font-black italic text-white uppercase tracking-tighter">LEGAL</h1>
          <p className="text-2xl text-zinc-500 italic border-l-4 border-red-600 pl-10">Metadata provided by TMDB. Content is for educational display only.</p>
          <button onClick={() => setViewMode('home')} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest mt-10">Return</button>
        </div>
      ) : (
        <>
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-screen w-full flex items-center px-6 md:px-24 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px] scale-105" alt="Feature" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
              <div className="relative max-w-5xl space-y-10 animate-in slide-in-from-left duration-1000">
                <span className="bg-red-600 text-[11px] font-black px-6 py-2 rounded-full tracking-[0.4em] uppercase">Breaking 2026 Update</span>
                <h2 className={`text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.85] drop-shadow-2xl ${hackerMode ? 'text-green-400' : 'text-white'}`}>{movies[0].title}</h2>
                <button onClick={() => setSelectedMovie(movies[0])} className="bg-white text-black font-black px-16 py-6 rounded-[2rem] hover:bg-red-600 hover:text-white transition-all text-sm tracking-widest uppercase">Explore This Title</button>
              </div>
            </section>
          )}

          <main className="px-6 md:px-20 py-32 min-h-screen">
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-700 mb-20 flex items-center gap-10">
              {viewMode === 'home' ? 'Trending Discovery' : viewMode === 'upcoming' ? '2026 Roadmap' : 'Production Feeds'} <span className="h-px flex-1 bg-zinc-900/50"></span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                <div key={m.id} onClick={() => setSelectedMovie(m)} className="group cursor-pointer">
                  <div className={`aspect-[2/3] overflow-hidden rounded-[2.5rem] border-2 bg-zinc-900 relative shadow-2xl transition-all duration-500 ${hackerMode ? 'border-green-900' : 'border-zinc-900 group-hover:border-red-600/40'}`}>
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-30" alt={m.title} />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0 text-white">
                      <p className="text-sm font-black uppercase italic leading-tight mb-3">{m.title}</p>
                      <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase">⏳ {calculateCountdown(m.release_date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!searchQuery && (
              <div className="flex justify-center mt-32">
                <button onClick={() => fetchData(page + 1)} className="bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white font-black px-20 py-7 rounded-[2.5rem] transition-all text-xs tracking-[0.4em] uppercase shadow-2xl">Load More Data</button>
              </div>
            )}
          </main>
        </>
      )}

      {showPrank && <GhostFacePrank onClose={() => setShowPrank(false)} />}
      {showVibe && <VibeMatcher onClose={() => setShowVibe(false)} />}
      {showSpoiler && <SpoilerRoulette onClose={() => setShowSpoiler(false)} />}
      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      <footer className="py-24 bg-zinc-950 text-center border-t border-zinc-900 mt-20">
        <div className="flex justify-center gap-16 text-[11px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-10">
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Legal</button>
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Privacy</button>
          <button className="hover:text-red-600 transition-colors">DMCA</button>
          <button onClick={() => window.open('https://bgremoverai.online', '_blank')} className="text-zinc-500 hover:text-white">Bg Remover</button>
        </div>
        <p className={`text-xs font-bold tracking-tighter ${hackerMode ? 'text-green-900' : 'text-zinc-800'}`}>CINEWISE &copy; 2026 - THE ULTIMATE TIKTOK CINEMA HUB</p>
      </footer>
    </div>
  );
};

export default App;
