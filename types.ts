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
    // FIX: made uri and title optional to match the type from @google/genai SDK
    uri?: string;
    title?: string;
  };
}

// FIX: Define AIStudio type to be used for window.aistudio, resolving global type conflicts.
// FIX: Centralized the global declaration for `window.aistudio` to resolve type conflicts across the application.
// Inlining the type definition avoids potential module resolution issues and duplicate type errors.
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
