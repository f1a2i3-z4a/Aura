import React, { useState } from 'react';
import { DietPlan, UserProfile, Meal, DailyVibe } from '../types';
import { generateDietPlan } from '../services/geminiService';
import Card from './shared/Card';
import Button from './shared/Button';
import { UtensilsCrossedIcon } from './shared/icons';

interface DietPlannerProps {
  userProfile: UserProfile;
  dailyVibe: DailyVibe | null;
}

const MacroPill: React.FC<{label: string, value: string}> = ({ label, value }) => (
    <div className="text-xs font-medium text-center">
        <p className="text-gray-400">{label}</p>
        <p className="font-bold text-white">{value}</p>
    </div>
);


const MealCard: React.FC<{ title: string; meal: Meal }> = ({ title, meal }) => (
    <Card className="bg-gray-800/50 flex flex-col p-0 overflow-hidden">
        {meal.image ? (
            <img src={`data:image/jpeg;base64,${meal.image}`} alt={meal.name} className="w-full h-48 object-cover" />
        ) : (
            <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                <UtensilsCrossedIcon className="w-12 h-12 text-gray-500" />
            </div>
        )}
        <div className="p-6 flex-grow flex flex-col">
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-indigo-400 mb-2">{title}</h3>
                <h4 className="text-lg font-semibold text-white">{meal.name}</h4>
                <p className="text-gray-400 mt-1 mb-4 text-sm">{meal.description}</p>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-700/50 flex justify-between items-center">
                 <div className="text-sm font-medium text-yellow-400 bg-yellow-900/50 inline-block px-3 py-1 rounded-full">
                    {meal.calories}
                </div>
                <div className="flex gap-4">
                    <MacroPill label="Protein" value={meal.macros.protein} />
                    <MacroPill label="Carbs" value={meal.macros.carbs} />
                    <MacroPill label="Fat" value={meal.macros.fat} />
                </div>
            </div>
        </div>
    </Card>
);

const DietPlanner: React.FC<DietPlannerProps> = ({ userProfile, dailyVibe }) => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    if (!userProfile.goal) return;

    setIsLoading(true);
    setError(null);
    setDietPlan(null);

    try {
      const plan = await generateDietPlan(userProfile.goal, userProfile.gender, userProfile.age, userProfile.currentWeight, userProfile.targetWeight, dailyVibe);
      setDietPlan(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Diet Planner</h1>
        <p className="text-gray-400 mt-1">Generate a sample one-day meal plan with full nutritional info for your goal of <span className="font-semibold text-indigo-400">{userProfile.goal}</span>.</p>
        {dailyVibe && <p className="text-gray-400 mt-1">Your plan will be adapted to your <span className="font-semibold text-indigo-400">daily vibe</span>.</p>}
      </div>

      <Card className="text-center">
        <p className="text-lg mb-4">Ready to see what a day of professional-level nutrition looks like?</p>
        <Button onClick={handleGeneratePlan} disabled={isLoading}>
          {isLoading ? 'Crafting Your Plan...' : 'Generate My Diet Plan'}
        </Button>
      </Card>
      
      {error && (
        <Card className="border-red-500 bg-red-900/20 text-red-300">
            <h3 className="font-bold text-lg">Oops! Something went wrong.</h3>
            <p>{error}</p>
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-0 overflow-hidden">
                    <div className="h-48 w-full bg-gray-700"></div>
                    <div className="p-6">
                        <div className="h-6 w-1/3 bg-gray-700 rounded mb-4"></div>
                        <div className="h-5 w-2/3 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-full bg-gray-700 rounded mb-3"></div>
                        <div className="h-4 w-full bg-gray-700 rounded"></div>
                        <div className="h-6 w-1/4 bg-gray-700 rounded mt-4"></div>
                    </div>
                </Card>
            ))}
        </div>
      )}

      {dietPlan && (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Your Personalized 1-Day Plan</h2>
            <Card className="mb-6 bg-indigo-900/30">
                <h3 className="text-xl font-semibold text-center mb-4">Daily Totals</h3>
                <div className="flex justify-around items-center">
                    <div>
                        <p className="text-indigo-300 text-sm">Total Calories</p>
                        <p className="text-2xl font-bold text-white">{dietPlan.totalCalories}</p>
                    </div>
                     <div className="flex gap-6">
                        <MacroPill label="Protein" value={dietPlan.totalMacros.protein} />
                        <MacroPill label="Carbs" value={dietPlan.totalMacros.carbs} />
                        <MacroPill label="Fat" value={dietPlan.totalMacros.fat} />
                    </div>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MealCard title="Breakfast" meal={dietPlan.breakfast} />
                <MealCard title="Lunch" meal={dietPlan.lunch} />
                <MealCard title="Dinner" meal={dietPlan.dinner} />
                <MealCard title="Snack" meal={dietPlan.snack} />
            </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanner;
