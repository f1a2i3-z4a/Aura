import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppView, UserProfile, Habit, GamificationStats, UserData, DailyVibe, ChatMessage } from './types';
import { XP_PER_LEVEL } from './constants';
import Dashboard from './components/Dashboard';
import DietPlanner from './components/DietPlanner';
import WorkoutPlanner from './components/WorkoutPlanner';
import StyleAdvisor from './components/StyleAdvisor';
import MyAura from './components/MyAura';
import Auth from './components/auth/Auth';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import MealScanner from './components/MealScanner';
import ChatAgent from './components/ChatAgent';
import { ClipboardListIcon, UtensilsCrossedIcon, ShirtIcon, BoltIcon, LogOutIcon, UserIcon, ScanLineIcon, MessageSquareIcon } from './components/shared/icons';

// A type for the structure that holds all users' data
interface AllUsers {
  [email: string]: UserData;
}

const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

const App: React.FC = () => {
    const [view, setView] = useState<AppView>(AppView.AUTH);
    const [allUsers, setAllUsers] = useStickyState<AllUsers>({}, 'aura-users');
    const [currentUserEmail, setCurrentUserEmail] = useStickyState<string | null>(null, 'aura-currentUserEmail');

    const currentUserData: UserData | null = useMemo(() => {
        if (currentUserEmail && allUsers[currentUserEmail]) {
            return allUsers[currentUserEmail];
        }
        return null;
    }, [currentUserEmail, allUsers]);

    // Data migration for older user accounts
    useEffect(() => {
        if (currentUserEmail && allUsers[currentUserEmail]) {
            let needsUpdate = false;
            const updatedUserData = { ...allUsers[currentUserEmail] };
            if (updatedUserData.dailyVibe === undefined) {
                updatedUserData.dailyVibe = null;
                needsUpdate = true;
            }
            if (updatedUserData.chatHistory === undefined) {
                updatedUserData.chatHistory = [];
                needsUpdate = true;
            }
            if (needsUpdate) {
                console.log(`Migrating user ${currentUserEmail}, adding missing properties.`);
                setAllUsers(prev => ({ ...prev, [currentUserEmail]: updatedUserData }));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserEmail, allUsers]);

    useEffect(() => {
        if (currentUserData) {
            if (view === AppView.AUTH || view === AppView.SIGN_IN || view === AppView.SIGN_UP) {
                setView(AppView.DASHBOARD);
            }
            
            const today = new Date().toISOString().split('T')[0];
            if (currentUserData.lastDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                const updatedUserData = { ...currentUserData };
                
                const allCompletedYesterday = updatedUserData.habits.every(h => h.completed);
                if (updatedUserData.lastDate === yesterdayStr && !allCompletedYesterday) {
                    updatedUserData.stats.streak = 0;
                } else if (updatedUserData.lastDate !== yesterdayStr) {
                    updatedUserData.stats.streak = 0;
                }
                
                updatedUserData.habits = updatedUserData.habits.map(h => ({ ...h, completed: false }));
                updatedUserData.waterCount = 0;
                updatedUserData.dailyVibe = null; // Reset vibe for the new day
                updatedUserData.lastDate = today;

                setAllUsers(prev => ({...prev, [currentUserEmail!]: updatedUserData}));
            }
        } else {
            setView(AppView.AUTH);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserEmail]);

    const updateCurrentUser = (dataUpdater: (currentUserData: UserData) => UserData) => {
        if (!currentUserEmail) return;
        setAllUsers(prev => {
            const updatedUserData = dataUpdater(prev[currentUserEmail]);
            return {...prev, [currentUserEmail]: updatedUserData };
        });
    };

    const awardBadges = (stats: GamificationStats, habits: Habit[]): GamificationStats => {
        const awardedBadges = new Set(stats.badges);
        if (stats.streak >= 3 && !awardedBadges.has('3-Day Streak 🔥')) awardedBadges.add('3-Day Streak 🔥');
        if (stats.streak >= 7 && !awardedBadges.has('7-Day Streak 🔥🔥')) awardedBadges.add('7-Day Streak 🔥🔥');
        if (stats.level >= 5 && !awardedBadges.has('Level 5 ⭐')) awardedBadges.add('Level 5 ⭐');
        if (stats.level >= 10 && !awardedBadges.has('Level 10 ⭐⭐')) awardedBadges.add('Level 10 ⭐⭐');
        if (habits.every(h => h.completed) && !awardedBadges.has('Perfectionist ✅')) awardedBadges.add('Perfectionist ✅');
        return { ...stats, badges: Array.from(awardedBadges) };
    }

    const handleHabitToggle = useCallback((habitId: number, completed: boolean) => {
        updateCurrentUser(data => {
            let xpChange = 0;
            const updatedHabits = data.habits.map(habit => {
                if (habit.id === habitId) {
                    xpChange = completed ? habit.xp : -habit.xp;
                    return { ...habit, completed };
                }
                return habit;
            });

            const newXp = Math.max(0, data.stats.xp + xpChange);
            const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
            
            const allCompletedBefore = data.habits.every(h => h.completed);
            const allCompletedAfter = updatedHabits.every(h => h.completed);
            let newStreak = data.stats.streak;
            
            if (allCompletedAfter && !allCompletedBefore) {
                newStreak += 1;
            } else if (!allCompletedAfter && allCompletedBefore) {
                newStreak = Math.max(0, newStreak -1);
            }

            let newStats: GamificationStats = { ...data.stats, xp: newXp, level: newLevel, streak: newStreak };
            newStats = awardBadges(newStats, updatedHabits);

            return { ...data, habits: updatedHabits, stats: newStats };
        });
    }, [updateCurrentUser]);
    
    const handleWaterChange = (newCount: number) => {
        updateCurrentUser(data => ({ ...data, waterCount: newCount }));
    }

    const handleProfilePictureChange = (base64Image: string) => {
        updateCurrentUser(data => ({
            ...data,
            profile: {
                ...data.profile,
                profilePicture: base64Image
            }
        }));
    };
    
    const handleVibeUpdate = (vibe: DailyVibe) => {
        updateCurrentUser(data => ({...data, dailyVibe: vibe }));
    }

    const handleChatUpdate = (newHistory: ChatMessage[]) => {
        updateCurrentUser(data => ({ ...data, chatHistory: newHistory }));
    }

    const handleSignOut = () => {
        setCurrentUserEmail(null);
        setView(AppView.AUTH);
    };

    const renderView = () => {
        if (!currentUserData) {
            switch (view) {
                case AppView.SIGN_IN: return <SignIn setView={setView} setAllUsers={setAllUsers} setCurrentUserEmail={setCurrentUserEmail} />;
                case AppView.SIGN_UP: return <SignUp setView={setView} setAllUsers={setAllUsers} setCurrentUserEmail={setCurrentUserEmail} />;
                default: return <Auth setView={setView} />;
            }
        }

        switch (view) {
            case AppView.DASHBOARD:
                return <Dashboard userProfile={currentUserData.profile} habits={currentUserData.habits} stats={currentUserData.stats} onHabitToggle={handleHabitToggle} waterCount={currentUserData.waterCount} onWaterChange={handleWaterChange} dailyVibe={currentUserData.dailyVibe} onVibeUpdate={handleVibeUpdate} />;
            case AppView.DIET_PLANNER:
                return <DietPlanner userProfile={currentUserData.profile} dailyVibe={currentUserData.dailyVibe} />;
            case AppView.WORKOUT_PLANNER:
                return <WorkoutPlanner userProfile={currentUserData.profile} dailyVibe={currentUserData.dailyVibe} />;
            case AppView.STYLE_ADVISOR:
                return <StyleAdvisor userProfile={currentUserData.profile} />;
            case AppView.MEAL_SCANNER:
                return <MealScanner />;
            case AppView.MY_AURA:
                return <MyAura userProfile={currentUserData.profile} stats={currentUserData.stats} onProfilePictureChange={handleProfilePictureChange} />;
            case AppView.CHAT_AGENT:
                return <ChatAgent userProfile={currentUserData.profile} chatHistory={currentUserData.chatHistory} onChatUpdate={handleChatUpdate} />;
            default:
                return <Dashboard userProfile={currentUserData.profile} habits={currentUserData.habits} stats={currentUserData.stats} onHabitToggle={handleHabitToggle} waterCount={currentUserData.waterCount} onWaterChange={handleWaterChange} dailyVibe={currentUserData.dailyVibe} onVibeUpdate={handleVibeUpdate} />;
        }
    };
    
    if (!currentUserData) {
        return (
            <div className="min-h-screen bg-slate-900 text-white relative">
                 <div className="absolute top-0 left-0 -z-10 h-full w-full bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                {renderView()}
            </div>
        );
    }

    const navItems = [
        { id: AppView.DASHBOARD, label: "Tracker", icon: ClipboardListIcon },
        { id: AppView.CHAT_AGENT, label: "Chat", icon: MessageSquareIcon },
        { id: AppView.DIET_PLANNER, label: "Diet AI", icon: UtensilsCrossedIcon },
        { id: AppView.WORKOUT_PLANNER, label: "Workout AI", icon: BoltIcon },
        { id: AppView.MEAL_SCANNER, label: "Meal Scan", icon: ScanLineIcon },
        { id: AppView.STYLE_ADVISOR, label: "Style AI", icon: ShirtIcon },
        { id: AppView.MY_AURA, label: "My Aura", icon: UserIcon },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <div className="absolute top-0 left-0 -z-10 h-full w-full bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            
            <header className="p-4 bg-slate-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Aura</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-right">
                           <span className="text-gray-400">Lvl:</span> {currentUserData.stats.level}
                        </div>
                        <div className="w-24 h-2 bg-gray-700 rounded-full">
                            <div className="h-2 bg-indigo-500 rounded-full" style={{width: `${(currentUserData.stats.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100}%`}}></div>
                        </div>
                         <button onClick={handleSignOut} className="text-gray-400 hover:text-white" aria-label="Sign Out">
                            <LogOutIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    {renderView()}
                </div>
            </main>

            <nav className="bg-slate-900/50 backdrop-blur-sm border-t border-gray-700/50 p-2 sticky bottom-0 z-10">
                <div className="max-w-5xl mx-auto flex justify-around">
                    {navItems.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => setView(item.id)}
                            className={`flex flex-col items-center justify-center w-14 py-2 rounded-lg transition-colors ${view === item.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            <item.icon className="w-6 h-6 mb-1"/>
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default App;