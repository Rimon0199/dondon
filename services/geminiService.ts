import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Key for storing seen question hashes in localStorage
const SEEN_QUESTIONS_KEY = 'dhandhan_seen_questions';

const getSeenQuestions = (): string[] => {
  try {
    const stored = localStorage.getItem(SEEN_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSeenQuestions = (newHashes: string[]) => {
  try {
    const current = getSeenQuestions();
    const updated = [...new Set([...current, ...newHashes])]; // Unique set
    localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Storage full or error", e);
  }
};

// Simple hash function for questions to track uniqueness
const generateHash = (str: string): string => {
  let hash = 0, i, chr;
  if (str.length === 0) return hash.toString();
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

export const generateQuizQuestions = async (count: number = 10): Promise<Question[]> => {
  try {
    // Initialize Gemini AI Client right before making an API call as per SDK guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We intentionally ask for a few more to filter out duplicates if needed
    const requestCount = count + 3;
    
    // Using gemini-3-pro-preview for complex reasoning task of generating expert-level multiple choice questions
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate ${requestCount} EXTREMELY DIFFICULT, EXPERT-LEVEL multiple-choice quiz questions in Bengali (Bangla).
      
      CRITICAL INSTRUCTIONS:
      1. Difficulty: HARD. Questions must be obscure, challenging, and require deep knowledge. Avoid common facts.
      2. Topics: Advanced Science (Physics/Chemistry), Deep History (Specific dates/events), World Literature, Complex Geography, Ancient Civilizations.
      3. Format: 4 options, 1 correct.
      4. Avoid repetitive patterns.
      
      The output must be a JSON object containing an array of questions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The hard question text in Bengali"
                  },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of 4 options in Bengali"
                  },
                  correctAnswerIndex: {
                    type: Type.INTEGER,
                    description: "The index (0-3) of the correct answer"
                  }
                },
                required: ["question", "options", "correctAnswerIndex"]
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data returned from Gemini");
    }

    const data = JSON.parse(jsonText);
    const seenHashes = getSeenQuestions();
    const newQuestions: Question[] = [];
    const newHashes: string[] = [];

    // Filter and map
    for (const q of data.questions) {
      const qHash = generateHash(q.question.trim());
      
      // strict check: if we haven't seen this hash before
      if (!seenHashes.includes(qHash)) {
        newQuestions.push({
          id: qHash,
          question: q.question,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex
        });
        newHashes.push(qHash);
      }
      
      if (newQuestions.length >= count) break;
    }

    // Save the new hashes so they won't appear again
    saveSeenQuestions(newHashes);

    return newQuestions;

  } catch (error) {
    console.error("Error generating quiz:", error);
    // Fallback Hard Questions
    return [
      {
        id: "fallback_1",
        question: "১৯৫২ সালের ভাষা আন্দোলনে প্রথম শহীদ রফিকের পূর্ণ নাম কী ছিল?",
        options: ["রফিক উদ্দিন আহমেদ", "রফিকুল ইসলাম", "রফিক জব্বার", "আব্দুর রফিক"],
        correctAnswerIndex: 0
      },
      {
        id: "fallback_2",
        question: "মানুষের ডিএনএ-তে (DNA) নাইট্রোজেন বেস 'অ্যাডিনিন' এর সাথে কোনটি যুক্ত থাকে?",
        options: ["গুয়ানিন", "সাইটোসিন", "থাইমিন", "ইউরাসিল"],
        correctAnswerIndex: 2
      },
      {
        id: "fallback_3",
        question: "মহাস্থানগড় কোন নদীর তীরে অবস্থিত?",
        options: ["করতোয়া", "পদ্মা", "মেঘনা", "আত্রাই"],
        correctAnswerIndex: 0
      }
    ];
  }
};
