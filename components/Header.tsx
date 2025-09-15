import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">AI 제품 사진 스튜디오</h1>
        </div>
      </div>
    </header>
  );
};