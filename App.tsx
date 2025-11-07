import React, { useState } from 'react';
import { IdeationWorkflow } from './components/IdeationWorkflow';
import { ResearchAssistant } from './components/ResearchAssistant';

type Tab = 'ideation' | 'research';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('ideation');

  const header = (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-white">
            Gemini Visual Ideation Suite
          </h1>
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
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {header}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'ideation' && <IdeationWorkflow />}
        {activeTab === 'research' && <ResearchAssistant />}
      </main>
    </div>
  );
};

export default App;