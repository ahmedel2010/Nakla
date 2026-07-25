import express from "express";
import { getGeminiClient, generateContentWithRetry, handleGeminiError } from "../lib/gemini";

export const coverLetterRouter = express.Router();

coverLetterRouter.post("/generate-cover-letter", async (req, res): Promise<any> => {
  try {
    const { jobDescription, cvText, cvFile, lang = "ar", targetLang } = req.body;

    if (!jobDescription || (!cvText && !cvFile)) {
      return res.status(400).json({ error: "Job description and CV (text or file) are required." });
    }

    const ai = getGeminiClient();
    const outputLanguage = targetLang || (lang === "en" ? "English" : "Arabic");

    const systemInstruction =
      "You are a world-class career consultant and professional writer. " +
      "Your task is to write a highly persuasive, professional, and personalized Cover Letter that perfectly matches the candidate's CV to the specific Job Description. " +
      "The letter should be structured with: A strong opening hook, 2-3 body paragraphs highlighting matching skills and past achievements with metrics, and a professional closing and call to action. " +
      "Tone: Confident, professional, and enthusiastic. " +
      `Deliver the entire response in ${outputLanguage} in an outstanding, professional, and elegant manner.`;

    let parts: any[] = [];

    if (cvFile && cvFile.data && cvFile.mimeType) {
      parts.push({ inlineData: { mimeType: cvFile.mimeType, data: cvFile.data } });
      parts.push({ text: `Job Description to match:\n"""
${jobDescription}
"""
Please write a custom cover letter. Do NOT use fake names; use [Your Name] as a placeholder if the name isn't clear from the CV.` });
    } else {
      parts.push({ text: `Job Description:\n"""
${jobDescription}
"""

Candidate CV Content:\n"""
${cvText}
"""

Please write a custom cover letter. Do NOT use fake names; use [Your Name] as a placeholder.` });
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-1.5-pro",
      contents: parts,
      config: { systemInstruction, temperature: 0 }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response generated.");
    return res.json({ coverLetter: resultText });
  } catch (error: any) {
    console.error("POST /api/generate-cover-letter:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});
