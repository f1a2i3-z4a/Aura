import React, { useState } from 'react';
import { WorkoutPlan, UserProfile, Exercise, DailyVibe } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import Card from './shared/Card';
import Button from './shared/Button';
import { DumbbellIcon } from './shared/icons';

interface WorkoutPlannerProps {
  userProfile: UserProfile;
  dailyVibe: DailyVibe | null;
}

const ExerciseCard: React.FC<{ exercise: Exercise, index: number }> = ({ exercise, index }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-indigo-400">{index + 1}. {exercise.name}</h4>
            <div className="flex gap-4 text-sm text-center">
                <div>
                    <p className="text-gray-400">Sets</p>
                    <p className="font-bold text-white">{exercise.sets}</p>
                </div>
                <div>
                    <p className="text-gray-400">Reps</p>
                    <p className="font-bold text-white">{exercise.reps}</p>
                </div>
                <div>
                    <p className="text-gray-400">Rest</p>
                    <p className="font-bold text-white">{exercise.rest}</p>
                </div>
            </div>
        </div>
        <p className="text-gray-400 mt-2 text-sm">{exercise.description}</p>
    </div>
);


const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ userProfile, dailyVibe }) => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    if (!userProfile.goal) return;

    setIsLoading(true);
    setError(null);
    setWorkoutPlan(null);

    try {
      const plan = await generateWorkoutPlan(userProfile.goal, userProfile.gender, userProfile.age, userProfile.currentWeight, userProfile.targetWeight, dailyVibe);
      setWorkoutPlan(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Workout Planner</h1>
        <p className="text-gray-400 mt-1">Generate a workout session tailored to your goal of <span className="font-semibold text-indigo-400">{userProfile.goal}</span>.</p>
        {dailyVibe && <p className="text-gray-400 mt-1">Your plan will be adapted to your <span className="font-semibold text-indigo-400">daily vibe</span>.</p>}
      </div>

      <Card className="text-center">
        <p className="text-lg mb-4">Ready for your next challenge? Let's build a workout!</p>
        <Button onClick={handleGeneratePlan} disabled={isLoading}>
          {isLoading ? 'Building Your Workout...' : 'Generate My Workout'}
        </Button>
      </Card>
      
      {error && (
        <Card className="border-red-500 bg-red-900/20 text-red-300">
            <h3 className="font-bold text-lg">Oops! Something went wrong.</h3>
            <p>{error}</p>
        </Card>
      )}

      {isLoading && (
        <Card className="animate-pulse space-y-4">
             <div className="h-8 w-1/2 bg-gray-700 rounded mx-auto mb-6"></div>
             {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div className="h-6 w-1/3 bg-gray-700 rounded"></div>
                        <div className="h-6 w-1/4 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-700 rounded mt-3"></div>
                </div>
             ))}
        </Card>
      )}

      {workoutPlan && (
        <Card>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{workoutPlan.title}</h2>
                <p className="text-indigo-400 font-semibold">{workoutPlan.focus}</p>
            </div>
            <div className="space-y-4">
                {workoutPlan.exercises.map((ex, index) => (
                    <ExerciseCard key={index} exercise={ex} index={index} />
                ))}
            </div>
        </Card>
      )}
    </div>
  );
};

export default WorkoutPlanner;
