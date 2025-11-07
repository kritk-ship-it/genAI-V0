import React, { useState, useRef } from 'react';
import { generateInitialImage, editImage, generateVideo } from '../services/geminiService';
import { fileToImageData } from '../utils/fileUtils';
import { ImageData, IdeationStage, AspectRatio, LoadingState } from '../types';
import { Spinner } from './Spinner';

const StageIndicator: React.FC<{ currentStage: IdeationStage; stage: IdeationStage; title: string }> = ({ currentStage, stage, title }) => {
  const isActive = currentStage === stage;
  const isDone = (currentStage === 'EDIT' && stage === 'GENERATE') || (currentStage === 'VIDEO' && (stage === 'GENERATE' || stage === 'EDIT'));
  
  let bgColor = 'bg-gray-700';
  if (isActive) bgColor = 'bg-indigo-600';
  if (isDone) bgColor = 'bg-green-600';

  return (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${bgColor} transition-colors`}>
        {isDone ? '✓' : stage === 'GENERATE' ? '1' : stage === 'EDIT' ? '2' : '3'}
      </div>
      <span className={`ml-3 font-medium ${isActive || isDone ? 'text-white' : 'text-gray-400'}`}>{title}</span>
    </div>
  );
};

interface IdeationWorkflowProps {
  apiKey: string;
  clearApiKey: () => void;
}

export const IdeationWorkflow: React.FC<IdeationWorkflowProps> = ({ apiKey, clearApiKey }) => {
  const [stage, setStage] = useState<IdeationStage>('GENERATE');
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [loading, setLoading] = useState<LoadingState>({ active: false, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPromptRef = useRef<HTMLInputElement>(null);

  const handleError = (err: any) => {
    console.error(err);
    const message = err instanceof Error ? err.message : 'An unknown error occurred.';
    if (message.toLowerCase().includes("api key")) {
        setError("API Key not valid. Please enter a valid API key to continue.");
        clearApiKey();
    } else {
        setError(message);
    }
    setLoading({ active: false, message: '' });
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    setLoading({ active: true, message: 'Generating initial concept...' });
    try {
      const image = await generateInitialImage(apiKey, prompt);
      setCurrentImage(image);
      setStage('EDIT');
      setPrompt('');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading({ active: false, message: '' });
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim()) {
      setError("Please enter an edit instruction.");
      return;
    }
    if (!currentImage) return;
    setError(null);
    setLoading({ active: true, message: 'Applying edits...' });
    try {
      const editedImage = await editImage(apiKey, prompt, currentImage);
      setCurrentImage(editedImage);
      setPrompt('');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading({ active: false, message: '' });
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setLoading({ active: true, message: 'Uploading image...' });
      try {
        const imageData = await fileToImageData(file);
        setCurrentImage(imageData);
        setStage('EDIT');
      } catch (err) {
        handleError(err);
      } finally {
        setLoading({ active: false, message: '' });
      }
    }
  };

  const handleGenerateVideo = async () => {
    const videoPrompt = videoPromptRef.current?.value;
    if (!videoPrompt?.trim()) {
        setError("Please enter a prompt for the video.");
        return;
    }
    if (!currentImage) return;
    setError(null);
    setLoading({ active: true, message: 'Preparing video generation...' });
    setVideoUrl(null);

    try {
        const url = await generateVideo(apiKey, videoPrompt, currentImage, aspectRatio, (message) => {
            setLoading({ active: true, message });
        });
        setVideoUrl(url);
    } catch (err) {
        handleError(err);
    } finally {
        setLoading({ active: false, message: '' });
    }
  };
  
  const handleDownloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = `data:${currentImage.mimeType};base64,${currentImage.base64}`;
    link.download = `gemini-ideation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetWorkflow = () => {
    setStage('GENERATE');
    setCurrentImage(null);
    setPrompt('');
    setVideoUrl(null);
    setError(null);
    setLoading({ active: false, message: '' });
  };

  const renderContent = () => {
    if (loading.active) {
      return <div className="mt-8"><Spinner message={loading.message} /></div>;
    }

    if (videoUrl) {
      return (
        <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Video Generation Complete!</h2>
            <video src={videoUrl} controls className="max-w-full mx-auto rounded-lg shadow-lg" />
            <button onClick={resetWorkflow} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Start a New Project
            </button>
        </div>
      );
    }
    
    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col space-y-6">
          {stage === 'GENERATE' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">1. Generate Initial Image</h3>
              <p className="text-gray-400 mb-4">Describe the image you want to create, or upload your own to start.</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic city skyline at dusk, with flying cars"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                rows={3}
              />
              <div className="flex items-center space-x-4 mt-4">
                <button onClick={handleGenerate} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">Generate</button>
                <span className="text-gray-400">OR</span>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">Upload Image</button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              </div>
            </div>
          )}
          {stage === 'EDIT' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">2. Edit & Refine Image</h3>
              <p className="text-gray-400 mb-4">Use text to describe changes. The model will generate a new version.</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter, make the sky purple"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                rows={3}
              />
              <button onClick={handleEdit} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">Apply Edit</button>
              <button onClick={() => setStage('VIDEO')} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Finalize & Create Video
              </button>
            </div>
          )}
          {stage === 'VIDEO' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">3. Generate Video</h3>
                <>
                <p className="text-gray-400 mb-4">Describe the action or animation for your video.</p>
                <input
                    ref={videoPromptRef}
                    placeholder="e.g., The cars start to fly towards the camera"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                    >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    </select>
                </div>
                <button onClick={handleGenerateVideo} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors">Generate Video</button>
                <button onClick={() => setStage('EDIT')} className="mt-4 w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
                    Back to Editing
                </button>
              </>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg shadow-lg min-h-[400px]">
          {currentImage ? (
            <div className="w-full text-center">
              <img 
                  src={`data:${currentImage.mimeType};base64,${currentImage.base64}`} 
                  alt="Generated Content" 
                  className="max-w-full max-h-[450px] rounded-md mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsPreviewModalOpen(true)}
              />
              <div className="mt-4 flex justify-center space-x-4">
                  <button 
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center space-x-2"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <span>Preview</span>
                  </button>
                  <button
                      onClick={handleDownloadImage}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center space-x-2"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Download</span>
                  </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="mt-2">Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {isPreviewModalOpen && currentImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div 
            className="relative p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={`data:${currentImage.mimeType};base64,${currentImage.base64}`} 
              alt="Preview" 
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] rounded"
            />
            <button 
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-0 right-0 -mt-2 -mr-2 bg-gray-700 text-white rounded-full p-1.5 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close preview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-around items-center bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <StageIndicator currentStage={stage} stage="GENERATE" title="1. Create Concept" />
        <div className="flex-grow h-px bg-gray-600 mx-4"></div>
        <StageIndicator currentStage={stage} stage="EDIT" title="2. Refine Image" />
        <div className="flex-grow h-px bg-gray-600 mx-4"></div>
        <StageIndicator currentStage={stage} stage="VIDEO" title="3. Synthesize Video" />
      </div>
      {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-4 text-center">{error}</div>}
      {renderContent()}
    </div>
  );
};
