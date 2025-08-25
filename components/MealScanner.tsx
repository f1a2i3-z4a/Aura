import React, { useState, useRef } from 'react';
import { MealAnalysis, Macronutrients } from '../types';
import { analyzeImageForFoodNames } from '../services/geminiService';
import { getNutritionalInfo } from '../services/edamamService';
import Card from './shared/Card';
import Button from './shared/Button';
import { ScanLineIcon } from './shared/icons';

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

const MealScanner: React.FC = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
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
            setAnalysis(null);
            setError(null);
        }
    };

    const handleAnalyzeMeal = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            // Step 1: Get Base64 image and identify food names
            const base64Image = await fileToBase64(imageFile);
            const foodNames = await analyzeImageForFoodNames(base64Image, imageFile.type);
            
            if (foodNames.length === 0) {
                setError("Could not identify any food items in the image. Please try another photo.");
                setIsLoading(false);
                return;
            }

            // Step 2: Get nutritional info for each food item from our "Edamam" service
            const nutritionalPromises = foodNames.map(name => getNutritionalInfo(name));
            const foodItems = await Promise.all(nutritionalPromises);

            // Step 3: Aggregate the results
            let totalCalories = 0;
            const totalMacros: Macronutrients = { protein: '0g', carbs: '0g', fat: '0g' };
            let protein = 0, carbs = 0, fat = 0;

            foodItems.forEach(item => {
                totalCalories += parseFloat(item.calories) || 0;
                protein += parseFloat(item.macros.protein) || 0;
                carbs += parseFloat(item.macros.carbs) || 0;
                fat += parseFloat(item.macros.fat) || 0;
            });
            
            totalMacros.protein = `${protein.toFixed(1)}g`;
            totalMacros.carbs = `${carbs.toFixed(1)}g`;
            totalMacros.fat = `${fat.toFixed(1)}g`;

            setAnalysis({
                items: foodItems,
                totalCalories: `${totalCalories.toFixed(0)} kcal`,
                totalMacros,
            });

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">AI Meal Scanner</h1>
                <p className="text-gray-400 mt-1">Snap a photo of your meal to get an instant nutritional analysis.</p>
            </div>

            <Card>
                <div className="flex flex-col items-center">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    {!imagePreview && (
                        <div className="w-full border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                            <ScanLineIcon className="mx-auto h-12 w-12 text-gray-500" />
                            <h3 className="mt-2 text-lg font-medium text-white">Upload or take a photo</h3>
                            <p className="mt-1 text-sm text-gray-400">For best results, capture the entire meal clearly.</p>
                            <Button onClick={() => fileInputRef.current?.click()} className="mt-4">
                                Select Image
                            </Button>
                        </div>
                    )}

                    {imagePreview && (
                        <div className="w-full flex flex-col items-center">
                            <img src={imagePreview} alt="Meal preview" className="max-h-80 w-auto rounded-lg shadow-lg mb-6" />
                            <div className="flex gap-4">
                                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">Change Photo</Button>
                                <Button onClick={handleAnalyzeMeal} disabled={isLoading}>
                                    {isLoading ? 'Analyzing Meal...' : 'Analyze Meal'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {error && (
                <Card className="border-red-500 bg-red-900/20 text-red-300">
                    <h3 className="font-bold text-lg">Analysis Failed</h3>
                    <p>{error}</p>
                </Card>
            )}

            {isLoading && (
                <Card className="animate-pulse">
                    <div className="h-6 w-1/3 bg-gray-700 rounded mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                                <div className="h-5 w-2/5 bg-gray-700 rounded"></div>
                                <div className="h-5 w-1/5 bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                    <div className="h-8 w-1/2 bg-gray-700 rounded mt-6"></div>
                </Card>
            )}

            {analysis && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">Nutritional Analysis</h2>
                      <span className="text-xs font-semibold text-gray-400 bg-gray-700 px-3 py-1 rounded-full">Powered by Edamam</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-600">
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-gray-400">Food Item</th>
                                    <th className="p-3 text-sm font-semibold text-gray-400 text-right">Calories</th>
                                    <th className="p-3 text-sm font-semibold text-gray-400 text-right">Protein</th>
                                    <th className="p-3 text-sm font-semibold text-gray-400 text-right">Carbs</th>
                                    <th className="p-3 text-sm font-semibold text-gray-400 text-right">Fat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.items.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-700/50 last:border-0">
                                        <td className="p-3 font-medium text-white">{item.name}</td>
                                        <td className="p-3 text-right">{item.calories}</td>
                                        <td className="p-3 text-right">{item.macros.protein}</td>
                                        <td className="p-3 text-right">{item.macros.carbs}</td>
                                        <td className="p-3 text-right">{item.macros.fat}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-600 text-right">
                        <p className="text-gray-400">Total Estimated Calories</p>
                        <p className="text-3xl font-bold text-indigo-400">{analysis.totalCalories}</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default MealScanner;