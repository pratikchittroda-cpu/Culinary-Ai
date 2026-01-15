import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-slate-700 group"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {/* Placeholder image using Picsum - randomized slightly by ID to vary images */}
        <img 
          src={`https://picsum.photos/seed/${recipe.id}/600/400`} 
          alt={recipe.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            recipe.difficulty === 'Easy' ? 'bg-green-500/90 text-white' :
            recipe.difficulty === 'Medium' ? 'bg-yellow-500/90 text-black' :
            'bg-red-500/90 text-white'
          }`}>
            {recipe.difficulty}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
            {recipe.prepTime}
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M13.5 4.938a7 7 0 11-9.006 1.737c.202-.257.59-.218.793.08a5.002 5.002 0 007.82.217c.05-.067.12-.118.2-.144.17-.058.358-.026.5.086zM3.5 14a5.5 5.5 0 1111 0 1.5 1.5 0 00-3 0 2.5 2.5 0 10-5 0 1.5 1.5 0 00-3 0z" clipRule="evenodd" />
            </svg>
            {recipe.calories} kcal
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
            {recipe.dietaryTags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {tag}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};
