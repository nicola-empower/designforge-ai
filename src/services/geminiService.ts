import { GoogleGenAI, GenerateContentResponse, Chat, FunctionDeclaration, Type } from "@google/genai";
import { DesignSystem, BlueprintData, ImageSize } from '../types';

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

// Tool Definition for Design Updates
const designTool: FunctionDeclaration = {
  name: 'updateDesign',
  description: 'Update the website design system configuration. Use this when the user asks to change colors, fonts, layout, spacing, texts, or other visual properties.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      primaryColor: { type: Type.STRING, description: 'Hex color code for primary action color' },
      secondaryColor: { type: Type.STRING, description: 'Hex color code for secondary accent color' },
      fontFamily: { type: Type.STRING, description: 'Font family: sans, serif, mono, Inter, Playfair Display, Roboto, or Lato' },
      borderRadius: { type: Type.STRING, description: 'Border radius: none, sm, md, lg, or full' },
      layoutMode: { type: Type.STRING, description: 'Layout type: landing, dashboard, ecommerce, blog, or portfolio' },
      darkMode: { type: Type.BOOLEAN, description: 'Enable dark mode' },
      baseFontSize: { type: Type.NUMBER, description: 'Base font size in pixels (12-24)' },
      headingText: { type: Type.STRING, description: 'Main heading text' },
      subheadingText: { type: Type.STRING, description: 'Subheading text' },
      bodyText: { type: Type.STRING, description: 'Body text content' },
      gridColumns: { type: Type.NUMBER, description: 'Number of grid columns (1-4)' },
      gridGap: { type: Type.NUMBER, description: 'Grid gap in pixels (8-64)' }
    },
  }
};

// Feature 4: AI Powered Chatbot with Design capabilities
export const createChatSession = (): Chat => {
  const ai = getAiClient();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are a Senior Web Design Engineer and Accessibility Expert with mastery of all programming languages (React, Astro, Python, Rust, etc.) and design systems. 
      
      Your Role:
      1. Assist users with technical questions about web development, coding, and architecture.
      2. Act as a Design Consultant for the 'DesignForge' app the user is currently using.
      
      CRITICAL - CONTRAST ANALYSIS & PROACTIVE FIXES:
      The app uses a DARK MODE interface (background approx #0f172a).
      You must continuously evaluate the contrast of the user's 'primaryColor' and 'secondaryColor' against this dark background.
      
      Rules for Contrast:
      - Primary Colors MUST be bright/light enough to stand out against #0f172a. (Avoid dark blues, dark reds, black, or dark grays).
      - If you detect a Low Contrast violation (e.g., user selects Navy Blue #000080):
        1. Explain the WCAG accessibility issue (e.g., "That blue is too dark against the slate background").
        2. IMMEDIATELY & PROACTIVELY call the 'updateDesign' tool to suggest a fixed color (e.g., change to #60a5fa).
        3. Do not ask for permission first—make the change and inform the user you've improved the accessibility.
      
      Interaction Style:
      - Be concise, professional, and helpful.
      - When using the tool, simply state what you changed and why (e.g., "I updated the primary color to a lighter shade to meet WCAG AA contrast standards.").`,
      tools: [{ functionDeclarations: [designTool] }],
    }
  });
};

// Feature 2: Generate Images with Nano Banana Pro (gemini-3-pro-image-preview)
export const generateImageAssets = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "16:9" // Good for web banners
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

// Feature 1: Edit Images with Nano Banana (gemini-2.5-flash-image)
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();

  // Clean base64 string if needed
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for simplicity, usually detected
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Image edit failed:", error);
    throw error;
  }
};

// Feature 3: Gemini Intelligence for Blueprint
export const generateProjectBlueprint = async (design: DesignSystem): Promise<BlueprintData> => {
  const ai = getAiClient();

  const prompt = `
    Analyze this web design configuration and provide a technical blueprint for an Astro + React project.
    
    Configuration:
    - Primary Color: ${design.primaryColor}
    - Layout Mode: ${design.layoutMode}
    - Font Style: ${design.fontFamily}
    - Border Radius: ${design.borderRadius}
    - Base Font Size: ${design.baseFontSize}px
    
    Return a JSON object with the following structure (do not use markdown code blocks, just raw JSON):
    {
      "overview": "A 2-sentence summary of the site vibe and purpose.",
      "technicalStack": ["List", "of", "libraries", "suggested"],
      "components": ["List", "of", "key", "react", "components", "needed"],
      "estimatedEffort": "Time estimate description"
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Using Pro for complex reasoning
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text || "{}";
  try {
    return JSON.parse(text) as BlueprintData;
  } catch (e) {
    console.error("Failed to parse blueprint JSON", e);
    throw new Error("Failed to generate blueprint");
  }
};