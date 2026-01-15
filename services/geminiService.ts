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
    2. Suggest 4-5 creative and distinct recipes that can be made primarily with these ingredients.
    3. ${filterString}
    4. For each recipe, provide a 'imageDescription' (a vivid visual description of the final plated dish) and 'stepVisualDescriptions' (an array of visual descriptions for exactly what is happening in each step, matching the number of steps).
    
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
                  },
                  imageDescription: {
                    type: Type.STRING,
                    description: "A highly detailed, appetizing visual description of the final dish for image generation."
                  },
                  stepVisualDescriptions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A visual description of the action or state for each step (e.g., 'onions sautéing in a pan until golden'). Must have the same number of items as steps."
                  }
                },
                required: ["id", "title", "prepTime", "calories", "difficulty", "ingredients", "steps", "imageDescription", "stepVisualDescriptions"]
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

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
