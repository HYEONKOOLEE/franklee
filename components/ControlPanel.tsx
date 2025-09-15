import React from 'react';
import type { Settings, ProductImage } from '../types';
import { BACKGROUND_OPTIONS, LIGHTING_OPTIONS, ANGLE_OPTIONS, SNS_OPTIONS, WATERMARK_POSITION_OPTIONS } from '../constants';
import { UserIcon } from './icons/UserIcon';

interface ControlPanelProps {
  settings: Settings;
  onSettingsChange: React.Dispatch<React.SetStateAction<Settings>>;
  onGenerate: () => void;
  onBatchProcess: () => void;
  isProcessing: boolean;
  imageCount: number;
  modelImage: ProductImage | null;
  onModelImageUpload: (file: File) => void;
  onRemoveModelImage: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const OptionButton: React.FC<{ label: string; value: string; selectedValue: string; onSelect: (value: string) => void }> = ({ label, value, selectedValue, onSelect }) => (
    <button
        onClick={() => onSelect(value)}
        className={`w-full text-left px-4 py-2 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
        selectedValue === value
            ? 'bg-indigo-500 text-white shadow-lg'
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onSettingsChange, onGenerate, onBatchProcess, isProcessing, imageCount, modelImage, onModelImageUpload, onRemoveModelImage }) => {
  const [selectedBackgroundValue, setSelectedBackgroundValue] = React.useState(settings.background);
  const [customBackground, setCustomBackground] = React.useState('');

  const handleSettingChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
    onSettingsChange(prev => ({ ...prev, [key]: value }));
  };

  const handleBackgroundSelect = (value: string) => {
      const option = BACKGROUND_OPTIONS.find(opt => opt.value === value);
      const isCustom = option?.label === '직접 입력';
      setSelectedBackgroundValue(value);
      if (!isCustom) {
        handleSettingChange('background', value);
      } else {
        handleSettingChange('background', customBackground);
      }
  };
  
  const handleCustomBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomBackground(e.target.value);
      if (BACKGROUND_OPTIONS.find(opt => opt.value === selectedBackgroundValue)?.label === '직접 입력') {
          handleSettingChange('background', e.target.value);
      }
  };

  const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onModelImageUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  const isCustomModelMode = settings.useModel && !!modelImage;

  return (
    <aside className="w-full lg:w-96 bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl flex-shrink-0 h-full overflow-y-auto border border-gray-700">
      <Section title="배경">
         <div className={`grid grid-cols-2 gap-2 ${isCustomModelMode ? 'opacity-50 pointer-events-none' : ''}`}>
            {BACKGROUND_OPTIONS.map(opt => (
                <OptionButton key={opt.value} label={opt.label} value={opt.value} selectedValue={selectedBackgroundValue} onSelect={handleBackgroundSelect} />
            ))}
        </div>
        {BACKGROUND_OPTIONS.find(opt => opt.value === selectedBackgroundValue)?.label === '직접 입력' && !isCustomModelMode && (
            <input
                type="text"
                placeholder="원하는 배경을 설명해주세요..."
                value={customBackground}
                onChange={handleCustomBackgroundChange}
                className="w-full mt-2 bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
        )}
        {isCustomModelMode && <p className="text-xs text-gray-400 mt-2">배경은 모델 사진에 따라 결정됩니다.</p>}
      </Section>
      
      <Section title="조명">
        <div className={isCustomModelMode ? 'opacity-50 pointer-events-none' : ''}>
            {LIGHTING_OPTIONS.map(opt => (
                <OptionButton key={opt.value} label={opt.label} value={opt.value} selectedValue={settings.lighting} onSelect={(v) => handleSettingChange('lighting', v)} />
            ))}
        </div>
        {isCustomModelMode && <p className="text-xs text-gray-400 mt-2">조명은 모델 사진에 따라 결정됩니다.</p>}
      </Section>

      <Section title="카메라 각도">
        <div className={`grid grid-cols-2 gap-2 ${isCustomModelMode ? 'opacity-50 pointer-events-none' : ''}`}>
            {ANGLE_OPTIONS.map(opt => (
                <OptionButton key={opt.value} label={opt.label} value={opt.value} selectedValue={settings.angle} onSelect={(v) => handleSettingChange('angle', v)} />
            ))}
        </div>
        {isCustomModelMode && <p className="text-xs text-gray-400 mt-2">각도는 모델의 포즈에 따라 결정됩니다.</p>}
      </Section>

      <Section title="인물 모델 추가">
        <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600">
            <span className="text-sm font-medium text-gray-200">인물 모델 사용</span>
            <div className={`w-11 h-6 flex items-center bg-gray-600 rounded-full p-1 duration-300 ease-in-out ${settings.useModel ? 'bg-indigo-500' : ''}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${settings.useModel ? 'translate-x-5' : ''}`}></div>
            </div>
            <input
                type="checkbox"
                checked={settings.useModel}
                onChange={e => handleSettingChange('useModel', e.target.checked)}
                className="hidden"
            />
        </label>
        {settings.useModel && (
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg space-y-4">
            <div>
                <p className="text-xs text-gray-300 mb-2">모델 상호작용:</p>
                <div className="grid grid-cols-3 gap-2">
                    <OptionButton label="착용" value="wearing" selectedValue={settings.modelInteraction} onSelect={v => handleSettingChange('modelInteraction', v as any)} />
                    <OptionButton label="들고 있기" value="holding" selectedValue={settings.modelInteraction} onSelect={v => handleSettingChange('modelInteraction', v as any)} />
                    <OptionButton label="함께 서 있기" value="posing" selectedValue={settings.modelInteraction} onSelect={v => handleSettingChange('modelInteraction', v as any)} />
                </div>
            </div>
            {modelImage ? (
                <div className="relative group">
                    <p className="text-xs text-gray-300 mb-2">사용 중인 모델:</p>
                    <img src={modelImage.url} alt="Model preview" className="w-full h-auto rounded-md object-cover max-h-48" />
                    <button 
                        onClick={onRemoveModelImage}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
                        aria-label="모델 이미지 제거"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ) : (
                <label htmlFor="model-upload" className="cursor-pointer w-full flex flex-col items-center justify-center py-4 bg-gray-700 hover:bg-gray-600 rounded-md border-2 border-dashed border-gray-500 transition-colors">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-semibold mt-2 text-gray-200">모델 사진 업로드</span>
                    <span className="text-xs text-gray-400">(모델 기능 사용 시 필수)</span>
                    <input id="model-upload" type="file" accept="image/*" className="hidden" onChange={handleModelFileChange} />
                </label>
            )}
          </div>
        )}
      </Section>

      <Section title="내보내기 설정">
         <div className="space-y-4">
            <input
                type="text"
                placeholder="워터마크 추가 (예: YourBrand)"
                value={settings.watermark}
                onChange={e => handleSettingChange('watermark', e.target.value)}
                className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            {settings.watermark && (
              <div>
                <p className="text-xs text-gray-300 mb-2">워터마크 위치:</p>
                <div className="grid grid-cols-3 gap-2">
                  {WATERMARK_POSITION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleSettingChange('watermarkPosition', opt.value)}
                      className={`px-2 py-2 text-xs rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        settings.watermarkPosition === opt.value
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
             <select
                value={settings.snsTarget}
                onChange={e => handleSettingChange('snsTarget', e.target.value)}
                className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
             >
                {SNS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
             </select>
         </div>
      </Section>
      
      <div className="mt-8 space-y-3">
        <button
          onClick={onGenerate}
          disabled={isProcessing}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg"
        >
          {isProcessing ? '처리 중...' : '이미지 생성'}
        </button>
        {imageCount > 1 && (
            <button
                onClick={onBatchProcess}
                disabled={isProcessing}
                className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300"
            >
                {isProcessing ? '일괄 처리 중...' : `전체 ${imageCount}개 이미지 처리`}
            </button>
        )}
      </div>
    </aside>
  );
};