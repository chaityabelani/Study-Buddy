import { GoogleGenAI, Type } from "@google/genai";
import { VideoSuggestion, QuizQuestion } from '../types';

// Lazily initialize the AI instance to avoid crashing on startup if the API key isn't ready.
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to reliably extract JSON from the AI's response,
// which might be wrapped in markdown code blocks.
const extractJson = (text: string): string => {
  const match = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
  if (match && match[2]) {
    return match[2].trim();
  }
  return text.trim();
};


const textGenerationModel = 'gemini-2.5-flash';

// A more robust instruction set for the AI model.
const AI_INSTRUCTIONS = `
As an expert AI assistant for B.Tech students, adhere to the following rules for all responses:

1.  **Markdown Formatting**: Use markdown for all formatting. Use '##' for main topics/slides, '###' for sub-topics, bullet points for lists, and bold text for key terms.
2.  **LaTeX for Math**:
    *   For any mathematical equations, formulas, or symbols, use LaTeX syntax.
    *   For inline math, wrap it in single dollar signs (e.g., \`$E = mc^2$\`).
    *   For block-level equations, wrap them in double dollar signs (e.g., \`$$ E = \\sum_{i=1}^{n} d_i^2 $$\`).
3.  **Explain Formulas**: This is critical. Immediately following any significant block-level equation (\`$$...$$\`), you MUST provide a clear, step-by-step explanation.
    *   Start the explanation with a markdown heading: \`### Formula Breakdown\`.
    *   Use bullet points to explain each variable and symbol (e.g., \`* **E**: Represents the sum of squared errors.\`).
    *   Conclude with a simple summary of the formula's purpose.
`;


export const generateSummary = async (text: string): Promise<string> => {
  const ai = getAi();
  const prompt = `As a senior engineer, create a professional presentation summary of the following content for my boss. The output must be structured into distinct slides.
${AI_INSTRUCTIONS}
The content is: \n\n${text}`;
  
  const response = await ai.models.generateContent({
    model: textGenerationModel,
    contents: prompt,
  });

  return response.text;
};

export const generateNotes = async (text: string): Promise<string> => {
  const ai = getAi();
  const prompt = `Generate detailed, well-structured notes from the following content, suitable for a B.Tech student's exam preparation.
${AI_INSTRUCTIONS}
The content is: \n\n${text}`;
  
  const response = await ai.models.generateContent({
    model: textGenerationModel,
    contents: prompt,
  });

  return response.text;
};

export const findImportantQuestions = async (text: string): Promise<string> => {
  const ai = getAi();
  const prompt = `Based on the provided content, identify and list the 10 most common and important questions for a B.Tech student. This is for exam preparation. If any answers require formulas, provide them.
${AI_INSTRUCTIONS}
The content is: \n\n${text}`;
  
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
  const ai = getAi();
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
    const jsonStr = extractJson(response.text);
    const videoSuggestions: VideoSuggestion[] = JSON.parse(jsonStr);
    return videoSuggestions;
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", error);
    throw new Error("The AI response was not in the expected format. Please try again.");
  }
};

export const generateQuiz = async (text: string): Promise<QuizQuestion[]> => {
  const ai = getAi();
  const prompt = `Based on the provided content, create a multiple-choice quiz with 5 questions to test a B.Tech student's understanding. For each question, provide 4 options, clearly indicate the correct answer, and provide a brief reason why that answer is correct.
${AI_INSTRUCTIONS}
The content is: \n\n${text}`;

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
            question: {
              type: Type.STRING,
              description: 'The quiz question.'
            },
            options: {
              type: Type.ARRAY,
              description: 'An array of 4 possible answers.',
              items: { type: Type.STRING }
            },
            answer: {
              type: Type.STRING,
              description: 'The correct answer, which must be one of the strings in the options array.'
            },
            reason: {
              type: Type.STRING,
              description: 'A brief explanation for why the answer is correct.'
            }
          },
          required: ["question", "options", "answer", "reason"]
        }
      }
    }
  });

  try {
    const jsonStr = extractJson(response.text);
    const quiz: QuizQuestion[] = JSON.parse(jsonStr);
    
    // More robust validation
    if (!Array.isArray(quiz)) {
        console.error("Invalid quiz format: response is not an array.", quiz);
        throw new Error("The AI did not return a valid quiz array.");
    }
    // It's ok if the quiz is empty, but if it's not, check the first question's structure.
    if (quiz.length > 0) {
        const firstQuestion = quiz[0];
        if (
            typeof firstQuestion.question !== 'string' ||
            !Array.isArray(firstQuestion.options) ||
            typeof firstQuestion.answer !== 'string' ||
            typeof firstQuestion.reason !== 'string'
        ) {
            console.error("Invalid quiz format: question structure is incorrect.", firstQuestion);
            throw new Error("The AI returned a quiz with an invalid question format.");
        }
    }
    
    return quiz;
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON for quiz:", error);
    if (error instanceof Error && error.message.includes("invalid question format")) {
        throw error;
    }
    throw new Error("The AI response for the quiz was not in the expected format. Please try again.");
  }
};

export const simplifyExplanation = async (formula: string, explanation: string): Promise<string> => {
  const ai = getAi();
  const prompt = `Taking the following mathematical formula and its technical explanation, rewrite the explanation in extremely simple terms, as if explaining it to a complete beginner or a 5-year-old. Focus on the core concept and intuition, not the jargon.

**Original Formula:**
\`\`\`
${formula}
\`\`\`

**Technical Explanation:**
${explanation}

**Simplified Explanation (ELI5):**
`;

  const response = await ai.models.generateContent({
    model: textGenerationModel,
    contents: prompt,
  });

  return response.text;
};