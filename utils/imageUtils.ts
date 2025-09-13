
import type { Settings } from '../types';
import { SNS_OPTIONS } from '../constants';

const getAspectRatio = (snsTarget: string): number | null => {
    const option = SNS_OPTIONS.find(o => o.value === snsTarget);
    if (!option || option.value === 'original') return null;

    const [width, height] = option.value.split(':').map(Number);
    return width / height;
}

export const applyPostProcessing = (base64Image: string, settings: Settings): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = img.width;
            let sourceHeight = img.height;
            
            const aspectRatio = getAspectRatio(settings.snsTarget);

            if (aspectRatio !== null) {
                const currentRatio = img.width / img.height;
                if (currentRatio > aspectRatio) {
                    // Image is wider than target, crop width
                    sourceWidth = img.height * aspectRatio;
                    sourceX = (img.width - sourceWidth) / 2;
                } else {
                    // Image is taller than target, crop height
                    sourceHeight = img.width / aspectRatio;
                    sourceY = (img.height - sourceHeight) / 2;
                }
            }
            
            canvas.width = sourceWidth;
            canvas.height = sourceHeight;

            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

            if (settings.watermark) {
                const padding = Math.max(10, canvas.width * 0.02);
                const fontSize = Math.max(12, Math.min(canvas.width, canvas.height) * 0.04);
                ctx.font = `bold ${fontSize}px sans-serif`;

                let x = 0;
                let y = 0;

                // Set text alignment and position based on settings
                switch (settings.watermarkPosition) {
                    case 'top-left':
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'top';
                        x = padding;
                        y = padding;
                        break;
                    case 'top-center':
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        x = canvas.width / 2;
                        y = padding;
                        break;
                    case 'top-right':
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'top';
                        x = canvas.width - padding;
                        y = padding;
                        break;
                    case 'bottom-left':
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'bottom';
                        x = padding;
                        y = canvas.height - padding;
                        break;
                    case 'bottom-center':
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        x = canvas.width / 2;
                        y = canvas.height - padding;
                        break;
                    case 'bottom-right':
                    default:
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'bottom';
                        x = canvas.width - padding;
                        y = canvas.height - padding;
                        break;
                }
                
                const shadowOffset = Math.max(1, fontSize * 0.08);

                // Shadow for better contrast
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillText(settings.watermark, x + shadowOffset, y + shadowOffset);

                // Main text with an outline
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.lineWidth = Math.max(1, fontSize * 0.04);
                ctx.strokeText(settings.watermark, x, y);
                ctx.fillText(settings.watermark, x, y);
            }

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => {
            reject(err);
        };
        img.src = base64Image;
    });
};
