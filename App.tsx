
import React, { useState } from 'react';
import { getAIRecommendations } from '../services/geminiService';
import { searchMovies } from '../App';
import { Movie } from '../types';

interface AIConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
}

const AIConcierge: React.FC<AIConciergeProps> = ({ isOpen, onClose, onSelectMovie }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const titles = await getAIRecommendations(prompt);
      const movieDataPromises = titles.map(title => searchMovies(title));
      const results = await Promise.all(movieDataPromises);
      
      const foundMovies = results
        .map(r => r[0])
        .filter((m): m is Movie => !!m);
      
      setRecommendations(foundMovies);
    } catch (error) {
      console.error("AI recommendation failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-sparkles text-white text-sm"></i>
            </div>
            <h2 className="text-xl font-bold">AI Concierge</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <textarea
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none h-32"
              placeholder="e.g., 'I want a mind-bending sci-fi movie like Inception...'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
            <button 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
              {loading ? 'Curating Recommendations...' : 'Get AI Picks'}
            </button>
          </form>

          {recommendations.length > 0 && (
            <div className="space-y-4 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Handpicked for you</h3>
              <div className="space-y-3">
                {recommendations.map(movie => (
                  <div 
                    key={movie.id}
                    onClick={() => onSelectMovie(movie)}
                    className="flex gap-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group"
                  >
                    <img 
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                      className="w-16 h-24 rounded object-cover shadow-lg"
                      alt={movie.title}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate group-hover:text-red-500 transition-colors">{movie.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                        <span className="text-yellow-500 font-bold"><i className="fa-solid fa-star mr-1"></i>{movie.vote_average.toFixed(1)}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 mt-2 leading-tight">{movie.overview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIConcierge;
