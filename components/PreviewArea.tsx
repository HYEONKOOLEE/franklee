import React from 'react';
import type { ProductImage, ProcessedImage } from '../types';
import { Loader } from './Loader';
import { SparklesIcon } from './icons/SparklesIcon';
import { EditIcon } from './icons/EditIcon';

interface PreviewAreaProps {
  activeImage: ProductImage | undefined;
  processedImage: ProcessedImage | undefined;
  processedImageUrl: string | null;
  isLoading: boolean;
  progress: { current: number; total: number };
  error: string | null;
  onDownload: () => void;
  allImages: ProductImage[];
  onSelectImage: (id: string) => void;
  activeImageId: string | null;
  onImageEdit: (sourceId: string, prompt: string) => Promise<void>;
}

const ImageCard: React.FC<{ title: string; imageUrl?: string; children?: React.ReactNode, icon?: React.ReactNode }> = ({ title, imageUrl, children, icon }) => (
    <div className="relative w-full aspect-square bg-gray-800/70 rounded-xl flex flex-col items-center justify-center overflow-hidden border border-gray-700 shadow-inner">
        <h3 className="absolute top-3 left-4 text-xs font-bold uppercase tracking-wider text-indigo-300 z-10">{title}</h3>
        {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        ) : (
            <div className="text-gray-500 flex flex-col items-center">
              {icon}
              <span className="mt-2 text-sm">{children}</span>
            </div>
        )}
    </div>
);


export const PreviewArea: React.FC<PreviewAreaProps> = ({ activeImage, processedImage, processedImageUrl, isLoading, progress, error, onDownload, allImages, onSelectImage, activeImageId, onImageEdit }) => {
  const isBatchProcessing = progress.total > 0 && isLoading;
  const [isEditing, setIsEditing] = React.useState(false);
  const [editPrompt, setEditPrompt] = React.useState('');

  React.useEffect(() => {
    // Exit edit mode if the active image changes
    setIsEditing(false);
    setEditPrompt('');
  }, [activeImageId]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditPrompt('');
  };

  const handleRefineClick = async () => {
    if (!activeImage || !editPrompt) return;
    await onImageEdit(activeImage.id, editPrompt);
    setIsEditing(false);
    setEditPrompt('');
  };


  return (
    <div className="flex-grow flex flex-col gap-4">
      {/* Thumbnails */}
      <div className="w-full bg-gray-800/50 p-3 rounded-xl border border-gray-700">
        <div className="flex space-x-3 overflow-x-auto">
          {allImages.map(img => (
            <button 
              key={img.id}
              onClick={() => onSelectImage(img.id)}
              className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none ring-offset-2 ring-offset-gray-900 ${activeImageId === img.id ? 'ring-2 ring-indigo-500' : 'opacity-60 hover:opacity-100'}`}
            >
              <img src={img.url} alt="Product thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {isBatchProcessing && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-xl">
                <Loader />
                <p className="text-lg font-semibold mt-4 text-white">일괄 처리 중...</p>
                <p className="text-gray-300">{`${progress.total}개 중 ${progress.current}번째 이미지 처리 중`}</p>
                <div className="w-1/2 bg-gray-600 rounded-full h-2.5 mt-4">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                </div>
            </div>
        )}
        
        {isLoading && !isBatchProcessing && (
             <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-xl">
                <Loader />
                 <p className="text-lg font-semibold mt-4 text-white">이미지를 생성하는 중입니다...</p>
                 <p className="text-gray-300">AI가 마법을 부리고 있어요!</p>
            </div>
        )}

        <ImageCard title="원본" imageUrl={activeImage?.url}>이미지를 업로드하세요</ImageCard>
        
        <div className="flex flex-col gap-4">
          <div>
            <ImageCard title="AI 생성" imageUrl={processedImageUrl ?? undefined} icon={<SparklesIcon className="w-12 h-12"/>}>
              결과물이 여기에 표시됩니다
            </ImageCard>
          </div>
          
          {processedImage && !isEditing && (
            <div className="flex gap-2 justify-end">
                <button
                    onClick={handleEditClick}
                    className="bg-gray-700/80 backdrop-blur-sm text-white font-semibold py-2 px-3 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-lg flex items-center gap-2"
                    aria-label="이미지 수정"
                >
                    <EditIcon className="w-4 h-4" />
                    수정
              </button>
              <button
                onClick={onDownload}
                className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg"
              >
                다운로드
              </button>
            </div>
          )}
          
          {isEditing && (
             <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
              <p className="text-sm font-semibold text-indigo-300 mb-2">이미지 수정</p>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="예: 조명을 더 따뜻하게, 그림자 추가"
                className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition resize-none mb-3"
                rows={3}
                aria-label="수정 프롬프트"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-semibold bg-gray-600 hover:bg-gray-700 rounded-md transition-colors">취소</button>
                <button onClick={handleRefineClick} disabled={!editPrompt || isLoading} className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:bg-indigo-900 disabled:text-gray-400">다듬기</button>
              </div>
            </div>
          )}
        </div>
      </div>
       {error && <div className="p-3 text-center bg-red-900/50 text-red-300 border border-red-700 rounded-lg">{error}</div>}
    </div>
  );
};