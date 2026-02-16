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

// --- CONFIGURATION & UTILS ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=200&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- GHOST-FACE PRANK OVERLAY (FOR USA AUDIENCE) ---
const GhostFacePrank: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [victimName, setVictimName] = useState('');
  const [status, setStatus] = useState<'idle' | 'ringing' | 'talking'>('idle');

  const startPrank = () => {
    if (!victimName) return alert("Who is the victim? Enter a name.");
    setStatus('ringing');
    const ringtone = new Audio('https://www.soundjay.com/phone/phone-calling-1.mp3');
    ringtone.play();

    setTimeout(() => {
      ringtone.pause();
      setStatus('talking');
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Hello... ${victimName}... I am watching you from movie box dot shop. Do you like scary movies?`;
      msg.pitch = 0.1; 
      msg.rate = 0.7;
      window.speechSynthesis.speak(msg);
      msg.onend = () => { setStatus('idle'); };
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-600 rounded-[3.5rem] p-12 relative shadow-[0_0_100px_rgba(220,38,38,0.4)]">
        <button onClick={onClose} className="absolute top-10 right-10 text-zinc-600 hover:text-white text-3xl transition-all">✕</button>
        <div className="text-center space-y-10">
          <div className="space-y-4">
            <h3 className="text-5xl font-black italic text-red-600 uppercase tracking-tighter">Ghostface Terminal</h3>
            <p className="text-zinc-500 text-[10px] font-black tracking-[0.5em] uppercase">Status: Connected to USA Node</p>
          </div>
          <div className="space-y-6">
            <input 
              type="text" 
              placeholder="TARGET NAME..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl py-6 px-10 text-white text-center text-xl outline-none focus:border-red-600 transition-all font-bold placeholder:text-zinc-700"
              value={victimName}
              onChange={(e) => setVictimName(e.target.value)}
            />
            <button 
              onClick={startPrank}
              disabled={status !== 'idle'}
              className="w-full bg-red-600 text-white font-black py-8 rounded-3xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(220,38,38,0.3)] uppercase tracking-[0.3em] text-sm"
            >
              {status === 'idle' ? 'Establish Lethal Connection' : status === 'ringing' ? '📞 RINGING TARGET...' : '🔪 VICTIM IS LISTENING...'}
            </button>
          </div>
          <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest leading-relaxed">Warning: This simulation uses localized AI voice synthesis for authorized entertainment only.</p>
        </div>
      </div>
    </div>
  );
};

// --- MOVIE DETAIL MODAL (TRAILER + CAST + OTT) ---
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
      setVideoKey(null);
      setProviders([]);
      setCast([]);
      setShowPlayer(false);
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-3xl overflow-y-auto pt-24 pb-10 px-4 animate-in fade-in duration-700">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl mx-auto bg-zinc-900 rounded-[3.5rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.9)] border border-zinc-800 transition-all">
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
                <span className="text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">{Math.round(movie.vote_average * 10)}% Audience Score</span>
                <span className="text-zinc-400 bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-700/50 uppercase tracking-widest">{movie.release_date}</span>
                <span className="text-red-500 font-black tracking-widest border-l border-zinc-800 pl-6 uppercase">Exclusive 2026 Access</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-12 border-t border-zinc-800/50 pt-12">
              <div className="md:col-span-2 space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">The Storyline</h3>
                <p className="text-xl md:text-3xl text-zinc-300 font-light leading-relaxed italic antialiased">"{movie.overview}"</p>
              </div>
              <div className="space-y-8">
                 <h3 className="text-xs font-black uppercase tracking-[0.5em] text-red-600">Available Platforms</h3>
                 <div className="flex flex-wrap gap-4">
                  {providers.length > 0 ? providers.map(p => (
                    <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} className="w-14 h-14 rounded-2xl border border-zinc-700 shadow-xl hover:scale-110 transition-transform" alt={p.provider_name} />
                  )) : <p className="text-xs text-zinc-600 font-bold uppercase italic">Theater Release Only</p>}
                 </div>
              </div>
            </div>
            <div className="space-y-10 border-t border-zinc-800/50 pt-12">
              <h3 className="text-xs font-black uppercase tracking-[0.6em] text-zinc-500 flex items-center gap-8">Main Cast <span className="h-px flex-1 bg-zinc-800"></span></h3>
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
  const [showPrank, setShowPrank] = useState(false);

  const handleOpenMovie = (m: Movie) => {
    setSelectedMovie(m);
    const slug = m.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    window.history.pushState({ movieId: m.id }, '', `/${slug}`);
  };

  const handleCloseMovie = () => {
    setSelectedMovie(null);
    window.history.pushState({}, '', '/');
  };

  const calculateCountdown = (date: string) => {
    if (!date) return 'Coming 2026';
    const diff = +new Date(date) - +new Date();
    if (diff <= 0) return "Global Release";
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))} Days Remaining`;
  };

  const fetchData = useCallback(async (targetPage: number) => {
    let endpoint = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    if (viewMode === 'upcoming') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    else if (viewMode === 'news') endpoint = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${targetPage}`;
    
    const res = await fetch(endpoint);
    const data = await res.json();
    let results = data.results || [];

    setMovies(prev => {
      const movieMap = new Map();
      [...prev, ...results].forEach(m => movieMap.set(m.id, m));
      return targetPage === 1 ? results : Array.from(movieMap.values());
    });
    setPage(targetPage);
  }, [viewMode]);

  useEffect(() => {
    fetchData(1);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  return (
    <div className={`min-h-screen bg-zinc-950 text-white selection:bg-red-600 ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-1000 px-6 md:px-20 py-8 flex items-center justify-between ${isScrolled || viewMode !== 'home' ? 'bg-zinc-950/90 border-b border-zinc-900 backdrop-blur-3xl py-5' : 'bg-transparent'}`}>
        <div className="flex items-center gap-16">
          <h1 className="text-4xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => {setViewMode('home'); handleCloseMovie();}}>CINEWISE</h1>
          <nav className="hidden lg:flex gap-10 text-[11px] font-black uppercase tracking-[0.3em]">
            <button onClick={() => setViewMode('home')} className={viewMode === 'home' ? 'text-white border-b-2 border-red-600' : 'text-zinc-600'}>Discovery</button>
            <button onClick={() => setViewMode('upcoming')} className={viewMode === 'upcoming' ? 'text-white border-b-2 border-red-600' : 'text-zinc-600'}>Coming 2026</button>
            <button onClick={() => setViewMode('news')} className={viewMode === 'news' ? 'text-white border-b-2 border-red-600' : 'text-zinc-600'}>Industry News</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-8">
          <button onClick={() => setShowPrank(true)} className="bg-red-600 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse hover:bg-white hover:text-red-600 transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] border-2 border-red-600">💀 Scream Prank</button>
          <div className="relative">
             <input type="text" placeholder="GLOBAL SEARCH..." className="bg-zinc-900/60 border border-zinc-800 rounded-full py-4 px-14 text-[11px] w-64 md:w-[22rem] outline-none focus:ring-2 focus:ring-red-600/40 transition-all font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
             <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 text-sm"></i>
          </div>
        </div>
      </header>

      {viewMode === 'disclaimer' ? (
        <div className="pt-48 px-6 max-w-6xl mx-auto min-h-screen space-y-10">
          <h1 className="text-7xl md:text-9xl font-black italic text-white">LEGAL</h1>
          <p className="text-2xl text-zinc-500 italic">CineWise provides metadata and trailers via TMDB & YouTube APIs. We do not host copyrighted video content.</p>
          <button onClick={() => setViewMode('home')} className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest">Return</button>
        </div>
      ) : (
        <>
          {!searchQuery && viewMode === 'home' && movies[0] && (
            <section className="relative h-screen w-full flex items-center px-6 md:px-24 overflow-hidden">
              <img src={getImageUrl(movies[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[2px] scale-105" alt="Feature" />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
              <div className="relative max-w-5xl space-y-10">
                <span className="bg-red-600 text-[11px] font-black px-6 py-2 rounded-full tracking-[0.4em] uppercase shadow-2xl">Breaking 2026 Update</span>
                <h2 className="text-7xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.85] text-white drop-shadow-2xl">{movies[0].title}</h2>
                <button onClick={() => handleOpenMovie(movies[0])} className="bg-white text-black font-black px-16 py-6 rounded-[2rem] hover:bg-red-600 hover:text-white transition-all text-sm tracking-widest uppercase">Explore This Title</button>
              </div>
            </section>
          )}

          <main className="px-6 md:px-20 py-32 min-h-screen">
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-700 mb-20 flex items-center gap-10">
              {viewMode === 'home' ? 'Trending Discovery' : viewMode === 'upcoming' ? '2026 Roadmap' : 'Production Feeds'} <span className="h-px flex-1 bg-zinc-900/50"></span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map(m => (
                <div key={m.id} onClick={() => handleOpenMovie(m)} className="group cursor-pointer">
                  <div className="aspect-[2/3] overflow-hidden rounded-[2.5rem] border-2 border-zinc-900 bg-zinc-900 relative shadow-2xl group-hover:border-red-600/40 transition-all duration-500">
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
                <button onClick={() => fetchData(page + 1)} className="bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white font-black px-20 py-7 rounded-[2.5rem] transition-all text-xs tracking-[0.4em] uppercase shadow-2xl">Explore More Titles</button>
              </div>
            )}
          </main>
        </>
      )}

      {showPrank && <GhostFacePrank onClose={() => setShowPrank(false)} />}
      <MovieDetailModal movie={selectedMovie} onClose={handleCloseMovie} />

      <footer className="py-24 bg-zinc-950 text-center border-t border-zinc-900 mt-20">
        <div className="flex justify-center gap-16 text-[11px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-10">
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Legal</button>
          <button className="hover:text-red-600 transition-colors">DMCA</button>
        </div>
        <p className="text-xs text-zinc-800 font-bold tracking-tighter">CINEWISE &copy; 2026 - POWERED BY TMDB</p>
      </footer>
    </div>
  );
};

export default App;
