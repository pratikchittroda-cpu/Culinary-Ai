import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { PlayIcon, PauseIcon } from './Icons';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
  onAddToShoppingList: (ingredient: string) => void;
  shoppingList: string[];
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose, onAddToShoppingList, shoppingList }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Setup TTS
  const speakStep = (text: string) => {
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleNext = () => {
    stopSpeaking();
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakStep(recipe.steps[currentStep]);
    }
  };

  const isIngredientInList = (name: string) => shoppingList.some(item => item === name);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
        <h2 className="text-lg font-bold truncate pr-4 text-white">{recipe.title}</h2>
        <button 
          onClick={onClose}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
        {/* Ingredients Sidebar (Collapsible on mobile maybe, but kept visible for now) */}
        <div className="w-full md:w-1/4 bg-slate-800/50 p-6 border-r border-slate-700">
          <h3 className="text-slate-400 font-semibold mb-4 uppercase text-sm tracking-wider">Ingredients</h3>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex justify-between items-center group">
                <span className="text-slate-300 text-sm">{ing.amount} {ing.name}</span>
                <button 
                  onClick={() => onAddToShoppingList(ing.name)}
                  disabled={isIngredientInList(ing.name)}
                  className={`p-1.5 rounded transition-colors ${
                    isIngredientInList(ing.name) 
                      ? 'bg-green-500/20 text-green-400 cursor-default' 
                      : 'bg-slate-700 text-slate-400 hover:bg-blue-600 hover:text-white'
                  }`}
                  title={isIngredientInList(ing.name) ? "In list" : "Add to shopping list"}
                >
                    {isIngredientInList(ing.name) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Step Content */}
        <div className="flex-1 p-6 md:p-12 flex flex-col justify-center items-center">
            <div className="w-full max-w-3xl">
                <div className="mb-8 flex justify-between items-center">
                    <span className="text-blue-400 font-mono text-xl">Step {currentStep + 1} of {recipe.steps.length}</span>
                    <button 
                        onClick={toggleSpeech}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                            isSpeaking 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        {isSpeaking ? (
                            <>
                                <PauseIcon className="w-6 h-6" /> Stop
                            </>
                        ) : (
                            <>
                                <PlayIcon className="w-6 h-6" /> Read Aloud
                            </>
                        )}
                    </button>
                </div>
                
                <div className="min-h-[200px] flex items-center">
                    <p className="text-3xl md:text-5xl font-medium leading-tight text-white animate-fade-in">
                        {recipe.steps[currentStep]}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="p-6 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 ${
            currentStep === 0 
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
            : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Previous
        </button>

        <div className="flex gap-2">
            {recipe.steps.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-600'
                    }`} 
                />
            ))}
        </div>

        {currentStep === recipe.steps.length - 1 ? (
             <button 
             onClick={onClose}
             className="px-8 py-4 rounded-xl font-bold text-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
           >
             Finish
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
             </svg>
           </button>
        ) : (
            <button 
            onClick={handleNext}
            className="px-8 py-4 rounded-xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
