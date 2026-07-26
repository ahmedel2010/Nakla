import express from "express";
import { Type } from "@google/genai";
import { getGeminiClient, generateContentWithRetry, parseGeminiJson, handleGeminiError } from "../lib/gemini.js";

export const skillsGapRouter = express.Router();

skillsGapRouter.post("/analyze-skills-gap", async (req, res): Promise<any> => {
  try {
    const { cvText, cvFile, jobDescription, lang = "ar" } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required for skills gap analysis." });
    }

    const ai = getGeminiClient();
    let contentsParts: any[] = [];

    const systemInstruction =
      "You are a career consultant and skill development expert. " +
      "Your task is to perform a COMPREHENSIVE analysis of the candidate's CV against a Job Description to identify ALL significant technical and soft skill gaps. " +
      "Do not limit the output to a few items; provide the full list of missing requirements.\n\n" +
      "For each gap identified, provide a detailed description and recommend 2-3 FREE or highly accessible learning resources (official documentation, high-quality YouTube tutorials, free university courses, or open-source guides) with valid URLs.\n\n" +
      "LANGUAGE RULE:\n" +
      (lang === "en"
        ? "Deliver all analysis, skill names, and descriptions in English."
        : "Deliver all analysis, skill names, and descriptions in Arabic, while keeping technical terms in English where appropriate.\n\n") +
      "CRITICAL: Provide VALID, real-world URLs. Prefer FREE resources. Classify 'TypeScript' and 'JavaScript' as Programming Languages, NOT Frameworks.";

    if (cvFile && cvFile.data && cvFile.mimeType) {
      contentsParts.push({ inlineData: { mimeType: cvFile.mimeType, data: cvFile.data } });
    } else if (cvText) {
      contentsParts.push({ text: `Candidate CV:\n${cvText}` });
    }

    contentsParts.push({ text: `Job Description:\n${jobDescription}\n\nPlease perform a deep, comprehensive skills gap analysis identifying ALL missing skills.` });

    const response = await generateContentWithRetry(ai, {
      model: "gemini-1.5-pro",
      contents: contentsParts,
      config: {
        systemInstruction,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skill: { type: Type.STRING },
              importance: { type: Type.STRING, enum: ["high", "medium"] },
              description: { type: Type.STRING },
              resources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    provider: { type: Type.STRING },
                    url: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["course", "certification", "tutorial", "documentation"] }
                  },
                  required: ["name", "provider", "url", "type"]
                }
              }
            },
            required: ["skill", "importance", "description", "resources"]
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Failed to generate skills gap analysis.");
    return res.json(parseGeminiJson(resultText));
  } catch (error: any) {
    console.error("POST /api/analyze-skills-gap:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});
