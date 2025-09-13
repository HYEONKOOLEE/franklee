
import type { Settings } from './types';

export const BACKGROUND_OPTIONS = [
  { label: 'Studio White', value: 'clean, seamless, bright white studio' },
  { label: 'Minimalist Gray', value: 'minimalist, textured gray concrete' },
  { label: 'Lifestyle', value: 'warm, cozy, modern living room' },
  { label: 'Forest', value: 'serene forest floor with soft sunlight' },
  { label: 'Beach', value: 'pristine sandy beach with gentle waves and clear sky' },
  { label: 'Marble', value: 'elegant white marble surface' },
  { label: 'Wooden Surface', value: 'rustic wooden table surface with a soft, warm light' },
  { label: 'Abstract Gradient', value: 'soft, colorful abstract gradient' },
  { label: 'Custom', value: 'custom' },
];

export const LIGHTING_OPTIONS = [
  { label: 'Soft & Diffused', value: 'soft, diffused, even lighting with minimal shadows' },
  { label: 'Dramatic', value: 'dramatic, high-contrast lighting with a single key light' },
  { label: 'Natural Sunlight', value: 'bright, warm, natural afternoon sunlight' },
  { label: 'Backlit', value: 'backlit with a soft glow around the edges' },
];

export const ANGLE_OPTIONS = [
  { label: 'Front View', value: 'straight-on front view' },
  { label: '45-Degree Angle', value: 'three-quarter view from a 45-degree angle' },
  { label: 'Upper Body', value: 'upper body shot, focusing on the torso and head' },
  { label: 'Full Body', value: 'full body shot, showing the entire figure from head to toe' },
  { label: 'Top-Down', value: 'flat lay, top-down perspective' },
  { label: 'Low Angle', value: 'dramatic low angle shot looking up' },
];

export const SNS_OPTIONS = [
    { label: 'Original Size', value: 'original' },
    { label: 'Instagram Post (1:1)', value: '1:1' },
    { label: 'Instagram Story (9:16)', value: '9:16' },
    { label: 'Naver Shopping (1:1)', value: '1:1' },
    { label: 'Pinterest Pin (2:3)', value: '2:3' },
];

export const WATERMARK_POSITION_OPTIONS: { label: string; value: Settings['watermarkPosition'] }[] = [
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Center', value: 'top-center' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Center', value: 'bottom-center' },
  { label: 'Bottom Right', value: 'bottom-right' },
];
