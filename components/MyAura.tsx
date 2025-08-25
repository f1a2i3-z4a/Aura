import React, { useRef, useState, useEffect } from 'react';
import { UserProfile, GamificationStats } from '../types';
import Card from './shared/Card';
import { FlameIcon, StarIcon, TargetIcon, BadgeIcon, UserIcon, CameraIcon } from './shared/icons';

interface MyAuraProps {
  userProfile: UserProfile;
  stats: GamificationStats;
  onProfilePictureChange: (base64Image: string) => void;
}

const DetailRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
        <p className="text-gray-400">{label}</p>
        <p className="font-semibold text-white">{value}</p>
    </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
        {icon}
        <div>
            <p className="text-gray-400">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

const WeightProgress: React.FC<{ current?: number, target?: number, goal: string }> = ({ current, target, goal }) => {
    // Start marker position slightly off-screen to animate in
    const [markerPosition, setMarkerPosition] = useState(-5);

    if (current === undefined || target === undefined) return null;

    // The "start" of the journey is the weight entered at signup, which is `current`.
    const startWeight = current;
    const endWeight = target;

    const totalJourney = Math.abs(startWeight - endWeight);
    
    // Since we don't track the *new* current weight after signup, the progress made is 0.
    // The user is at their starting weight.
    const progressMade = 0; 
    
    const progressPercentage = totalJourney > 0 
        ? (progressMade / totalJourney) * 100 
        : (startWeight === endWeight ? 100 : 0);

    useEffect(() => {
        // Animate the marker into its correct position on component mount
        const timer = setTimeout(() => {
            setMarkerPosition(progressPercentage);
        }, 300); // Short delay allows CSS transition to trigger
        return () => clearTimeout(timer);
    }, [progressPercentage]);
    
    return (
        <Card>
            <h2 className="text-2xl font-semibold mb-6 text-center">Your Weight Journey</h2>
            
            <div className="relative">
                {/* The full journey path */}
                <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full" style={{width: '100%'}}></div>
                </div>
                {/* Animated Marker for Current Weight */}
                <div 
                    className="absolute top-1/2 w-6 h-6 bg-white rounded-full border-4 border-indigo-400 shadow-lg"
                    style={{ 
                        left: `${Math.max(0, Math.min(100, markerPosition))}%`, 
                        transform: 'translate(-50%, -50%)',
                        transition: 'left 1.2s cubic-bezier(0.25, 1, 0.5, 1)' 
                    }}
                    aria-label={`Current weight marker at ${current}kg`}
                ></div>
            </div>
            
            <div className="flex justify-between text-sm font-bold mt-3 text-gray-300">
                <span>Start: {startWeight} kg</span>
                <span>Goal: {endWeight} kg</span>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-gray-700">
                 <p className="text-xl font-bold">{current} kg <span className="text-base font-normal text-gray-400">(Current Weight)</span></p>
                 <p className="text-indigo-400 font-semibold mt-1">
                    {current === target ? "You've reached your goal!" : `${Math.abs(current - target).toFixed(1)} kg to your goal!`}
                 </p>
            </div>
        </Card>
    );
};


const MyAura: React.FC<MyAuraProps> = ({ userProfile, stats, onProfilePictureChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onProfilePictureChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-6">
        <div className="relative">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            {userProfile.profilePicture ? (
                <img src={userProfile.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500" />
            ) : (
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600">
                    <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
            )}
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-full text-white hover:bg-indigo-500 transition"
                aria-label="Change profile picture"
            >
                <CameraIcon className="w-5 h-5" />
            </button>
        </div>
        <div>
            <h1 className="text-3xl font-bold">{userProfile.name}</h1>
            <p className="text-gray-400 mt-1">Your personal account and progress summary.</p>
        </div>
      </div>
      
      {userProfile.currentWeight !== undefined && userProfile.targetWeight !== undefined && <WeightProgress current={userProfile.currentWeight} target={userProfile.targetWeight} goal={userProfile.goal} />}

      <Card>
        <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Account Details</h2>
        <div className="space-y-2">
            <DetailRow label="Email" value={userProfile.email} />
            <DetailRow label="Age" value={userProfile.age} />
            <DetailRow label="Gender" value={userProfile.gender} />
            <DetailRow label="Primary Goal" value={userProfile.goal} />
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold mb-4">My Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard icon={<StarIcon className="w-10 h-10 text-yellow-400" />} label="Level" value={stats.level} />
            <StatCard icon={<TargetIcon className="w-10 h-10 text-green-400" />} label="Total XP" value={stats.xp} />
            <StatCard icon={<FlameIcon className="w-10 h-10 text-orange-500" />} label="Streak" value={`${stats.streak} Days`} />
        </div>

        <h3 className="font-semibold text-lg mb-3">My Achievements</h3>
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
            <p className="text-gray-400">Keep up your habits to earn your first badge!</p>
        )}
      </Card>
    </div>
  );
};

export default MyAura;