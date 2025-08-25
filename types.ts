export enum Goal {
  WEIGHT_LOSS = "Weight Loss",
  WEIGHT_GAIN = "Weight Gain",
  BUILD_MUSCLE = "Build Muscle",
  CORE_STRENGTH = "Core Strength",
  STAMINA = "Stamina",
  IMPROVE_FLEXIBILITY = "Improve Flexibility",
  MAINTAIN_WEIGHT = "Maintain Weight",
  EAT_HEALTHIER = "Eat Healthier",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  PREFER_NOT_TO_SAY = "Prefer not to say",
}

export interface UserProfile {
  email: string;
  name: string;
  age: number;
  goal: Goal;
  gender: Gender;
  currentWeight?: number;
  targetWeight?: number;
  profilePicture?: string; // base64 string
}

export interface Habit {
  id: number;
  text: string;
  xp: number;
  completed: boolean;
  category: Goal;
}

export interface GamificationStats {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
}

export interface Macronutrients {
  protein: string;
  carbs: string;
  fat: string;
}

export interface Meal {
  name: string;
  description: string;
  calories: string;
  macros: Macronutrients;
  image?: string; // base64 string for an example image
}

export interface DietPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
  totalCalories: string;
  totalMacros: Macronutrients;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  description: string;
}

export interface WorkoutPlan {
  title: string;
  focus: string;
  exercises: Exercise[];
}

export interface StyleAdvice {
  dressingStyle: string;
  hairstyle: string;
  beardStyle?: string;
  dressingStyleImage?: string; // base64 string
  hairstyleImage?: string; // base64 string
  beardStyleImage?: string; // base64 string
}

export enum AppView {
  AUTH = "AUTH",
  SIGN_IN = "SIGN_IN",
  SIGN_UP = "SIGN_UP",
  DASHBOARD = "DASHBOARD",
  DIET_PLANNER = "DIET_PLANNER",
  WORKOUT_PLANNER = "WORKOUT_PLANNER",
  STYLE_ADVISOR = "STYLE_ADVISOR",
  MY_AURA = "MY_AURA",
  MEAL_SCANNER = "MEAL_SCANNER",
  CHAT_AGENT = "CHAT_AGENT",
}

export enum SleepQuality {
  POOR = "Poor",
  AVERAGE = "Average",
  GOOD = "Good",
}

export enum EnergyLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum Mood {
  SAD = "Sad",
  NEUTRAL = "Neutral",
  HAPPY = "Happy",
}

export interface DailyVibe {
  sleep: SleepQuality;
  energy: EnergyLevel;
  mood: Mood;
}

export interface AnalyzedFoodItem {
  name: string;
  calories: string;
  macros: Macronutrients;
}

export interface MealAnalysis {
  items: AnalyzedFoodItem[];
  totalCalories: string;
  totalMacros: Macronutrients;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface UserData {
  profile: UserProfile;
  password: string; // Added to verify on sign-in
  habits: Habit[];
  stats: GamificationStats;
  waterCount: number;
  lastDate: string | null;
  dailyVibe: DailyVibe | null;
  chatHistory: ChatMessage[];
}