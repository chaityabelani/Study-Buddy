import { GoogleGenAI, Type } from "@google/genai";
import { VideoSuggestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textGenerationModel = 'gemini-2.5-flash';

export const generateSummary = async (text: string): Promise<string> => {
  const prompt = `Please provide a concise summary of the following content for a B.Tech student. Focus on the key concepts, definitions, and main takeaways. The content is: \n\n${text}`;
  
  const response = await ai.models.generateContent({
    model: textGenerationModel,
    contents: prompt,
  });

  return response.text;
};

export const generateNotes = async (text: string): Promise<string> => {
  const prompt = `Generate detailed, well-structured notes from the following content, suitable for a B.Tech student's exam preparation. Use markdown for headings, bullet points, and to highlight important terms. The content is: \n\n${text}`;
  
  const response = await ai.models.generateContent({
    model: textGenerationModel,
    contents: prompt,
  });

  return response.text;
};

export const findImportantQuestions = async (text: string): Promise<string> => {
  const prompt = `Based on the provided content, identify and list the 10 most common and important questions for a B.Tech student. Group them by topic using markdown headings. This is for exam preparation. The content is: \n\n${text}`;
  
  const response = await ai.models.generateContent({
    model: textGenerationModel,
    contents: prompt,
  });

  return response.text;
};

export const findVideos = async (
  text: string, 
  channels: string, 
  length: string
): Promise<VideoSuggestion[]> => {
  let prompt = `Analyze the following academic content. Identify the 5 most critical topics for a B.Tech student. For each topic, suggest a relevant YouTube video title and a short, helpful description of what the video should cover. The content is: \n\n${text}`;

  if (channels.trim()) {
    prompt += `\n\nWhen suggesting videos, please prioritize content from the following YouTube channels if suitable videos exist for the topics: ${channels}.`;
  }

  if (length && length !== 'any') {
    let lengthDescription = '';
    switch (length) {
      case 'short':
        lengthDescription = 'under 10 minutes';
        break;
      case 'medium':
        lengthDescription = 'between 10 and 30 minutes';
        break;
      case 'long':
        lengthDescription = 'over 30 minutes';
        break;
    }
    if (lengthDescription) {
      prompt += `\n\nAlso, please give preference to videos that are ${lengthDescription} long.`;
    }
  }

  const response = await ai.models.generateContent({
    model: textGenerationModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: {
              type: Type.STRING,
              description: 'The core academic topic identified from the text.',
            },
            title: {
              type: Type.STRING,
              description: 'A concise and searchable YouTube video title for this topic.',
            },
            description: {
              type: Type.STRING,
              description: 'A brief summary of the ideal video content for this topic.',
            },
          },
          required: ["topic", "title", "description"],
        },
      },
    },
  });
  
  try {
    const jsonStr = response.text.trim();
    const videoSuggestions: VideoSuggestion[] = JSON.parse(jsonStr);
    return videoSuggestions;
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", error);
    throw new Error("The AI response was not in the expected format. Please try again.");
  }
};