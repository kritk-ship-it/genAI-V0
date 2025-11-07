import React, { useState } from 'react';
import { IdeationWorkflow } from './components/IdeationWorkflow';
import { ResearchAssistant } from './components/ResearchAssistant';
import { ApiKeySelector } from './components/ApiKeySelector';

type Tab = 'ideation' | 'research';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ideation');
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));

  const handleKeySave = (key: string) => {
    if (key) {
      localStorage.setItem('gemini-api-key', key);
      setApiKey(key);
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey(null);
  };

  if (!apiKey) {
    return <ApiKeySelector onKeySelected={handleKeySave} />;
  }

  const header = (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-white">
            Gemini Visual Ideation Suite
          </h1>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('ideation')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'ideation'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Ideation Workflow
              </button>
              <button
                onClick={() => setActiveTab('research')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'research'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Research Assistant
              </button>
            </nav>
            <button
              onClick={clearApiKey}
              title="Change API Key"
              className="p-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-2l1-1 1-1-1.257-1.257A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {header}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'ideation' && <IdeationWorkflow apiKey={apiKey} clearApiKey={clearApiKey} />}
        {activeTab === 'research' && <ResearchAssistant apiKey={apiKey} clearApiKey={clearApiKey} />}
      </main>
    </div>
  );
};

export default App;
