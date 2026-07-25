import express from "express";
import { Type } from "@google/genai";
import { getGeminiClient, generateContentWithRetry, parseGeminiJson, handleGeminiError } from "../lib/gemini";

export const tailorRouter = express.Router();

tailorRouter.post("/tailor-cv", async (req, res): Promise<any> => {
  try {
    const { cvText, cvFile, jobDescription, lang = "ar" } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required to customize the CV." });
    }

    const ai = getGeminiClient();
    let contentsParts: any[] = [];

    const systemInstruction =
      "You are an elite career development coach, technical CV writer, and layout architect. " +
      "Your objective is to tailor the applicant's CV precisely to match the provided Job Description. " +
      "Optimize keyword alignment, restructure summaries, highlight matching skills, and ensure experiences, projects, and achievements are phrased with powerful metrics relevant to the target job features.\n\n" +
      "LANGUAGE RULE:\n" +
      (lang === "en"
        ? "- Deliver all texts entirely in English."
        : "- Keep the matching analysis and changes made in Arabic.\n" +
          "- Keep the tailored CV in the language of the original CV, preferring English for technical/professional CVs.\n\n") +
      "CORE CONTENT REQUIREMENTS:\n" +
      "1. summary: Write a punchy, professional 3-4 line ATS-optimized career summary tailored specifically to the target job.\n" +
      "2. workExperience: Rephrase each bullet to emphasize responsibilities matching the job description, with strong active verbs and quantified metrics.\n" +
      "3. projects: Tailor projects to highlight methodologies, frameworks, and tools mentioned in the Job Description.\n" +
      "4. skills: Group into structured categories (no more than 4-5), prioritizing skills specified in the Job Description. CRITICAL: Classify 'TypeScript' and 'JavaScript' as Programming Languages.\n" +
      "5. Missing Info: Insert professional placeholders for any missing contact details.";

    if (cvFile && cvFile.data && cvFile.mimeType) {
      contentsParts.push({ inlineData: { mimeType: cvFile.mimeType, data: cvFile.data } });
    } else if (cvText) {
      contentsParts.push({ text: `Original CV Content:\n\n${cvText}\n` });
    } else {
      return res.status(400).json({ error: "CV text or CV file is required." });
    }

    contentsParts.push({ text: `Target Job Description:\n\n${jobDescription}\n\nPlease tailor the CV to perfectly match this Job Description.` });

    const workExpItem = {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING },
        company: { type: Type.STRING },
        period: { type: Type.STRING },
        bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["role", "company", "period", "bullets"]
    };
    const educationItem = {
      type: Type.OBJECT,
      properties: {
        degree: { type: Type.STRING },
        institution: { type: Type.STRING },
        period: { type: Type.STRING },
        details: { type: Type.STRING }
      },
      required: ["degree", "institution", "period"]
    };
    const skillsItem = {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING },
        items: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["category", "items"]
    };
    const projectItem = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        period: { type: Type.STRING },
        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        technologies: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "period", "bullets", "technologies"]
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
            tailoredCvData: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                professionalTitle: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                links: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING },
                workExperience: { type: Type.ARRAY, items: workExpItem },
                education: { type: Type.ARRAY, items: educationItem },
                skills: { type: Type.ARRAY, items: skillsItem },
                projects: { type: Type.ARRAY, items: projectItem },
                languages: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["fullName", "professionalTitle", "email", "phone", "location", "links", "summary", "workExperience", "education", "skills", "projects"]
            },
            changesMade: { type: Type.ARRAY, items: { type: Type.STRING } },
            alignmentScore: { type: Type.INTEGER },
            matchingAnalysis: { type: Type.STRING }
          },
          required: ["tailoredCvData", "changesMade", "alignmentScore", "matchingAnalysis"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response generated.");
    return res.json(parseGeminiJson(resultText));
  } catch (error: any) {
    console.error("POST /api/tailor-cv:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});
