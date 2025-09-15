import type { Settings } from './types';

export const BACKGROUND_OPTIONS = [
  { label: '스튜디오 화이트', value: 'clean, seamless, bright white studio' },
  { label: '미니멀 그레이', value: 'minimalist, textured gray concrete' },
  { label: '라이프스타일', value: 'warm, cozy, modern living room' },
  { label: '숲', value: 'serene forest floor with soft sunlight' },
  { label: '해변', value: 'pristine sandy beach with gentle waves and clear sky' },
  { label: '대리석', value: 'elegant white marble surface' },
  { label: '나무 표면', value: 'rustic wooden table surface with a soft, warm light' },
  { label: '추상 그라데이션', value: 'soft, colorful abstract gradient' },
  { label: '직접 입력', value: 'custom' },
];

export const LIGHTING_OPTIONS = [
  { label: '부드러운 조명', value: 'soft, diffused, even lighting with minimal shadows' },
  { label: '드라마틱 조명', value: 'dramatic, high-contrast lighting with a single key light' },
  { label: '자연광', value: 'bright, warm, natural afternoon sunlight' },
  { label: '역광', value: 'backlit with a soft glow around the edges' },
];

export const ANGLE_OPTIONS = [
  { label: '정면', value: 'straight-on front view' },
  { label: '45도 각도', value: 'three-quarter view from a 45-degree angle' },
  { label: '상반신', value: 'upper body shot, focusing on the torso and head' },
  { label: '전신', value: 'full body shot, showing the entire figure from head to toe' },
  { label: '탑다운', value: 'flat lay, top-down perspective' },
  { label: '로우 앵글', value: 'dramatic low angle shot looking up' },
];

export const SNS_OPTIONS = [
    { label: '원본 사이즈', value: 'original' },
    { label: '인스타그램 게시물 (1:1)', value: '1:1' },
    { label: '인스타그램 스토리 (9:16)', value: '9:16' },
    { label: '네이버 쇼핑 (1:1)', value: '1:1' },
    { label: '핀터레스트 핀 (2:3)', value: '2:3' },
];

export const WATERMARK_POSITION_OPTIONS: { label: string; value: Settings['watermarkPosition'] }[] = [
  { label: '좌측 상단', value: 'top-left' },
  { label: '중앙 상단', value: 'top-center' },
  { label: '우측 상단', value: 'top-right' },
  { label: '좌측 하단', value: 'bottom-left' },
  { label: '중앙 하단', value: 'bottom-center' },
  { label: '우측 하단', value: 'bottom-right' },
];