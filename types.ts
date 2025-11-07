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
    uri?: string;
    title?: string;
  };
}
