
import React, { useState } from 'react';
import { getGroundedAnswer } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { Spinner } from './Spinner';
import { ApiKeySelector } from './ApiKeySelector';

export const ResearchAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<{ text: string, sources: GroundingChunk[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await getGroundedAnswer(prompt);
      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (message.includes("Requested entity was not found")) {
          setError("API Key error. Please re-select your API key.");
          setApiKeySelected(false);
      } else {
          setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiKeySelected) {
    return (
        <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
            {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-4 text-center">{error}</div>}
            <ApiKeySelector onKeySelected={() => { setApiKeySelected(true); setError(null); }} />
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-center text-indigo-400">Research Assistant</h2>
      <p className="text-center text-gray-400 mb-6">Get up-to-date information to inspire your creative prompts, powered by Google Search.</p>
      
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g., What are trending visual styles for sci-fi art?"
          className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Ask'}
        </button>
      </div>

      {isLoading && <div className="mt-6"><Spinner message="Finding the latest information..." /></div>}
      {error && <div className="mt-6 bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">{error}</div>}
      
      {result && (
        <div className="mt-8">
          <div className="prose prose-invert prose-lg max-w-none bg-gray-900/50 p-6 rounded-lg">
            <p>{result.text}</p>
          </div>

          {result.sources.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Sources:</h3>
              <ul className="list-disc list-inside space-y-1">
                {/* FIX: Add check for source.web.uri to prevent rendering links with no href. */}
                {result.sources.map((source, index) => source.web && source.web.uri && (
                  <li key={index}>
                    <a
                      href={source.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};