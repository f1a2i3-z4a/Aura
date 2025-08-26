import React, { useState, useRef } from 'react';
import { UserProfile, StyleAdvice, Gender } from '../types';
import { generateStyleAdvice } from '../services/geminiService';
import Card from './shared/Card';
import Button from './shared/Button';
import { ShirtIcon } from './shared/icons';

interface StyleAdvisorProps {
  userProfile: UserProfile;
}

const AdviceCard: React.FC<{ title: string; text: string; imageUrl?: string }> = ({ title, text, imageUrl }) => (
    <div>
        <h3 className="text-xl font-semibold text-indigo-400 mb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
                <p className="text-gray-300 whitespace-pre-line">{text}</p>
            </div>
            {imageUrl ? (
                <img src={`data:image/jpeg;base64,${imageUrl}`} alt={title} className="rounded-lg object-cover w-full h-48 md:h-full" />
            ) : (
                <div className="bg-gray-700 w-full h-48 md:h-full rounded-lg animate-pulse"></div>
            )}
        </div>
    </div>
);

const StyleAdvisor: React.FC<StyleAdvisorProps> = ({ userProfile }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [advice, setAdvice] = useState<StyleAdvice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAdvice(null);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
  }

  const handleGetAdvice = async () => {
    if (!imageFile || !userProfile.goal) return;
    setIsLoading(true);
    setError(null);
    setAdvice(null);
    try {
        const base64Image = await fileToBase64(imageFile);
        const result = await generateStyleAdvice(base64Image, imageFile.type, userProfile.goal, userProfile.gender, userProfile.age);
        setAdvice(result);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const resetSelection = () => {
      setImagePreview(null);
      setImageFile(null);
      setAdvice(null);
      setError(null);
  }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">AI Style Advisor</h1>
            <p className="text-gray-400 mt-1">Get personalized fashion, hairstyle, and grooming tips with visual examples.</p>
        </div>

        <Card>
            <div className="flex flex-col items-center">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                />
                
                {imagePreview ? (
                     <div className="w-full flex flex-col items-center">
                        <img src={imagePreview} alt="User preview" className="max-h-80 w-auto rounded-lg shadow-lg mb-6" />
                        <div className="flex gap-4">
                            <Button onClick={resetSelection} variant="secondary">Change Photo</Button>
                            <Button onClick={handleGetAdvice} disabled={isLoading}>
                                {isLoading ? 'Analyzing...' : 'Get Style Advice'}
                            </Button>
                        </div>
                    </div>
                ) : (
                     <div className="w-full border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                        <ShirtIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <h3 className="mt-2 text-lg font-medium text-white">Upload a photo</h3>
                        <p className="mt-1 text-sm text-gray-400">For best results, use a full-body photo.</p>
                        <div className="flex justify-center items-center mt-4 gap-4 flex-wrap">
                            <Button onClick={() => fileInputRef.current?.click()}>
                                Select Image
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
        
        {error && (
            <Card className="border-red-500 bg-red-900/20 text-red-300">
                <h3 className="font-bold text-lg">Oops! Something went wrong.</h3>
                <p>{error}</p>
            </Card>
        )}
        
        {isLoading && !advice && (
            <Card className="animate-pulse space-y-6">
                 {[...Array(3)].map((_, i) => (
                    <div key={i}>
                        <div className="h-6 w-1/4 bg-gray-700 rounded mb-3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <div className="h-4 bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                            </div>
                            <div className="bg-gray-700 w-full h-48 md:h-full rounded-lg"></div>
                        </div>
                    </div>
                 ))}
            </Card>
        )}

        {advice && (
            <Card>
                <h2 className="text-2xl font-bold mb-4">Your Personalized Advice</h2>
                <div className="space-y-8">
                    <AdviceCard title="Dressing Style" text={advice.dressingStyle} imageUrl={advice.dressingStyleImage} />
                    <AdviceCard title="Hairstyle Suggestion" text={advice.hairstyle} imageUrl={advice.hairstyleImage} />
                    {advice.beardStyle && userProfile.gender === Gender.MALE && (
                        <AdviceCard title="Beard Style Suggestion" text={advice.beardStyle} imageUrl={advice.beardStyleImage} />
                    )}
                </div>
            </Card>
        )}
    </div>
  );
};

export default StyleAdvisor;