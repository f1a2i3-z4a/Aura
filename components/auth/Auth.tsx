import React from 'react';
import { AppView } from '../../types';
import Card from '../shared/Card';
import Button from '../shared/Button';

interface AuthProps {
  setView: (view: AppView) => void;
}

const Auth: React.FC<AuthProps> = ({ setView }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 mb-2">
          Welcome to Aura
        </h1>
        <p className="text-xl text-gray-400">Your Personal AI Lifestyle Coach</p>
      </div>
      <Card className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-semibold mb-6">Get Started</h2>
        <div className="space-y-4">
          <Button onClick={() => setView(AppView.SIGN_IN)} className="w-full text-lg">
            Sign In
          </Button>
          <Button onClick={() => setView(AppView.SIGN_UP)} variant="secondary" className="w-full text-lg">
            Create Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
