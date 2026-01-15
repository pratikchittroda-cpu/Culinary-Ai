export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  calories: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  steps: string[];
  dietaryTags: string[];
  imageDescription: string;
  stepVisualDescriptions: string[];
}

export interface AnalysisResult {
  identifiedIngredients: string[];
  recipes: Recipe[];
}

export type DietaryFilter = 'Vegetarian' | 'Vegan' | 'Keto' | 'Gluten-Free' | 'Paleo';

export interface ShoppingItem {
  name: string;
  checked: boolean;
}
