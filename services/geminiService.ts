
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { DietPlan, StyleAdvice, WorkoutPlan, Goal, Gender, GamificationStats, Habit, DailyVibe, UserProfile, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for Gemini API
const macronutrientSchema = {
    type: Type.OBJECT,
    properties: {
        protein: { type: Type.STRING, description: "Grams of protein, e.g., '30g'" },
        carbs: { type: Type.STRING, description: "Grams of carbohydrates, e.g., '50g'" },
        fat: { type: Type.STRING, description: "Grams of fat, e.g., '15g'" },
    },
    required: ["protein", "carbs", "fat"],
};

const mealSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        calories: { type: Type.STRING, description: "e.g., '450 kcal'" },
        macros: macronutrientSchema,
    },
    required: ["name", "description", "calories", "macros"],
};

const dietPlanSchema = {
    type: Type.OBJECT,
    properties: {
        breakfast: mealSchema,
        lunch: mealSchema,
        dinner: mealSchema,
        snack: mealSchema,
        totalCalories: { type: Type.STRING, description: "e.g., '2000 kcal'" },
        totalMacros: macronutrientSchema,
    },
    required: ["breakfast", "lunch", "dinner", "snack", "totalCalories", "totalMacros"],
};

const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        sets: { type: Type.STRING },
        reps: { type: Type.STRING },
        rest: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["name", "sets", "reps", "rest", "description"],
};

const workoutPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        focus: { type: Type.STRING },
        exercises: {
            type: Type.ARRAY,
            items: exerciseSchema,
        },
    },
    required: ["title", "focus", "exercises"],
};

const styleAdviceSchema = {
    type: Type.OBJECT,
    properties: {
        dressingStyle: { type: Type.STRING },
        hairstyle: { type: Type.STRING },
        beardStyle: { type: Type.STRING, description: "Provide this only for males. If not applicable, omit this field." },
    },
    required: ["dressingStyle", "hairstyle"],
};

const foodListSchema = {
    type: Type.OBJECT,
    properties: {
        foods: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
    },
    required: ["foods"],
};

const generateImageForPrompt = async (prompt: string): Promise<string | undefined> => {
    try {
        console.log(`Generating image for prompt: "${prompt}"`);
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
    } catch (error) {
        console.error("Error generating image:", error);
    }
    return undefined;
};


export const generateDietPlan = async (goal: Goal, gender: Gender, age: number, currentWeight?: number, targetWeight?: number, vibe?: DailyVibe | null): Promise<DietPlan> => {
  try {
    let prompt = `Generate a one-day sample diet plan for a ${age}-year-old ${gender} whose goal is ${goal}.`;
    if (currentWeight && targetWeight) {
        prompt += ` Their current weight is ${currentWeight}kg and their target weight is ${targetWeight}kg.`;
    }
    if (vibe) {
        prompt += ` Today, their sleep was ${vibe.sleep}, energy is ${vibe.energy}, and mood is ${vibe.mood}. Tailor the suggestions slightly to this vibe. For example, if energy is low, suggest a more energizing snack or a comfort-but-healthy meal.`
    }
    prompt += ` Include a delicious and healthy breakfast, lunch, dinner, and a snack. For each meal and for the total day, provide estimated calories and macronutrient breakdown (protein, carbs, fat).`;
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dietPlanSchema
      },
    });

    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as DietPlan;

    // Generate images for each meal concurrently
    const mealImagePromises = [
        generateImageForPrompt(`A delicious plate of ${plan.breakfast.name}, ${plan.breakfast.description}, food photography style.`),
        generateImageForPrompt(`A delicious plate of ${plan.lunch.name}, ${plan.lunch.description}, food photography style.`),
        generateImageForPrompt(`A delicious plate of ${plan.dinner.name}, ${plan.dinner.description}, food photography style.`),
        generateImageForPrompt(`A delicious plate of ${plan.snack.name}, ${plan.snack.description}, food photography style.`),
    ];

    const [breakfastImg, lunchImg, dinnerImg, snackImg] = await Promise.all(mealImagePromises);
    
    plan.breakfast.image = breakfastImg;
    plan.lunch.image = lunchImg;
    plan.dinner.image = dinnerImg;
    plan.snack.image = snackImg;

    return plan;
  } catch (error) {
    console.error("Error generating diet plan:", error);
    throw new Error("Failed to generate diet plan. Please try again.");
  }
};

export const generateWorkoutPlan = async (goal: Goal, gender: Gender, age: number, currentWeight?: number, targetWeight?: number, vibe?: DailyVibe | null): Promise<WorkoutPlan> => {
    try {
        let prompt = `Create a single-day workout routine for a ${age}-year-old ${gender} focused on ${goal}.`;
        if (currentWeight && targetWeight) {
            prompt += ` Their current weight is ${currentWeight}kg and their target weight is ${targetWeight}kg.`;
        }
        if (vibe) {
            prompt += ` Today, their sleep was ${vibe.sleep}, energy is ${vibe.energy}, and mood is ${vibe.mood}. Adapt the workout's intensity and add a motivational tip based on this vibe. For example, if energy is low, suggest reducing sets or focusing on form. If energy is high, suggest pushing for an extra rep.`
        }
        prompt += ` The plan should be appropriate for their age. It should include a title, the main focus, and a list of 5-7 exercises. For each exercise, specify the name, number of sets, number of reps, rest time, and a brief description or tip.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutPlanSchema
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as WorkoutPlan;
    } catch (error) {
        console.error("Error generating workout plan:", error);
        throw new Error("Failed to generate workout plan. Please try again.");
    }
};

export const generateStyleAdvice = async (base64Image: string, mimeType: string, goal: Goal, gender: Gender, age: number): Promise<StyleAdvice> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType,
            },
        };
        const textPart = {
            text: `I am a ${age}-year-old ${gender} with a health goal of ${goal}. Based on the attached photo, analyze my body type and face shape. Provide personalized suggestions for: 1. Dressing styles and outfits that would be flattering. 2. A suitable hairstyle. 3. (If male) A suitable beard style. Keep the suggestions concise and actionable.`
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: styleAdviceSchema
            },
        });

        const jsonText = response.text.trim();
        const advice = JSON.parse(jsonText) as StyleAdvice;

        // Generate images for advice concurrently
        const imagePromises = [
            generateImageForPrompt(`A fashion photo of a ${gender} model wearing this style: ${advice.dressingStyle}`),
            generateImageForPrompt(`A photo of a ${gender} person with this hairstyle: ${advice.hairstyle}`),
            (gender === Gender.MALE && advice.beardStyle) 
                ? generateImageForPrompt(`A photo of a male person with this beard style: ${advice.beardStyle}`)
                : Promise.resolve(undefined)
        ];
        
        const [dressingImg, hairImg, beardImg] = await Promise.all(imagePromises);

        advice.dressingStyleImage = dressingImg;
        advice.hairstyleImage = hairImg;
        advice.beardStyleImage = beardImg;
        
        return advice;
    } catch (error) {
        console.error("Error generating style advice:", error);
        throw new Error("Failed to generate style advice. Please try again.");
    }
};

export const generateMotivationalMessage = async (stats: GamificationStats, habits: Habit[], vibe?: DailyVibe | null): Promise<string> => {
    try {
        const completedCount = habits.filter(h => h.completed).length;
        const totalCount = habits.length;

        let prompt = `A user is on their health journey. Here are their current stats:
        - Level: ${stats.level}
        - XP: ${stats.xp}
        - Current Streak: ${stats.streak} days
        - Habits completed today: ${completedCount} out of ${totalCount}.`;
        
        if (vibe) {
            prompt += `
        Today, they are feeling:
        - Sleep Quality: ${vibe.sleep}
        - Energy Level: ${vibe.energy}
        - Mood: ${vibe.mood}`;
        }
        
        prompt += `
        
        Write a short, encouraging, and adaptive message for them. Take their vibe into account.
        - If they completed all habits, congratulate them enthusiastically and mention their streak.
        - If they completed most but not all, praise their effort and gently encourage them for tomorrow.
        - If they completed few or no habits, be supportive and motivational, reminding them that every day is a new start, without being discouraging.
        - If their vibe is low (poor sleep, low energy), be extra supportive and gentle.
        - If their vibe is high, be more energetic and challenging.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating motivational message:", error);
        return "Keep up the great work! Every step counts on your journey to a better you.";
    }
};

export const analyzeImageForFoodNames = async (base64Image: string, mimeType: string): Promise<string[]> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType,
            },
        };
        const textPart = {
            text: "Analyze the food items in this image. List all the distinct food items you can identify. For example: 'chicken breast', 'broccoli florets', 'white rice'."
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: foodListSchema
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as { foods: string[] };
        return result.foods;

    } catch (error) {
        console.error("Error identifying food in image:", error);
        throw new Error("Failed to identify food from the image. Please try a clearer picture.");
    }
};

export const continueChat = async (userProfile: UserProfile, history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const chat: Chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are Aura, a personal AI lifestyle coach. You are friendly, supportive, and highly knowledgeable about fitness, nutrition, and well-being.
                You are talking to ${userProfile.name}, a ${userProfile.age}-year-old ${userProfile.gender}. Their primary goal is "${userProfile.goal}".
                Use this information to provide personalized, empathetic, and motivational advice. Keep your responses concise, conversational, and helpful.`,
            },
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }))
        });

        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Error continuing chat:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
};
