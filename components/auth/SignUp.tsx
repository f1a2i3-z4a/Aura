import React, { useState } from 'react';
import { AppView, Goal, Gender, UserData } from '../../types';
import { INITIAL_HABITS } from '../../constants';
import Card from '../shared/Card';
import Button from '../shared/Button';

interface SignUpProps {
  setView: (view: AppView) => void;
  setCurrentUserEmail: (email: string | null) => void;
  setAllUsers: React.Dispatch<React.SetStateAction<{ [email: string]: UserData }>>;
}

const goals = Object.values(Goal);
const genders = Object.values(Gender);
const weightRelatedGoals = [Goal.WEIGHT_LOSS, Goal.WEIGHT_GAIN, Goal.BUILD_MUSCLE];


const SignUp: React.FC<SignUpProps> = ({ setView, setCurrentUserEmail, setAllUsers }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | ''>('');
  const [targetWeight, setTargetWeight] = useState<number | ''>('');

  const handleNext = () => {
    setError('');
    if (step === 1) {
        if (!name || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (!email.endsWith('@gmail.com')) {
            setError('Please use a valid @gmail.com address.');
            return;
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 6 characters and include letters, numbers, and a special symbol (e.g., @, $, !).');
            return;
        }
        const allUsers = JSON.parse(localStorage.getItem('aura-users') || '{}');
        if (allUsers[email]) {
            setError('An account with this email already exists.');
            return;
        }
    }
    if (step === 2 && (!age || !selectedGender)) {
        setError('Please provide your age and gender.');
        return;
    }
     if (step === 3 && !selectedGoal) {
        setError('Please select a primary goal.');
        return;
    }
    
    if (step === 3 && selectedGoal && !weightRelatedGoals.includes(selectedGoal)) {
        handleFinish();
        return;
    }

    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleFinish = () => {
    if (step === 4 && (!currentWeight || !targetWeight)) {
        setError('Please enter your current and target weights.');
        return;
    }

    const newUser: UserData = {
      profile: {
        email, name, age: Number(age), gender: selectedGender!, goal: selectedGoal!,
        currentWeight: currentWeight ? Number(currentWeight) : undefined,
        targetWeight: targetWeight ? Number(targetWeight) : undefined,
      },
      password: password,
      habits: INITIAL_HABITS.filter(h => h.category === selectedGoal),
      stats: { xp: 0, level: 1, streak: 0, badges: [] },
      waterCount: 0,
      lastDate: new Date().toISOString().split('T')[0],
      dailyVibe: null,
      chatHistory: [],
    };
    
    setAllUsers(prev => ({...prev, [email]: newUser }));
    setCurrentUserEmail(email);
    setView(AppView.DASHBOARD);
  };

  const isWeightGoal = selectedGoal && weightRelatedGoals.includes(selectedGoal);
  const totalSteps = isWeightGoal ? 4 : 3;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Create Your Account</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="mt-1 w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" className="mt-1 w-full input-style" />
              <p className="text-xs text-gray-400 mt-1">Only @gmail.com addresses are allowed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full input-style" />
              <p className="text-xs text-gray-400 mt-1">Must include letters, numbers, and a special character (e.g. @, $, !).</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-semibold text-center mb-4">Tell Us About Yourself</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')} placeholder="Enter your age" className="w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {genders.map(g => (
                  <button key={g} onClick={() => setSelectedGender(g)} className={`p-3 rounded-lg font-medium transition-all ${selectedGender === g ? 'btn-selected' : 'btn-unselected'}`}>{g}</button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-semibold text-center mb-4">What's Your Primary Goal?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {goals.map(g => (
                <button key={g} onClick={() => setSelectedGoal(g)} className={`p-3 rounded-lg text-sm text-center font-medium transition-all ${selectedGoal === g ? 'btn-selected' : 'btn-unselected'}`}>{g}</button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
            <div>
                <h2 className="text-2xl font-semibold text-center mb-4">Track Your Progress</h2>
                <p className="text-center text-gray-400 mb-6">Providing this helps us tailor your plan more accurately.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current Weight (kg)</label>
                        <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value ? parseFloat(e.target.value) : '')} placeholder="e.g., 80" className="w-full input-style" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Weight (kg)</label>
                        <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value ? parseFloat(e.target.value) : '')} placeholder="e.g., 70" className="w-full input-style" />
                    </div>
                </div>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
       <style>{`
            .input-style { background-color: #374151; border: 1px solid #4B5563; color: white; border-radius: 0.5rem; padding: 0.75rem; }
            .input-style:focus { outline: none; ring: 2px; border-color: #6366F1; }
            .btn-selected { background-color: #4F46E5; color: white; transform: scale(1.05); }
            .btn-unselected { background-color: #374151; color: #D1D5DB; }
            .btn-unselected:hover { background-color: #4B5563; }
       `}</style>
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Join Aura
        </h1>
      </div>
      <Card className="w-full max-w-2xl">
        <div className="mb-4">
            <div className="h-2 w-full bg-gray-700 rounded-full">
                <div className="h-2 bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%`}}></div>
            </div>
        </div>

        <div className="min-h-[300px] py-4">
            {renderStep()}
        </div>
        
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <div className="flex justify-between items-center mt-4">
          {step > 1 ? (
            <Button onClick={handleBack} variant="secondary">Back</Button>
          ) : (
            <Button onClick={() => setView(AppView.AUTH)} variant="secondary">Cancel</Button>
          )}

          {step < totalSteps ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleFinish}>Finish Setup</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SignUp;