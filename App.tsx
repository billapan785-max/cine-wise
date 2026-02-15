import React, { useState, useEffect, useCallback } from 'react';

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

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// --- CONFIGURATION ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getImageUrl = (path: string, size: 'w92' | 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- MODAL COMPONENT (WITH WATCH PROVIDERS) ---
const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (movie) {
      // 1. Fetch Trailer
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          setVideoKey(trailer ? trailer.key : null);
        });

      // 2. Fetch Watch Providers (Official Streaming Links Info)
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          // US ya Global results (Flatrate means Subscription like Netflix)
          const results = data.results?.US?.flatrate || data.results?.IN?.flatrate || [];
          setProviders(results.slice(0, 3)); // Top 3 providers
        });
    } else {
      setVideoKey(null);
      setProviders([]);
      setShowPlayer(false);
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-md overflow-y-auto pt-20 pb-10 px-4">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl mx-auto bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
        <button onClick={onClose} className="absolute top-5 right-5 z-[220] bg-black/50 hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-xmark"></i></button>
        
        <div className="flex flex-col">
          {/* Player/Hero Area */}
          <div className="w-full bg-black aspect-video relative">
            {showPlayer && videoKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} title="Trailer" frameBorder="0" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-50" alt={movie.title} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {videoKey && (
                    <button onClick={() => setShowPlayer(true)} className="bg-red-600 text-white px-8 py-4 rounded-full flex items-center gap-3 hover:scale-110 transition-transform font-black">
                      <i className="fa-solid fa-play"></i> PLAY TRAILER
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details & Providers Area */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">{movie.title}</h2>
            
            <div className="flex flex-wrap gap-6 mb-8">
               {/* Metadata */}
               <div className="flex gap-4 text-sm font-bold items-center border-r border-zinc-800 pr-6">
                 <span className="text-green-500">{Math.round(movie.vote_average * 10)}% Match</span>
                 <span className="text-zinc-400">{movie.release_date?.split('-')[0]}</span>
               </div>

               {/* Watch Providers Section */}
               {providers.length > 0 && (
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stream On:</span>
                    <div className="flex gap-2">
                      {providers.map(p => (
                        <img key={p.provider_id} src={getImageUrl(p.logo_path, 'w92')} title={p.provider_name} className="w-8 h-8 rounded-lg shadow-lg border border-zinc-700" alt={p.provider_name} />
                      ))}
                    </div>
                 </div>
               )}
            </div>

            <p className="text-lg md:text-2xl text-zinc-300 italic font-light leading-relaxed">"{movie.overview}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    setMovies(data.results || []);
  }, []);

  useEffect(() => {
    fetchData();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setMovies(data.results || []);
    } else if (query === "") {
      fetchData();
    }
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-zinc-950/95 border-b border-zinc-900' : 'bg-transparent'}`}>
        <h1 className="text-2xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => {setSearchQuery(''); fetchData();}}>CINEWISE</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="SEARCH..." 
            className="bg-zinc-900/80 border border-zinc-800 rounded-full py-2 px-10 text-[10px] w-40 md:w-80 outline-none focus:ring-1 focus:ring-red-600"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
        </div>
      </header>

      <main className="px-6 md:px-12 pt-32 pb-20 min-h-screen">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">
          {searchQuery ? 'Search Results' : 'Recommended for You'} <span className="h-px flex-1 bg-zinc-900"></span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {movies.map(m => (
            <div key={m.id} onClick={() => setSelectedMovie(m)} className="relative group cursor-pointer transition-all hover:scale-105">
              <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:opacity-20 transition-opacity" alt={m.title} />
                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black uppercase italic">{m.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      <footer className="py-12 bg-zinc-950 text-center border-t border-zinc-900">
        <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
          <a href="#" className="hover:text-red-600">Disclaimer</a>
          <a href="#" className="hover:text-red-600">Privacy</a>
        </div>
        <p className="text-xs text-zinc-700 font-bold">&copy; 2026 CINEWISE - OFFICIAL NETWORK</p>
      </footer>
    </div>
  );
};

export default App;
