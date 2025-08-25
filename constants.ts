import { Goal, Habit } from './types';

export const XP_PER_LEVEL = 100;

export const INITIAL_HABITS: Habit[] = [
  // Weight Loss
  { id: 1, text: "30 minutes of cardio (running, cycling)", xp: 20, completed: false, category: Goal.WEIGHT_LOSS },
  { id: 2, text: "Drink 8 glasses of water", xp: 10, completed: false, category: Goal.WEIGHT_LOSS },
  { id: 3, text: "Avoid sugary drinks and snacks", xp: 15, completed: false, category: Goal.WEIGHT_LOSS },
  { id: 4, text: "Full body HIIT workout", xp: 25, completed: false, category: Goal.WEIGHT_LOSS },
  { id: 5, text: "Eat a high-protein breakfast", xp: 10, completed: false, category: Goal.WEIGHT_LOSS },

  // Weight Gain
  { id: 6, text: "Strength training session (e.g., lifting weights)", xp: 25, completed: false, category: Goal.WEIGHT_GAIN },
  { id: 7, text: "Eat 3 high-calorie, nutrient-dense meals", xp: 20, completed: false, category: Goal.WEIGHT_GAIN },
  { id: 8, text: "Consume a protein shake post-workout", xp: 15, completed: false, category: Goal.WEIGHT_GAIN },
  { id: 9, text: "Get at least 8 hours of sleep for muscle recovery", xp: 10, completed: false, category: Goal.WEIGHT_GAIN },
  { id: 10, text: "Add healthy fats to your diet (avocado, nuts)", xp: 10, completed: false, category: Goal.WEIGHT_GAIN },
  
  // Core Strength
  { id: 11, text: "Complete a 15-minute core workout (planks, crunches)", xp: 20, completed: false, category: Goal.CORE_STRENGTH },
  { id: 12, text: "Practice yoga or Pilates for 30 minutes", xp: 20, completed: false, category: Goal.CORE_STRENGTH },
  { id: 13, text: "Maintain good posture throughout the day", xp: 10, completed: false, category: Goal.CORE_STRENGTH },
  { id: 14, text: "Perform compound exercises (squats, deadlifts)", xp: 25, completed: false, category: Goal.CORE_STRENGTH },
  { id: 15, text: "Engage your core during all exercises", xp: 10, completed: false, category: Goal.CORE_STRENGTH },

  // Stamina
  { id: 16, text: "Long-distance run or swim (at least 45 minutes)", xp: 30, completed: false, category: Goal.STAMINA },
  { id: 17, text: "Incorporate interval training into your workout", xp: 25, completed: false, category: Goal.STAMINA },
  { id: 18, text: "Stay hydrated before, during, and after exercise", xp: 10, completed: false, category: Goal.STAMINA },
  { id: 19, text: "Practice deep breathing exercises for 5 minutes", xp: 5, completed: false, category: Goal.STAMINA },
  { id: 20, text: "Focus on complex carbs for sustained energy", xp: 15, completed: false, category: Goal.STAMINA },

  // Build Muscle
  { id: 21, text: "Progressive overload strength training", xp: 30, completed: false, category: Goal.BUILD_MUSCLE },
  { id: 22, text: "Hit your daily protein target (e.g., 1.6g/kg)", xp: 20, completed: false, category: Goal.BUILD_MUSCLE },
  { id: 23, text: "Eat a slight calorie surplus", xp: 15, completed: false, category: Goal.BUILD_MUSCLE },
  { id: 24, text: "Prioritize sleep for muscle repair (7-9 hours)", xp: 10, completed: false, category: Goal.BUILD_MUSCLE },
  { id: 25, text: "Stay hydrated to support muscle function", xp: 5, completed: false, category: Goal.BUILD_MUSCLE },

  // Improve Flexibility
  { id: 26, text: "Perform 15 minutes of dynamic stretching", xp: 20, completed: false, category: Goal.IMPROVE_FLEXIBILITY },
  { id: 27, text: "Hold static stretches for 30+ seconds post-workout", xp: 15, completed: false, category: Goal.IMPROVE_FLEXIBILITY },
  { id: 28, text: "Attend a yoga or mobility class", xp: 25, completed: false, category: Goal.IMPROVE_FLEXIBILITY },
  { id: 29, text: "Use a foam roller on tight muscles", xp: 10, completed: false, category: Goal.IMPROVE_FLEXIBILITY },
  { id: 30, text: "Take short stretch breaks during your workday", xp: 10, completed: false, category: Goal.IMPROVE_FLEXIBILITY },

  // Maintain Weight
  { id: 31, text: "Eat a balanced diet with whole foods", xp: 20, completed: false, category: Goal.MAINTAIN_WEIGHT },
  { id: 32, text: "Engage in 30 minutes of moderate activity", xp: 20, completed: false, category: Goal.MAINTAIN_WEIGHT },
  { id: 33, text: "Practice mindful eating, listen to hunger cues", xp: 15, completed: false, category: Goal.MAINTAIN_WEIGHT },
  { id: 34, text: "Monitor weight weekly to stay on track", xp: 5, completed: false, category: Goal.MAINTAIN_WEIGHT },
  { id: 35, text: "Limit processed foods and added sugars", xp: 15, completed: false, category: Goal.MAINTAIN_WEIGHT },

  // Eat Healthier
  { id: 36, text: "Eat 5 servings of fruits and vegetables", xp: 20, completed: false, category: Goal.EAT_HEALTHIER },
  { id: 37, text: "Choose whole grains over refined grains", xp: 15, completed: false, category: Goal.EAT_HEALTHIER },
  { id: 38, text: "Cook a meal at home instead of eating out", xp: 20, completed: false, category: Goal.EAT_HEALTHIER },
  { id: 39, text: "Read nutrition labels when shopping", xp: 10, completed: false, category: Goal.EAT_HEALTHIER },
  { id: 40, text: "Replace a sugary drink with water", xp: 15, completed: false, category: Goal.EAT_HEALTHIER },
];
