
import React, { useState, useEffect, useCallback } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const keyStatus = await window.aistudio.hasSelectedApiKey();
      setHasKey(keyStatus);
      if(keyStatus) {
        onKeySelected();
      }
    } else {
        // Mock aistudio for local development if it doesn't exist
        console.warn("window.aistudio not found. Assuming API key is selected for development.");
        setHasKey(true);
        onKeySelected();
    }
  }, [onKeySelected]);
  
  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race condition and re-enable UI
      setHasKey(true);
      onKeySelected();
    }
  };

  if (hasKey === null) {
    return <div className="text-center p-4">Checking API key status...</div>;
  }

  if (hasKey) {
    return null; // Key is selected, render nothing.
  }

  return (
    <div className="p-6 bg-yellow-900/30 border border-yellow-600 rounded-lg text-center">
      <h3 className="text-xl font-semibold text-yellow-300 mb-2">Action Required: Select Your API Key</h3>
      <p className="mb-4 text-yellow-200">
        This application requires a Google AI API key to function. The Veo model for video generation also requires that your associated project has billing enabled.
      </p>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleSelectKey}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded transition-colors"
        >
          Select API Key
        </button>
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-300 hover:text-yellow-200 underline"
        >
          Billing Information
        </a>
      </div>
    </div>
  );
};
