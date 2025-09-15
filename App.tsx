import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImageUploader } from './components/ImageUploader';
import { PreviewArea } from './components/PreviewArea';
import { Header } from './components/Header';
import type { Settings, ProductImage, ProcessedImage } from './types';
import { generateProductImage, editProductImage } from './services/geminiService';
import { BACKGROUND_OPTIONS, LIGHTING_OPTIONS, ANGLE_OPTIONS, SNS_OPTIONS } from './constants';
import { applyPostProcessing } from './utils/imageUtils';

const getApiErrorMessage = (error: any): string => {
  const defaultMessage = `이미지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`;

  if (!error.message) {
    return defaultMessage;
  }
  
  if (error.message.includes("API_KEY 환경 변수가 설정되지 않았습니다")) {
    return "애플리케이션에 API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.";
  }

  try {
    // Attempt to parse the error message which might be a JSON string
    const errorJson = JSON.parse(error.message);
    const apiError = errorJson.error;

    if (apiError) {
      if (apiError.code === 429 || apiError.status === "RESOURCE_EXHAUSTED") {
        return "API 무료 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요. 문제가 계속되면 Google AI Studio에서 결제 계정을 연결하여 제한을 늘릴 수 있습니다.";
      }
      if (apiError.code === 400 && apiError.message.includes("API key not valid")) {
         return "설정된 API 키가 유효하지 않습니다. 관리자에게 문의해주세요.";
      }
      return `API 오류: ${apiError.message} (코드: ${apiError.code})`;
    }
  } catch (e) {
    // Not a JSON message, return the original message if it's a simple string
     if (typeof error.message === 'string' && !error.message.startsWith('{')) {
        return `오류: ${error.message}`;
    }
  }
  
  return defaultMessage;
};


export default function App() {
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [settings, setSettings] = useState<Settings>({
    background: BACKGROUND_OPTIONS[0].value,
    useModel: false,
    modelInteraction: 'wearing',
    lighting: LIGHTING_OPTIONS[2].value,
    angle: ANGLE_OPTIONS[0].value,
    watermark: '',
    watermarkPosition: 'bottom-right',
    snsTarget: SNS_OPTIONS[0].value,
  });
  const [modelImage, setModelImage] = useState<ProductImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  const handleFilesAdded = (files: File[]) => {
    const newImages: ProductImage[] = files.map(file => ({
      id: `${file.name}-${Date.now()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setProductImages(prev => [...prev, ...newImages]);
    if (!activeImageId && newImages.length > 0) {
      setActiveImageId(newImages[0].id);
    }
  };
  
  const handleModelImageUpload = (file: File) => {
    if (modelImage) {
        URL.revokeObjectURL(modelImage.url);
    }
    setModelImage({
        id: `model-${file.name}-${Date.now()}`,
        file,
        url: URL.createObjectURL(file),
    });
  };

  const handleRemoveModelImage = () => {
    if (modelImage) {
        URL.revokeObjectURL(modelImage.url);
    }
    setModelImage(null);
  };

  const activeImage = productImages.find(img => img.id === activeImageId);
  const activeProcessedImage = processedImages.find(img => img.sourceId === activeImageId);

  useEffect(() => {
    if (activeProcessedImage) {
      setIsLoading(true);
      applyPostProcessing(activeProcessedImage.url, settings)
        .then(setFinalImageUrl)
        .catch(err => {
          console.error("Failed to post-process for preview:", err);
          setError("미리보기에 후처리 효과를 적용하지 못했습니다.");
          setFinalImageUrl(activeProcessedImage.url); // Fallback to unprocessed image
        }).finally(() => setIsLoading(false));
    } else {
      setFinalImageUrl(null);
    }
  }, [activeProcessedImage, settings]);


  const handleGenerate = useCallback(async () => {
    if (!activeImage) return;

    setIsLoading(true);
    setError(null);
    try {
      const resultBase64 = await generateProductImage(activeImage.file, settings, modelImage?.file || null);
      const newProcessedImage: ProcessedImage = {
        id: `processed-${activeImage.id}-${Date.now()}`,
        sourceId: activeImage.id,
        url: `data:image/png;base64,${resultBase64}`,
      };
      setProcessedImages(prev => [
        ...prev.filter(p => p.sourceId !== activeImage.id),
        newProcessedImage
      ]);
    } catch (e: any) {
      console.error(e);
      setError(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [activeImage, settings, modelImage]);

  const handleBatchProcess = useCallback(async () => {
    if (productImages.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setProgress({ current: 0, total: productImages.length });
    
    const newProcessed: ProcessedImage[] = [];
    let batchError: string | null = null;

    for (let i = 0; i < productImages.length; i++) {
      const image = productImages[i];
      try {
        const resultBase64 = await generateProductImage(image.file, settings, modelImage?.file || null);
        newProcessed.push({
          id: `processed-${image.id}-${Date.now()}`,
          sourceId: image.id,
          url: `data:image/png;base64,${resultBase64}`,
        });
      } catch (e: any) {
        console.error(`Failed to process ${image.file.name}:`, e);
        batchError = getApiErrorMessage(e);
        // Stop batch processing on critical errors
        if (batchError.includes("API")) {
          setError(`${image.file.name} 처리 중 중단됨: ${batchError}`);
          break; 
        }
      }
      setProgress({ current: i + 1, total: productImages.length });
    }

    if(batchError && !error) {
        setError("일부 이미지 처리 중 오류가 발생했습니다.");
    }

    setProcessedImages(prev => {
      const existingIds = new Set(newProcessed.map(p => p.sourceId));
      const filteredPrev = prev.filter(p => !existingIds.has(p.sourceId));
      return [...filteredPrev, ...newProcessed];
    });

    setIsLoading(false);
  }, [productImages, settings, modelImage, error]);
  
  const handleDownload = useCallback(async () => {
    if (!finalImageUrl) return;

    const link = document.createElement('a');
    link.href = finalImageUrl;
    const originalFileName = activeImage?.file.name.split('.').slice(0, -1).join('.') || 'download';
    link.download = `${originalFileName}-studio.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [finalImageUrl, activeImage]);

  const handleImageEdit = useCallback(async (sourceId: string, prompt: string) => {
    const imageToEdit = processedImages.find(img => img.sourceId === sourceId);
    if (!imageToEdit || !prompt) return;

    setIsLoading(true);
    setError(null);
    try {
      const resultBase64 = await editProductImage(imageToEdit.url, prompt);
      const newEditedImage: ProcessedImage = {
        id: `edited-${imageToEdit.id}-${Date.now()}`,
        sourceId: imageToEdit.sourceId,
        url: `data:image/png;base64,${resultBase64}`,
      };
      setProcessedImages(prev => [
        ...prev.filter(p => p.sourceId !== sourceId),
        newEditedImage
      ]);
    } catch (e: any) {
      console.error(e);
      setError(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [processedImages]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4">
        {productImages.length === 0 ? (
          <div className="w-full flex-grow flex items-center justify-center">
            <ImageUploader onFilesAdded={handleFilesAdded} />
          </div>
        ) : (
          <>
            <ControlPanel 
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={handleGenerate}
              onBatchProcess={handleBatchProcess}
              isProcessing={isLoading}
              imageCount={productImages.length}
              modelImage={modelImage}
              onModelImageUpload={handleModelImageUpload}
              onRemoveModelImage={handleRemoveModelImage}
            />
            <PreviewArea
              activeImage={activeImage}
              processedImage={activeProcessedImage}
              processedImageUrl={finalImageUrl}
              isLoading={isLoading}
              progress={progress}
              error={error}
              onDownload={handleDownload}
              allImages={productImages}
              onSelectImage={setActiveImageId}
              activeImageId={activeImageId}
              onImageEdit={handleImageEdit}
            />
          </>
        )}
      </main>
    </div>
  );
}