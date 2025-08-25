import React, { useState } from 'react';
import { AppView, UserData } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';

interface SignInProps {
  setView: (view: AppView) => void;
  setCurrentUserEmail: (email: string | null) => void;
  setAllUsers: React.Dispatch<React.SetStateAction<{ [email: string]: UserData }>>;
}

const SignIn: React.FC<SignInProps> = ({ setView, setCurrentUserEmail }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const allUsers = JSON.parse(localStorage.getItem('aura-users') || '{}');
    const userData = allUsers[email];

    if (userData && userData.password === password) {
      setCurrentUserEmail(email);
      setView(AppView.DASHBOARD);
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Welcome Back
        </h1>
      </div>
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full text-lg">
            Sign In
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <button onClick={() => setView(AppView.SIGN_UP)} className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign up
          </button>
        </p>
      </Card>
    </div>
  );
};

export default SignIn;