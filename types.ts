export interface ImageData {
  base64: string;
  mimeType: string;
}

export type IdeationStage = 'GENERATE' | 'EDIT' | 'VIDEO';

export type AspectRatio = '16:9' | '9:16';

export interface LoadingState {
  active: boolean;
  message: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

// FIX: Define AIStudio type to be used for window.aistudio, resolving global type conflicts.
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// FIX: Centralized the global declaration for `window.aistudio` to resolve type conflicts across the application.
declare global {
  interface Window {
    aistudio: AIStudio;
  }
}
