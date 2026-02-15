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

// --- CONFIGURATION ---
const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// --- API HELPERS ---
const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- INTERNAL COMPONENTS ---

const MovieCard: React.FC<{ movie: Movie; onClick: (m: Movie) => void }> = ({ movie, onClick }) => (
  <div className="relative group cursor-pointer transition-all duration-300 transform hover:scale-105" onClick={() => onClick(movie)}>
    <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-zinc-900 border border-zinc-800 shadow-lg">
      <img src={getImageUrl(movie.poster_path)} alt={movie.title} className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-20" loading="lazy" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/90 via-transparent transition-opacity">
        <span className="text-sm font-black uppercase italic leading-tight">{movie.title}</span>
        <span className="text-[10px] text-yellow-500 mt-1"><i className="fa-solid fa-star"></i> {movie.vote_average.toFixed(1)}</span>
      </div>
    </div>
  </div>
);

const MovieDetailModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (movie) {
      fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          setTrailerKey(trailer ? trailer.key : null);
        });
    } else {
      setTrailerKey(null);
      setShowPlayer(false);
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/95 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
      {/* Background Click to Close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 z-[220] bg-black/60 hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
        
        <div className="flex flex-col">
          {/* Trailer Player Box */}
          <div className="w-full bg-black aspect-video relative">
            {showPlayer && trailerKey ? (
              <iframe 
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="relative w-full h-full group">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-60" alt={movie.title} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {trailerKey && (
                    <button 
                      onClick={() => setShowPlayer(true)}
                      className="bg-red-600 text-white w-20 h-20 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl active:scale-95"
                    >
                      <i className="fa-solid fa-play text-3xl ml-1"></i>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-10 bg-zinc-900">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">{movie.title}</h2>
            <div className="flex gap-4 mb-6 text-sm font-bold">
              <span className="text-green-500">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="text-zinc-400">{movie.release_date?.split('-')[0]}</span>
            </div>
            <p className="text-lg text-zinc-300 leading-relaxed font-light italic">"{movie.overview}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'blogs'>('home');
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const tRes = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
      const pRes = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
      const tData = await tRes.json();
      const pData = await pRes.json();
      setTrending(tData.results || []);
      setPopular(pData.results || []);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    setSearchResults(data.results || []);
    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-zinc-950 shadow-2xl border-b border-zinc-900' : 'bg-transparent'}`}>
        <div className="flex items-center gap-10">
          <h1 className="text-2xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => {setViewMode('home'); setSearchQuery('');}}>CINEWISE</h1>
          <nav className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <button onClick={() => setViewMode('home')} className={viewMode === 'home' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500 hover:text-white'}>Home</button>
            <button onClick={() => setViewMode('news')} className={viewMode === 'news' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500 hover:text-white'}>2026 News</button>
            <button onClick={() => setViewMode('blogs')} className={viewMode === 'blogs' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500 hover:text-white'}>Guides</button>
          </nav>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <input type="text" placeholder="SEARCH MOVIES..." className="bg-zinc-900/80 border border-zinc-800 rounded-full py-2.5 px-10 text-[10px] w-40 md:w-80 outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
        </form>
      </header>

      {!searchQuery && viewMode === 'home' && trending[0] && (
        <section className="relative h-[85vh] w-full overflow-hidden">
          <img src={getImageUrl(trending[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl space-y-6">
            <span className="text-red-600 font-black tracking-[0.4em] text-[10px] uppercase">Featured Today</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">{trending[0].title}</h2>
            <button onClick={() => setSelectedMovie(trending[0])} className="bg-white text-black font-black px-10 py-4 rounded-xl hover:bg-red-600 hover:text-white w-fit text-sm transition-all active:scale-95 shadow-xl">VIEW DETAILS</button>
          </div>
        </section>
      )}

      <main className="px-6 md:px-12 py-20 min-h-screen">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">
          {searchQuery ? `Results for "${searchQuery}"` : viewMode === 'home' ? 'Trending Movies' : 'Production News'}
          <span className="h-px flex-1 bg-zinc-900"></span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {(searchQuery ? searchResults : viewMode === 'home' ? trending : popular).map(m => (
            <MovieCard key={m.id} movie={m} onClick={setSelectedMovie} />
          ))}
        </div>
      </main>

      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      <footer className="w-full py-12 bg-zinc-950 text-zinc-500 text-center border-t border-zinc-900 mt-20">
        <p className="text-sm font-bold">&copy; 2026 MovieBox - Professional Cinematic Network</p>
        <div className="flex justify-center gap-6 mt-4 text-xs font-black tracking-widest uppercase">
          <a href="/disclaimer" className="hover:text-red-600 transition-colors">Disclaimer</a>
          <a href="/privacy" className="hover:text-red-600 transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
