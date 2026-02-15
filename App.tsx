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

const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=500&auto=format&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// --- DISCLAIMER COMPONENT ---
const DisclaimerView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="pt-32 px-6 max-w-4xl mx-auto min-h-screen animate-in fade-in duration-500">
    <button onClick={onBack} className="text-red-600 font-bold mb-8 flex items-center gap-2 hover:underline">
      <i className="fa-solid fa-arrow-left"></i> BACK TO HOME
    </button>
    <h1 className="text-4xl font-black italic mb-6">DISCLAIMER & LEGAL NOTICE</h1>
    <div className="space-y-6 text-zinc-400 leading-relaxed italic">
      <p>Welcome to <strong>MovieBox (CineWise)</strong>. The content provided on this website, including movie details, posters, and trailers, is for informational and educational purposes only.</p>
      <p><strong>1. Content Source:</strong> All movie data and images are fetched via the TMDB API. We do not host any copyrighted video files or movies on our servers. All trailers are embedded via official YouTube players.</p>
      <p><strong>2. Copyright:</strong> We respect the intellectual property rights of others. If you believe any content on this site infringes upon your copyright, please contact us immediately.</p>
      <p><strong>3. External Links:</strong> Our site may contain links to third-party websites. We are not responsible for the content or privacy practices of these external sites.</p>
      <p><strong>4. Accuracy:</strong> While we strive for 2026 accuracy, movie release dates and details are subject to change by production houses without notice.</p>
    </div>
  </div>
);

// --- MODAL COMPONENT (WITH URL SYNC) ---
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
    <div className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-md overflow-y-auto pt-24 pb-10 px-4">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl mx-auto bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
        <button onClick={onClose} className="absolute top-5 right-5 z-[220] bg-black/50 hover:bg-red-600 w-10 h-10 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-xmark"></i></button>
        <div className="flex flex-col">
          <div className="w-full bg-black aspect-video relative">
            {showPlayer && trailerKey ? (
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} title="Trailer" frameBorder="0" allowFullScreen></iframe>
            ) : (
              <div className="relative w-full h-full">
                <img src={getImageUrl(movie.backdrop_path, 'original')} className="w-full h-full object-cover opacity-60" alt={movie.title} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {trailerKey && (
                    <button onClick={() => setShowPlayer(true)} className="bg-red-600 text-white w-20 h-20 rounded-full flex items-center justify-center hover:scale-110 transition-transform"><i className="fa-solid fa-play text-3xl ml-1"></i></button>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="p-8 md:p-12">
            <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">{movie.title}</h2>
            <div className="flex gap-4 mb-6 text-sm font-bold items-center">
              <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-md">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="text-zinc-400">{movie.release_date?.split('-')[0]}</span>
            </div>
            <p className="text-lg md:text-2xl text-zinc-300 italic font-light leading-relaxed">"{movie.overview}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'news' | 'blogs' | 'disclaimer'>('home');
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Function to Open Movie & Update URL
  const openMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    const slug = movie.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    window.history.pushState({}, '', `?movie=${slug}`);
  };

  const closeMovie = () => {
    setSelectedMovie(null);
    window.history.pushState({}, '', window.location.pathname);
  };

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

  return (
    <div className={`min-h-screen bg-zinc-950 text-white ${selectedMovie ? 'h-screen overflow-hidden' : ''}`}>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${isScrolled || viewMode === 'disclaimer' ? 'bg-zinc-950/95 border-b border-zinc-900' : 'bg-transparent'}`}>
        <div className="flex items-center gap-10">
          <h1 className="text-2xl font-black text-red-600 italic tracking-tighter cursor-pointer" onClick={() => {setViewMode('home'); setSearchQuery('');}}>CINEWISE</h1>
          <nav className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <button onClick={() => setViewMode('home')} className={viewMode === 'home' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500'}>Home</button>
            <button onClick={() => setViewMode('news')} className={viewMode === 'news' ? 'text-white border-b-2 border-red-600' : 'text-zinc-500'}>2026 News</button>
          </nav>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          <input type="text" placeholder="SEARCH..." className="bg-zinc-900/80 border border-zinc-800 rounded-full py-2 px-10 text-[10px] w-40 md:w-80 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </form>
      </header>

      {viewMode === 'disclaimer' ? (
        <DisclaimerView onBack={() => setViewMode('home')} />
      ) : (
        <>
          {!searchQuery && viewMode === 'home' && trending[0] && (
            <section className="relative h-[80vh] w-full overflow-hidden">
              <img src={getImageUrl(trending[0].backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              <div className="relative h-full flex flex-col justify-center px-6 md:px-16 space-y-6">
                <h2 className="text-5xl md:text-8xl font-black italic uppercase leading-tight">{trending[0].title}</h2>
                <button onClick={() => openMovie(trending[0])} className="bg-white text-black font-black px-10 py-4 rounded-xl hover:bg-red-600 hover:text-white transition-all w-fit">VIEW DETAILS</button>
              </div>
            </section>
          )}

          <main className="px-6 md:px-12 py-20 min-h-screen">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-4">
              {viewMode === 'home' ? 'Trending Global' : 'Production News'}
              <span className="h-px flex-1 bg-zinc-800"></span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {(viewMode === 'home' ? trending : popular).map(m => (
                <div key={m.id} onClick={() => openMovie(m)} className="relative group cursor-pointer transition-all transform hover:scale-105">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-zinc-800 shadow-xl bg-zinc-900">
                    <img src={getImageUrl(m.poster_path)} className="h-full w-full object-cover group-hover:opacity-20 transition-opacity" alt={m.title} />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-black italic uppercase">{m.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      <MovieDetailModal movie={selectedMovie} onClose={closeMovie} />

      <footer className="w-full py-12 bg-zinc-950 text-zinc-500 text-center border-t border-zinc-900">
        <p className="text-sm font-bold">&copy; 2026 MovieBox - Professional Cinematic Network</p>
        <div className="flex justify-center gap-6 mt-4 text-xs font-black tracking-widest uppercase">
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Disclaimer</button>
          <button onClick={() => setViewMode('disclaimer')} className="hover:text-red-600 transition-colors">Privacy Policy</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
