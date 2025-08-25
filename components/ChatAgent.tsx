import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { continueChat } from '../services/geminiService';
import Card from './shared/Card';
import Button from './shared/Button';

interface ChatAgentProps {
  userProfile: UserProfile;
  chatHistory: ChatMessage[];
  onChatUpdate: (newHistory: ChatMessage[]) => void;
}

const ChatAgent: React.FC<ChatAgentProps> = ({ userProfile, chatHistory, onChatUpdate }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', content: input };
    const updatedHistory = [...chatHistory, newUserMessage];
    onChatUpdate(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const modelResponse = await continueChat(userProfile, updatedHistory, input);
      const newModelMessage: ChatMessage = { role: 'model', content: modelResponse };
      onChatUpdate([...updatedHistory, newModelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
      onChatUpdate([...updatedHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Chat with Aura</h1>
        <p className="text-gray-400 mt-1">Your personal AI coach is here to help. Ask anything!</p>
      </div>

      <div className="flex-grow bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 overflow-y-auto mb-4">
        <div className="space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center text-gray-400 p-8">
              <p>No messages yet. Start the conversation!</p>
              <p className="text-sm mt-2">e.g., "What's a good high-protein snack?" or "I feel unmotivated today."</p>
            </div>
          )}
          {chatHistory.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-md p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Aura anything..."
          className="flex-grow bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
};

export default ChatAgent;