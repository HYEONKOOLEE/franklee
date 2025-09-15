import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ApiKeyModalProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="flex justify-center items-center space-x-3 mb-6">
           <SparklesIcon className="w-10 h-10 text-indigo-400" />
           <h1 className="text-2xl font-bold text-white tracking-tight">AI 제품 사진 스튜디오</h1>
        </div>
        
        <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">환영합니다! API 키를 입력해주세요.</h2>
            <p className="text-sm text-gray-400 mb-6">
            이미지 생성을 위해 Google AI API 키가 필요합니다. 키는 브라우저에만 저장되며, 저희 서버로 전송되지 않습니다.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Google AI API 키를 입력하세요"
            className="w-full bg-gray-700 border-gray-600 rounded-md px-4 py-3 text-sm text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition mb-4"
            aria-label="Google AI API 키"
          />
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          >
            저장하고 계속하기
          </button>
        </form>

        <div className="pt-6 border-t border-gray-700">
            <h3 className="text-md font-semibold text-gray-200 mb-4 text-left">무료 API 키 발급 방법</h3>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-3 text-left">
                <li>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-400 hover:underline">
                        Google AI Studio
                    </a>
                    {' '}에 접속합니다.
                </li>
                <li>
                    <span className="font-semibold text-white">"Create API key in new project"</span> 버튼을 클릭합니다. (Google 계정 로그인이 필요할 수 있습니다.)
                </li>
                <li>
                    생성된 API 키를 복사하여 위 입력창에 붙여넣습니다.
                </li>
            </ol>
        </div>

      </div>
    </div>
  );
};