import React from 'react';
import { ChefIcon, ShoppingCartIcon } from './Icons';
import { DietaryFilter } from '../types';

interface SidebarProps {
  activeView: 'home' | 'shopping';
  onChangeView: (view: 'home' | 'shopping') => void;
  selectedFilters: DietaryFilter[];
  onToggleFilter: (filter: DietaryFilter) => void;
  shoppingListCount: number;
}

const FILTERS: DietaryFilter[] = ['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Paleo'];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onChangeView, 
  selectedFilters, 
  onToggleFilter,
  shoppingListCount
}) => {
  return (
    <div className="w-full md:w-64 bg-slate-800 flex flex-col h-full border-r border-slate-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ChefIcon className="w-8 h-8 text-blue-500" />
            CulinaryAI
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <button 
          onClick={() => onChangeView('home')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeView === 'home' 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Recipes
        </button>

        <button 
          onClick={() => onChangeView('shopping')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeView === 'shopping' 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
            : 'text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ShoppingCartIcon className="w-6 h-6" />
          Shopping List
          {shoppingListCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {shoppingListCount}
            </span>
          )}
        </button>
      </nav>

      <div className="p-6 border-t border-slate-700">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Dietary Filters</h3>
        <div className="space-y-2">
            {FILTERS.map(filter => (
                <label key={filter} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedFilters.includes(filter) 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-slate-600 group-hover:border-slate-500'
                    }`}>
                        {selectedFilters.includes(filter) && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={selectedFilters.includes(filter)}
                        onChange={() => onToggleFilter(filter)}
                    />
                    <span className={`text-sm ${selectedFilters.includes(filter) ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        {filter}
                    </span>
                </label>
            ))}
        </div>
      </div>
    </div>
  );
};
