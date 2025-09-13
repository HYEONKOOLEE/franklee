
import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImageUploader } from './components/ImageUploader';
import { PreviewArea } from './components/PreviewArea';
import { Header } from './components/Header';
import type { Settings, ProductImage, ProcessedImage } from './types';
import { generateProductImage, editProductImage } from './services/geminiService';
import { BACKGROUND_OPTIONS, LIGHTING_OPTIONS, ANGLE_OPTIONS, SNS_OPTIONS } from './constants';
import { applyPostProcessing } from './utils/imageUtils';

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
          setError("Failed to apply post-processing for preview.");
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
    } catch (e) {
      console.error(e);
      setError('Failed to generate image. Please check the console for details.');
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

    for (let i = 0; i < productImages.length; i++) {
      const image = productImages[i];
      try {
        const resultBase64 = await generateProductImage(image.file, settings, modelImage?.file || null);
        newProcessed.push({
          id: `processed-${image.id}-${Date.now()}`,
          sourceId: image.id,
          url: `data:image/png;base64,${resultBase64}`,
        });
      } catch (e) {
        console.error(`Failed to process ${image.file.name}:`, e);
      }
      setProgress({ current: i + 1, total: productImages.length });
    }

    setProcessedImages(prev => {
      const existingIds = new Set(newProcessed.map(p => p.sourceId));
      const filteredPrev = prev.filter(p => !existingIds.has(p.sourceId));
      return [...filteredPrev, ...newProcessed];
    });

    setIsLoading(false);
  }, [productImages, settings, modelImage]);
  
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
    } catch (e) {
      console.error(e);
      setError('Failed to edit image. Please check the console for details.');
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
