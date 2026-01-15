import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DietaryFilter } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFridgeAndGetRecipes = async (
  base64Image: string,
  filters: DietaryFilter[]
): Promise<AnalysisResult> => {
  const filterString = filters.length > 0 
    ? `Strictly adhere to these dietary restrictions: ${filters.join(", ")}.` 
    : "Provide a variety of dietary options.";

  const prompt = `
    Analyze this image of a fridge/pantry. 
    1. Identify the visible ingredients.
    2. Suggest 4-5 creative and distinct recipes that can be made primarily with these ingredients (assume basic pantry staples like oil, salt, pepper, flour are available).
    3. ${filterString}
    
    Return the result in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of ingredients found in the image"
            },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  prepTime: { type: Type.STRING, description: "e.g. '30 mins'" },
                  calories: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING }
                      },
                      required: ["name", "amount"]
                    }
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Step by step cooking instructions"
                  },
                  dietaryTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["id", "title", "prepTime", "calories", "difficulty", "ingredients", "steps"]
              }
            }
          },
          required: ["identifiedIngredients", "recipes"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response from Gemini");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
