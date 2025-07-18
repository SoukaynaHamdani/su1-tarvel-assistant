import { supabase } from '@/integrations/supabase/client';

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface Message {
  role: "user" | "model" | "system";
  content: string;
}

export interface GeminiRequest {
  contents: {
    role: string;
    parts: {
      text: string;
    }[];
  }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

interface GeminiKeyResponse {
  api_key: string;
}

export const sendMessageToGemini = async (messages: Message[], systemPrompt?: string): Promise<string> => {
  try {
    const api_key = "AIzaSyB-yjqveW2FRIw74cD09p5CYDFCt4uDlWc";

    const contents = messages.map(message => ({
      role: message.role === "system" ? "user" : message.role,
      parts: [{ text: message.content }]
    }));

    if (systemPrompt) {
      contents.unshift({
        role: "user",
        parts: [{ text: systemPrompt }]
      });
    }

    const response = await fetch(`${API_URL}?key=${api_key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000
        }
      })
    });

    const data2 = await response.json();

    if (data2.error) {
      console.error("Gemini API Error:", data2.error);
      return "I'm having trouble connecting to my brain right now. Please try again in a moment.";
    }

    return data2.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm having trouble connecting right now. Please check your internet connection and try again.";
  }
};

export const generateCulturalTranslation = async (
  originCountry: string, 
  destinationCountry: string, 
  question: string
): Promise<string> => {
  const prompt = `You are a helpful cultural translator bot that helps travelers understand cultural etiquette.
  
  Origin Country: ${originCountry}
  Destination Country: ${destinationCountry}
  Question: ${question}
  
  Provide a brief, friendly response with bullet points and appropriate emojis. Include cultural do's and don'ts if relevant.
  Keep your answer concise and focused on practical advice.`;

  return sendMessageToGemini([{ role: "user", content: prompt }]);
};
