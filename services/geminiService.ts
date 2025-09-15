import { GoogleGenAI, Modality } from "@google/genai";
import type { Settings } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const base64ToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};


const buildPrompt = (settings: Settings, hasModelImage: boolean): string => {
  if (settings.useModel && hasModelImage) {
    let modelPrompt = '';
    const baseInstruction = `You are a world-class photoretoucher specializing in hyper-realistic composite imagery. Your task is to seamlessly edit the 'Model Image' so the person is holding the 'Product' from the 'Product Image'.`;
    const commonRules = `
- The final image must be a high-resolution, professional photograph.
- The lighting on the product must be adjusted to perfectly match the lighting in the 'Model Image'.
- The person's identity (face, hair, body type) must be preserved exactly as in the 'Model Image'.
- Completely ignore the original background of the 'Product Image'.`;

    switch (settings.modelInteraction) {
      case 'wearing':
        modelPrompt = `The person from the 'Model Image' is now wearing the product (e.g., clothing, accessory) from the 'Product Image'. Retain the background, general pose, and lighting from the 'Model Image'.`;
        break;
      case 'holding':
        modelPrompt = `
You are a professional photo editor performing a complex composite edit.
Your task is to create a single, photorealistic image where the person from the 'Model Image' is holding the 'Product' from the 'Product Image'.

**CRITICAL MANDATE: The final image must depict a person with EXACTLY TWO ARMS. There are no exceptions. An image with three arms is a critical failure.**

**Scene Description for the Final Image:**
- The person is the same as in the 'Model Image' (same face, hair, clothing, body).
- The background and lighting are the same as in the 'Model Image'.
- The person is holding the 'Product' in one of their hands. This is achieved by **replacing one of the original arms** with a new arm in a holding pose.
- The other original arm remains in a natural pose.
- The product and the new arm are perfectly blended into the scene, matching the lighting, shadows, and color grade.

**DO NOT:**
- Do NOT add a third arm.
- Do NOT leave remnants of the original arm that was replaced.

Before outputting the final image, verify that the person has exactly two arms. If not, the task has failed and you must start over.`;
        break;
      case 'posing':
        modelPrompt = `The person from the 'Model Image' is standing or posing next to the product from the 'Product Image'. This is for larger items where the person provides scale and context. Retain the background, the person's full pose, and lighting from the 'Model Image'.`;
        break;
    }
    
    return `${baseInstruction} ${modelPrompt} ${commonRules}`;
  }

  let prompt = `Analyze the provided image and identify the main product. Create a photorealistic, high-resolution professional product photograph of this product.
- IMPORTANT: Completely remove the original background and any distractions.
- Place the product in a new, clean scene with a '${settings.background}' style background.
- The lighting should be '${settings.lighting}'.
- The product should be viewed from the '${settings.angle}'.
- The final image should be centered, well-lit, and of commercial quality.
`;

  if (settings.useModel && !hasModelImage) {
    prompt += `- If the product is an item of clothing, accessory, or jewelry, display it on a suitable, photorealistic human model to showcase how it's worn. The model should be posed naturally and fit the style of the product and background. Do not show the model's face.`;
  }
  
  return prompt;
};


export const generateProductImage = async (
    productImageFile: File, 
    settings: Settings,
    modelImageFile: File | null
): Promise<string> => {
  // Fix: Use process.env.API_KEY as per the coding guidelines.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY 환경 변수가 설정되지 않았습니다. Vercel 또는 호스팅 환경에서 설정을 확인해주세요.");
  }
  // Fix: Initialize GoogleGenAI with process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const productImagePart = await fileToGenerativePart(productImageFile);
  const prompt = buildPrompt(settings, !!modelImageFile);
  
  const textPart = {
    text: prompt,
  };

  const parts: ({ inlineData: { data: string; mimeType: string; } } | { text: string; })[] = [];
  
  if (modelImageFile) {
    // Label images for clarity in the prompt
    parts.push({text: "Model Image:"});
    parts.push(await fileToGenerativePart(modelImageFile));
    parts.push({text: "Product Image:"});
    parts.push(productImagePart);
  } else {
    parts.push(productImagePart);
  }
  
  parts.push(textPart);


  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: parts,
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const responseParts = response.candidates?.[0]?.content?.parts;

  if (!responseParts) {
      throw new Error("모델로부터 잘못된 응답을 받았습니다. 콘텐츠를 찾을 수 없습니다.");
  }

  const imageResultPart = responseParts.find(part => part.inlineData);

  if (imageResultPart && imageResultPart.inlineData) {
    return imageResultPart.inlineData.data;
  }
  
  const textResultPart = responseParts.find(part => part.text);
  if (textResultPart && textResultPart.text) {
      throw new Error(`모델이 이미지 대신 텍스트를 반환했습니다: ${textResultPart.text}`);
  }

  throw new Error("이미지를 생성하거나 응답에서 이미지 데이터를 찾을 수 없습니다.");
};

export const editProductImage = async (
    base64ImageUrl: string,
    editPrompt: string
): Promise<string> => {
    // Fix: Use process.env.API_KEY as per the coding guidelines.
    if (!process.env.API_KEY) {
        throw new Error("API_KEY 환경 변수가 설정되지 않았습니다. Vercel 또는 호스팅 환경에서 설정을 확인해주세요.");
    }
    // Fix: Initialize GoogleGenAI with process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const mimeType = base64ImageUrl.match(/data:(.*);base64,/)?.[1] ?? 'image/png';
    const base64Data = base64ImageUrl.split(',')[1];

    const imagePart = base64ToGenerativePart(base64Data, mimeType);
    
    const textPart = {
        text: `Based on the user's request, please edit the provided image. The request is: "${editPrompt}".
- Apply the edit subtly and maintain the photorealism of the original image.
- Do not drastically change the composition unless specifically asked.
- Return only the edited image.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const responseParts = response.candidates?.[0]?.content?.parts;

    if (!responseParts) {
        throw new Error("모델로부터 잘못된 응답을 받았습니다. 콘텐츠를 찾을 수 없습니다.");
    }

    const imageResultPart = responseParts.find(part => part.inlineData);

    if (imageResultPart && imageResultPart.inlineData) {
        return imageResultPart.inlineData.data;
    }

    const textResultPart = responseParts.find(part => part.text);
    if (textResultPart && textResultPart.text) {
        throw new Error(`모델이 이미지 대신 텍스트를 반환했습니다: ${textResultPart.text}`);
    }

    throw new Error("수정된 이미지를 생성하거나 응답에서 이미지 데이터를 찾을 수 없습니다.");
};
