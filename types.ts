
export interface Settings {
  background: string;
  useModel: boolean;
  modelInteraction: 'wearing' | 'holding' | 'posing';
  lighting: string;
  angle: string;
  watermark: string;
  watermarkPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  snsTarget: string;
}

export interface ProductImage {
  id: string;
  file: File;
  url: string; // Object URL for preview
}

export interface ProcessedImage {
  id: string;
  sourceId: string;
  url: string; // Base64 Data URL
}
