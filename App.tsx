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

const TMDB_API_KEY = 'cfedd233fe8494b29646beabc505d193';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- MODAL COMPONENT (FIXED ALIGNMENT) ---
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
    // Fixed: Added pt-20 and overflow-y-auto to handle top hiding issue
    <div className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-md overflow-y-auto pt-20 pb-10 px-4">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      
      {/* Container Box */}
      <div className="relative w-full max-w-5xl mx-auto bg-zinc-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-800 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 z-[220] bg-black/50 hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all">
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <div className="flex flex-col">
          {/* Trailer/Hero Section */}
          <div className="w-full bg-black aspect-video relative">
            {showPlayer && trailerKey ? (
              <iframe 
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="relative w-full h-full">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-60" alt={movie.title} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {trailerKey && (
                    <button 
                      onClick={() => setShowPlayer(true)}
                      className="bg-red-600 text-white w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl active:scale-95"
                    >
                      <i className="fa-solid fa-play text-2xl md:text-4xl ml-1"></i>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-8 md:p-12 bg-zinc-900">
            <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none">{movie.title}</h2>
            <div className="flex gap-4 mb-6 text-sm font-bold items-center">
              <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-md">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="text-zinc-400">{movie.release_date?.split('-')[0]}</span>
              <span className="border border-zinc-700 px-2 py-0.5 rounded text-[10px] text-zinc-500 uppercase">HD</span>
            </div>
            <p className="text-lg md:text-2xl text-zinc-300 leading-relaxed font-light italic">"{movie.overview}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieCard: React.FC<{ movie: Movie; onClick: (m: Movie) => void }> = ({ movie, onClick }) => (
  <div className="relative group cursor-pointer transition-all duration-300 transform hover:scale-105" onClick={() => onClick(movie)}>
    <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl">
      <img src={getImageUrl(movie.poster_path)} alt={movie.title} className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-20" loading="lazy" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black via-transparent transition-opacity">
        <span className="text-xs font-black uppercase italic leading-tight">{movie.title}</span>
        <span className="text-[10px] text-yellow-500 mt-1"><i className="fa-solid fa-star"></i> {movie.vote_average.toFixed(1)}</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'blogs'>('home');
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const fetchData = useCallback(async () => {
    const [tRes, pRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`)
    ]);
    const [tData, pData] = await Promise.all([tRes.json(), pRes.json()]);
    setTrending(tData.results || []);
    setPopular(pData.results || []);
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
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    setSearchResults(data.results || []);
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-900' : 'bg-transparent'}`}>
        <h1 className="text-2xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => {setViewMode('home'); setSearchQuery('');}}>CINEWISE</h1>
        <form onSubmit={handleSearch} className="relative">
          <input type="text" placeholder="SEARCH..." className="bg-zinc-900/80 border border-zinc-800 rounded-full py-2 px-10 text-[10px] w-40 md:w-80 outline-none focus:ring-2 focus:ring-red-600 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
        </form>
      </header>

      {!searchQuery && viewMode === 'home' && trending[0] && (
        <section className="relative h-[80vh] w-full overflow-hidden">
          <img src={getImageUrl(trending[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          <div className="relative h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl space-y-6">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase">{trending[0].title}</h2>
            <button onClick={() => setSelectedMovie(trending[0])} className="bg-white text-black font-black px-10 py-4 rounded-xl hover:bg-red-600 hover:text-white w-fit text-sm transition-all active:scale-95 shadow-xl">VIEW DETAILS</button>
          </div>
        </section>
      )}

      <main className="px-6 md:px-12 py-20">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">
          {searchQuery ? 'Search Results' : 'Trending Now'}
          <span className="h-px flex-1 bg-zinc-800"></span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {(searchQuery ? searchResults : trending).map(m => <MovieCard key={m.id} movie={m} onClick={setSelectedMovie} />)}
        </div>
      </main>

      <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      <footer className="w-full py-12 bg-zinc-950 text-zinc-500 text-center border-t border-zinc-900">
        <p className="text-sm font-bold">&copy; 2026 MovieBox - All Trending Hollywood Updates</p>
      </footer>
    </div>
  );
};

export default App;
