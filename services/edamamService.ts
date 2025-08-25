import { GoogleGenAI, Type } from "@google/genai";
import { AnalyzedFoodItem, Macronutrients } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const macronutrientSchema = {
    type: Type.OBJECT,
    properties: {
        protein: { type: Type.STRING, description: "Grams of protein, e.g., '30g'" },
        carbs: { type: Type.STRING, description: "Grams of carbohydrates, e.g., '50g'" },
        fat: { type: Type.STRING, description: "Grams of fat, e.g., '15g'" },
    },
    required: ["protein", "carbs", "fat"],
};

const analyzedFoodItemSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Name of the food item." },
        calories: { type: Type.STRING, description: "Estimated calories for a standard serving size, e.g. '150 kcal'" },
        macros: macronutrientSchema,
    },
    required: ["name", "calories", "macros"],
};

/**
 * Simulates calling the Edamam API to get nutritional info for a single food item.
 * This uses Gemini with a strict schema to act as our trusted nutritional database.
 */
export const getNutritionalInfo = async (foodName: string): Promise<AnalyzedFoodItem> => {
    try {
        const prompt = `Provide the nutritional information (calories, protein, carbs, fat) for a standard serving size of "${foodName}". If you are unsure, provide your best estimate. The name in the response should be the same as the food name provided.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analyzedFoodItemSchema,
            },
        });

        const jsonText = response.text.trim();
        const item = JSON.parse(jsonText) as AnalyzedFoodItem;
        // Ensure the name matches the query, as the model might change it
        item.name = foodName.charAt(0).toUpperCase() + foodName.slice(1);
        return item;

    } catch (error) {
        console.error(`Error fetching nutritional info for ${foodName}:`, error);
        // Return a fallback object on error to avoid breaking the entire analysis
        return {
            name: foodName.charAt(0).toUpperCase() + foodName.slice(1),
            calories: 'N/A',
            macros: { protein: 'N/A', carbs: 'N/A', fat: 'N/A' },
        };
    }
};