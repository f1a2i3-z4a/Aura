import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Habit, GamificationStats, DailyVibe, SleepQuality, EnergyLevel, Mood } from '../types';
import Card from './shared/Card';
import { generateMotivationalMessage } from '../services/geminiService';
import { FlameIcon, StarIcon, TargetIcon, PlusIcon, MinusIcon, BadgeIcon, MoonIcon, ZapIcon, BatteryMediumIcon, BatteryLowIcon, SmileIcon, MehIcon, FrownIcon } from './shared/icons';
import Button from './shared/Button';
import { XP_PER_LEVEL } from '../constants';

interface DashboardProps {
  userProfile: UserProfile;
  habits: Habit[];
  stats: GamificationStats;
  onHabitToggle: (habitId: number, completed: boolean) => void;
  waterCount: number;
  onWaterChange: (newCount: number) => void;
  dailyVibe: DailyVibe | null;
  onVibeUpdate: (vibe: DailyVibe) => void;
}

const WaterTracker: React.FC<{count: number, onChange: (newCount: number) => void}> = ({ count, onChange }) => {
    const waterGoal = 8;
    return (
        <Card>
            <h3 className="font-semibold text-lg mb-4">Water Intake</h3>
            <div className="flex items-center justify-between">
                <p className="text-gray-300">Today's Goal: {waterGoal} glasses</p>
                <div className="flex items-center gap-3">
                    <button onClick={() => onChange(Math.max(0, count - 1))} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"><MinusIcon className="w-5 h-5"/></button>
                    <span className="text-2xl font-bold w-10 text-center">{count}</span>
                    <button onClick={() => onChange(count + 1)} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"><PlusIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                {[...Array(waterGoal)].map((_, i) => (
                    <div key={i} className={`h-3 flex-1 rounded-full ${i < count ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                ))}
            </div>
        </Card>
    )
}

const VibeCheckin: React.FC<{onVibeUpdate: (vibe: DailyVibe) => void}> = ({ onVibeUpdate }) => {
    const [sleep, setSleep] = useState<SleepQuality | null>(null);
    const [energy, setEnergy] = useState<EnergyLevel | null>(null);
    const [mood, setMood] = useState<Mood | null>(null);

    const handleSubmit = () => {
        if (sleep && energy && mood) {
            onVibeUpdate({ sleep, energy, mood });
        }
    }

    const vibeOptionClasses = (isSelected: boolean) => 
        `flex-1 p-3 rounded-lg font-medium transition-all text-center ${isSelected ? 'bg-indigo-600 text-white scale-105' : 'bg-gray-700 hover:bg-gray-600'}`;

    return (
        <Card>
            <h2 className="text-2xl font-semibold mb-1 text-center">Daily Vibe Check-in</h2>
            <p className="text-gray-400 text-center mb-6">How are you feeling today? Let's adapt your plan.</p>
            
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-3 text-lg flex items-center gap-2"><MoonIcon className="w-5 h-5 text-indigo-400" />How did you sleep?</h3>
                    <div className="flex gap-3">
                        <button onClick={() => setSleep(SleepQuality.POOR)} className={vibeOptionClasses(sleep === SleepQuality.POOR)}>Poor</button>
                        <button onClick={() => setSleep(SleepQuality.AVERAGE)} className={vibeOptionClasses(sleep === SleepQuality.AVERAGE)}>Average</button>
                        <button onClick={() => setSleep(SleepQuality.GOOD)} className={vibeOptionClasses(sleep === SleepQuality.GOOD)}>Good</button>
                    </div>
                </div>
                <div>
                     <h3 className="font-semibold mb-3 text-lg flex items-center gap-2"><ZapIcon className="w-5 h-5 text-yellow-400" />What's your energy level?</h3>
                     <div className="flex gap-3">
                        <button onClick={() => setEnergy(EnergyLevel.LOW)} className={vibeOptionClasses(energy === EnergyLevel.LOW)}>Low</button>
                        <button onClick={() => setEnergy(EnergyLevel.MEDIUM)} className={vibeOptionClasses(energy === EnergyLevel.MEDIUM)}>Medium</button>
                        <button onClick={() => setEnergy(EnergyLevel.HIGH)} className={vibeOptionClasses(energy === EnergyLevel.HIGH)}>High</button>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-3 text-lg flex items-center gap-2"><SmileIcon className="w-5 h-5 text-green-400" />What's your mood?</h3>
                    <div className="flex gap-3">
                        <button onClick={() => setMood(Mood.SAD)} className={vibeOptionClasses(mood === Mood.SAD)}>Sad</button>
                        <button onClick={() => setMood(Mood.NEUTRAL)} className={vibeOptionClasses(mood === Mood.NEUTRAL)}>Neutral</button>
                        <button onClick={() => setMood(Mood.HAPPY)} className={vibeOptionClasses(mood === Mood.HAPPY)}>Happy</button>
                    </div>
                </div>
            </div>
            
            {sleep && energy && mood && (
                <div className="mt-6 text-center">
                    <Button onClick={handleSubmit}>Confirm Today's Vibe</Button>
                </div>
            )}
        </Card>
    )
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, habits, stats, onHabitToggle, waterCount, onWaterChange, dailyVibe, onVibeUpdate }) => {
  const [motivation, setMotivation] = useState<string>('Your daily motivation will appear here. Let\'s get started!');
  const [isLoadingMotivation, setIsLoadingMotivation] = useState<boolean>(false);

  const fetchMotivation = useCallback(async () => {
    setIsLoadingMotivation(true);
    try {
        const message = await generateMotivationalMessage(stats, habits, dailyVibe);
        setMotivation(message);
    } catch (error) {
        console.error("Failed to fetch motivation:", error);
        setMotivation("Keep pushing forward! You've got this.");
    } finally {
        setIsLoadingMotivation(false);
    }
  }, [stats, habits, dailyVibe]);

  useEffect(() => {
    // Fetch motivation once vibe is set, or if it was already set on load
    if (dailyVibe) {
        fetchMotivation();
    }
  }, [dailyVibe, fetchMotivation]);

  const levelProgress = (stats.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Today's Focus: <span className="text-indigo-400">{userProfile.goal}</span></h1>
        <p className="text-gray-400 mt-1">Hello {userProfile.name}, let's make today count!</p>
      </div>
      
      {!dailyVibe && <VibeCheckin onVibeUpdate={onVibeUpdate} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center space-x-4">
            <StarIcon className="w-10 h-10 text-yellow-400" />
            <div>
                <p className="text-gray-400">Level</p>
                <p className="text-2xl font-bold">{stats.level}</p>
            </div>
        </Card>
        <Card className="flex items-center space-x-4">
            <FlameIcon className="w-10 h-10 text-orange-500" />
            <div>
                <p className="text-gray-400">Streak</p>
                <p className="text-2xl font-bold">{stats.streak} Days</p>
            </div>
        </Card>
        <Card className="flex items-center space-x-4">
            <TargetIcon className="w-10 h-10 text-green-400" />
            <div>
                <p className="text-gray-400">Total XP</p>
                <p className="text-2xl font-bold">{stats.xp}</p>
            </div>
        </Card>
      </div>
      
       <Card>
          <h3 className="font-semibold text-lg mb-2">Level Progress</h3>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-gray-400 mt-1">{stats.xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP to next level</p>
       </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WaterTracker count={waterCount} onChange={onWaterChange} />
          <Card>
              <h3 className="font-semibold text-lg mb-3">Achievements</h3>
              {stats.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                      {stats.badges.map(badge => (
                          <div key={badge} className="flex items-center gap-2 bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold">
                              <BadgeIcon className="w-4 h-4" />
                              <span>{badge}</span>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-gray-400">Complete habits and goals to earn badges!</p>
              )}
          </Card>
      </div>

      <Card>
        <h2 className="text-2xl font-semibold mb-4">Daily Habits & Workouts</h2>
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className={`flex items-center p-4 rounded-lg transition-colors ${habit.completed ? 'bg-green-900/50' : 'bg-gray-700'}`}>
              <input
                type="checkbox"
                id={`habit-${habit.id}`}
                checked={habit.completed}
                onChange={(e) => onHabitToggle(habit.id, e.target.checked)}
                className="w-6 h-6 rounded bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-600"
              />
              <label htmlFor={`habit-${habit.id}`} className={`ml-4 flex-1 text-lg ${habit.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                {habit.text}
              </label>
              <span className="font-bold text-yellow-400">+{habit.xp} XP</span>
            </div>
          ))}
        </div>
      </Card>
      
      {dailyVibe && (
        <Card>
          <h2 className="text-2xl font-semibold mb-3">Adaptive Coach</h2>
          {isLoadingMotivation ? (
              <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-3 py-1">
                      <div className="h-2 bg-gray-700 rounded"></div>
                      <div className="grid grid-cols-3 gap-4">
                          <div className="h-2 bg-gray-700 rounded col-span-2"></div>
                          <div className="h-2 bg-gray-700 rounded col-span-1"></div>
                      </div>
                      <div className="h-2 bg-gray-700 rounded"></div>
                  </div>
              </div>
          ) : (
              <p className="text-lg text-gray-300 italic">"{motivation}"</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
