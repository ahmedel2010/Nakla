import express from "express";
import { Type } from "@google/genai";
import { getGeminiClient, generateContentWithRetry, parseGeminiJson, handleGeminiError } from "../lib/gemini.js";

export const interviewRouter = express.Router();

interviewRouter.post("/generate-questions", async (req, res): Promise<any> => {
  try {
    const { jobDescription, cvText, cvFile, lang = "ar" } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required to generate interview questions." });
    }

    const ai = getGeminiClient();
    let contentsParts: any[] = [];

    const systemInstruction =
      "You are an elite Tech Interviewer and Career Coach. " +
      "Your objective is to generate a comprehensive, two-part interview preparation guide based on the Job Description and the candidate's CV.\n\n" +
      "STRUCTURE:\n" +
      "1. 'technicalRoadmap': Analyze the Job Description to infer the precise professional role and generate a LARGE and DEEP set of technical questions (minimum 10-12 questions) covering all foundational and advanced topics expected for this role.\n\n" +
      "2. 'experienceBased': Analyze the candidate's CV and generate questions (minimum 6-8) that target their actual projects, architectural choices, and work scenarios.\n\n" +
      "Provide complete explanations including why asked, answer strategy, and a high-impact Model Answer.\n" +
      (lang === "en"
        ? "Respond entirely in English."
        : "Respond entirely in Arabic, but keep technical terms, code snippets, and framework names in English.");

    if (cvFile && cvFile.data && cvFile.mimeType) {
      contentsParts.push({ inlineData: { mimeType: cvFile.mimeType, data: cvFile.data } });
      contentsParts.push({ text: "Candidate CV context is supplied above." });
    } else if (cvText) {
      contentsParts.push({ text: `Candidate CV Context:\n\n${cvText}\n` });
    }

    contentsParts.push({ text: `Target Job Description:\n\n${jobDescription}\n\nPlease generate the two-part interview prep guide.` });

    const questionItem = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        topic: { type: Type.STRING },
        question: { type: Type.STRING },
        whyAsked: { type: Type.STRING },
        answerStrategy: { type: Type.STRING },
        modelAnswer: { type: Type.STRING }
      },
      required: ["id", "topic", "question", "whyAsked", "answerStrategy", "modelAnswer"]
    };
    const expItem = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        category: { type: Type.STRING },
        question: { type: Type.STRING },
        whyAsked: { type: Type.STRING },
        answerStrategy: { type: Type.STRING },
        modelAnswer: { type: Type.STRING }
      },
      required: ["id", "category", "question", "whyAsked", "answerStrategy", "modelAnswer"]
    };

    const response = await generateContentWithRetry(ai, {
      model: "gemini-1.5-pro",
      contents: contentsParts,
      config: {
        systemInstruction,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedRole: { type: Type.STRING },
            technicalRoadmap: { type: Type.ARRAY, items: questionItem },
            experienceBased: { type: Type.ARRAY, items: expItem }
          },
          required: ["detectedRole", "technicalRoadmap", "experienceBased"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response generated.");
    return res.json(parseGeminiJson(resultText));
  } catch (error: any) {
    console.error("POST /api/generate-questions:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});

interviewRouter.post("/evaluate-answer", async (req, res): Promise<any> => {
  try {
    const { question, modelAnswer, userAnswer, lang = "ar" } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: "الرجاء إدخال السؤال وإجابتك لتقييمها." });
    }

    const ai = getGeminiClient();

    const systemInstruction =
      "You are an expert HR Specialist, Executive Recruiter, and Technical Interview Coach. " +
      "Your goal is to evaluate the user's draft answer for a specific interview question. " +
      "Provide a highly professional evaluation with constructive, encouraging, and detailed feedback. " +
      "Rate the answer score from 0 to 100 based on: Action verbs, inclusion of real achievements or metrics, and structure, clarity, and grammatical professionalism. " +
      "Draft a restructured and optimized version of their response (suggestedSpicedAnswer) they can use in their real interview. " +
      (lang === "en"
        ? "Keep the language entirely in English."
        : "Keep the language entirely in Arabic.");

    const promptText = `
Interview Question: "${question}"
Model Answer Guide: "${modelAnswer || "N/A"}"
User's Draft Answer to evaluate: "${userAnswer}"

Please analyze and rate the performance. Output a JSON object containing the evaluation.
`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [{ text: promptText }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedSpicedAnswer: { type: Type.STRING }
          },
          required: ["score", "strengths", "improvements", "suggestedSpicedAnswer"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response generated.");
    return res.json(parseGeminiJson(resultText));
  } catch (error: any) {
    console.error("POST /api/evaluate-answer:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});
