import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { PlayIcon, PauseIcon } from './Icons';
import { GeneratedImage } from './GeneratedImage';

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

  // Fallback if stepVisualDescriptions is missing or mismatch
  const currentImagePrompt = recipe.stepVisualDescriptions?.[currentStep] 
    ? `Photorealistic cooking step: ${recipe.stepVisualDescriptions[currentStep]}`
    : `Photorealistic cooking step: ${recipe.steps[currentStep]}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 shrink-0">
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

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Ingredients Sidebar (Hidden on mobile by default usually, but we keep simpler logic here) */}
        <div className="hidden md:block md:w-64 lg:w-80 bg-slate-800/50 p-6 border-r border-slate-700 overflow-y-auto">
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

        {/* Main Cooking Area - Split View */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Image Area - Top 40% on mobile, Left 50% on Desktop ideally, but let's stack for simplicity in this flex col */}
            <div className="h-1/3 md:h-1/2 w-full bg-black relative shrink-0">
                 <GeneratedImage 
                    key={currentStep} // Force re-mount on step change to trigger new generation
                    prompt={currentImagePrompt}
                    alt={`Step ${currentStep + 1}`}
                    className="w-full h-full object-contain"
                 />
                 <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white font-mono border border-white/10">
                    Step {currentStep + 1} / {recipe.steps.length}
                 </div>
            </div>

            {/* Instruction Area */}
            <div className="flex-1 p-6 md:p-10 flex flex-col items-center bg-slate-900 overflow-y-auto">
                <div className="w-full max-w-3xl">
                     <div className="flex justify-end mb-4">
                        <button 
                            onClick={toggleSpeech}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                                isSpeaking 
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            {isSpeaking ? (
                                <>
                                    <PauseIcon className="w-4 h-4" /> Stop Audio
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="w-4 h-4" /> Read Step
                                </>
                            )}
                        </button>
                     </div>

                    <p className="text-xl md:text-3xl font-medium leading-relaxed text-white animate-fade-in text-center">
                        {recipe.steps[currentStep]}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="p-4 md:p-6 bg-slate-800 border-t border-slate-700 flex justify-between items-center shrink-0">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`px-4 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg flex items-center gap-2 ${
            currentStep === 0 
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
            : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden md:inline">Previous</span>
        </button>

        <div className="flex gap-1.5 md:gap-2 mx-4 overflow-x-auto max-w-[50%]">
            {recipe.steps.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-2 rounded-full transition-all duration-300 shrink-0 ${
                        idx === currentStep ? 'w-6 md:w-8 bg-blue-500' : 'w-2 bg-slate-600'
                    }`} 
                />
            ))}
        </div>

        {currentStep === recipe.steps.length - 1 ? (
             <button 
             onClick={onClose}
             className="px-4 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
           >
             Finish
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
             </svg>
           </button>
        ) : (
            <button 
            onClick={handleNext}
            className="px-4 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <span className="hidden md:inline">Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
