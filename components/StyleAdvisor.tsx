import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, StyleAdvice, Gender } from '../types';
import { generateStyleAdvice } from '../services/geminiService';
import Card from './shared/Card';
import Button from './shared/Button';
import { ShirtIcon, CameraIcon } from './shared/icons';

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
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Cleanup stream on component unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please ensure you have granted permission.");
    }
  };

  const handleCloseCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsCameraOpen(false);
  };

  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        const file = dataURLtoFile(dataUrl, 'capture.jpg');
        if (file) {
          setImageFile(file);
        }
      }
      handleCloseCamera();
    }
  };


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
      handleCloseCamera();
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
                
                {isCameraOpen ? (
                    <div className="w-full flex flex-col items-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full max-h-80 rounded-lg mb-4 bg-gray-900" />
                        <div className="flex gap-4">
                            <Button onClick={handleCloseCamera} variant="secondary">Cancel</Button>
                            <Button onClick={handleTakePhoto}>Take Photo</Button>
                        </div>
                    </div>
                ) : imagePreview ? (
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
                        <p className="mt-1 text-sm text-gray-400">For best results, use a full-body photo or use your camera.</p>
                        <div className="flex justify-center items-center mt-4 gap-4 flex-wrap">
                            <Button onClick={() => fileInputRef.current?.click()}>
                                Select Image
                            </Button>
                            <Button onClick={handleOpenCamera} variant="secondary" className="flex items-center gap-2">
                                <CameraIcon className="w-5 h-5" /> Use Camera
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