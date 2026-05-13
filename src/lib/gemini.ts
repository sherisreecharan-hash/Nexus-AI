import { GoogleGenAI } from "@google/genai";
import { ModelId, Message } from "../types";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }
  return key;
};

export async function* streamChat(
  model: ModelId,
  history: Message[],
  systemInstruction?: string
) {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  // Realized models use the actual Gemini API
  // External labels (ChatGPT, Claude, etc.) use Pro model for maximum quality in this demo
  const actualModelId = model.startsWith('gemini') ? model : 'gemini-3.1-pro-preview';
  
  // Transform history to Gemini format
  const contents = history.map(msg => {
    const parts: any[] = [{ text: msg.content }];
    
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(base64 => {
        const [meta, data] = base64.split(",");
        const mimeType = meta.split(":")[1].split(";")[0];
        parts.unshift({
          inlineData: {
            mimeType,
            data
          }
        });
      });
    }
    
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts
    };
  });

  try {
    const stream = await ai.models.generateContentStream({
      model: actualModelId,
      contents,
      config: systemInstruction ? { systemInstruction } : undefined
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateTitle(firstMessage: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: 'user',
        parts: [{ text: `Generate a ultra-short (max 4 words) descriptive title for this chat based on the first message: "${firstMessage}". Return ONLY the title text, no quotes or punctuation.` }]
      }]
    });
    return response.text?.trim() || firstMessage.slice(0, 30) + "...";
  } catch (error) {
    console.error("Title generation error:", error);
    return firstMessage.slice(0, 30) + "...";
  }
}
