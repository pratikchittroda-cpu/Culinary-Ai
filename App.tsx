import React, { useState, useRef } from 'react';
import { analyzeFridgeAndGetRecipes } from './services/geminiService';
import { Recipe, Ingredient, DietaryFilter } from './types';
import { Sidebar } from './components/Sidebar';
import { RecipeCard } from './components/RecipeCard';
import { CookingMode } from './components/CookingMode';
import { CameraIcon, CheckIcon } from './components/Icons';

function App() {
  const [activeView, setActiveView] = useState<'home' | 'shopping'>('home');
  const [selectedFilters, setSelectedFilters] = useState<DietaryFilter[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleFilter = (filter: DietaryFilter) => {
    setSelectedFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const result = await analyzeFridgeAndGetRecipes(base64String, selectedFilters);
        setIdentifiedIngredients(result.identifiedIngredients);
        setRecipes(result.recipes);
      } catch (error) {
        alert("Failed to analyze image. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addToShoppingList = (item: string) => {
    if (!shoppingList.includes(item)) {
      setShoppingList(prev => [...prev, item]);
    }
  };

  const removeFromShoppingList = (item: string) => {
    setShoppingList(prev => prev.filter(i => i !== item));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        onChangeView={setActiveView}
        selectedFilters={selectedFilters}
        onToggleFilter={handleToggleFilter}
        shoppingListCount={shoppingList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {activeView === 'home' && (
          <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {/* Header / Hero */}
            <header className="mb-10 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What's in your fridge?
              </h1>
              <p className="text-slate-400 mb-8 max-w-2xl">
                Upload a photo of your open fridge or pantry. Our AI will identify ingredients and curate the perfect recipes for you.
              </p>
              
              <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Fridge...
                    </>
                  ) : (
                    <>
                      <CameraIcon className="w-6 h-6" />
                      Snap & Cook
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Analysis Results */}
            {identifiedIngredients.length > 0 && (
              <section className="mb-12 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <span className="text-slate-500 text-sm uppercase tracking-wide font-semibold">Found Ingredients</span>
                    <div className="h-px bg-slate-700 flex-1"></div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {identifiedIngredients.map((ing, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm">
                      {ing}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Recipe Grid */}
            {recipes.length > 0 && (
               <section className="animate-fade-in-up">
                  <h2 className="text-2xl font-bold text-white mb-6">Suggested Recipes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onClick={setSelectedRecipe} 
                      />
                    ))}
                  </div>
               </section>
            )}

            {recipes.length === 0 && !loading && (
                <div className="text-center py-20 opacity-50">
                    <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <CameraIcon className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-slate-500">No recipes yet. Upload a photo to get started!</p>
                </div>
            )}
          </div>
        )}

        {activeView === 'shopping' && (
          <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-8">Shopping List</h1>
            {shoppingList.length === 0 ? (
                <div className="text-center py-10 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                    <p className="text-slate-400">Your shopping list is empty.</p>
                    <p className="text-slate-500 text-sm mt-2">Add missing ingredients directly from recipe steps.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {shoppingList.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 group hover:border-blue-500/50 transition-colors">
                            <span className="text-lg text-slate-200">{item}</span>
                            <button 
                                onClick={() => removeFromShoppingList(item)}
                                className="text-slate-500 hover:text-green-500 p-2"
                                title="Mark as bought"
                            >
                                <CheckIcon className="w-6 h-6" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}
      </main>

      {/* Cooking Mode Overlay */}
      {selectedRecipe && (
        <CookingMode 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
          onAddToShoppingList={addToShoppingList}
          shoppingList={shoppingList}
        />
      )}
    </div>
  );
}

export default App;
