import React from 'react';
import DeepSeekSvg from '@/assets/svg/deepseek.svg';

export interface IAiAuthorInfo {
  name: string;
  icon: React.ComponentType<any> | null;
}

export function getAiAuthorInfo(aiAuthor?: string | null): IAiAuthorInfo {
  const name = aiAuthor || '';
  const lowerName = name.toLowerCase();

  return {
    name,
    icon: lowerName.includes('deepseek') ? DeepSeekSvg : null,
  };
}
