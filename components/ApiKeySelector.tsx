import React, { useState } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: (key: string) => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    onKeySelected(apiKey.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md mx-auto p-8 bg-gray-800 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-white mb-2">
          Gemini Visual Ideation Suite
        </h2>
        <p className="text-center text-gray-400 mb-6">
          Please enter your Google AI API key to continue.
        </p>
        <div className="space-y-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Enter your API key"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Save and Continue
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          Your API key is stored only in your browser's local storage.
          <br />
          <a
            href="https://ai.google.dev/gemini-api/docs/api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            Get an API Key
          </a>
        </p>
      </div>
    </div>
  );
};
