import express from "express";
import { Type } from "@google/genai";
import { getGeminiClient, generateContentWithRetry, parseGeminiJson, handleGeminiError } from "../lib/gemini.js";

export const translateRouter = express.Router();

translateRouter.post("/translate-cv", async (req, res): Promise<any> => {
  try {
    const { cvText, cvFile, targetLang = "English" } = req.body;

    if (!cvText && !cvFile) {
      return res.status(400).json({ error: "Raw CV text or uploaded CV document is required." });
    }

    const ai = getGeminiClient();
    let contentsParts: any[] = [];

    const systemInstruction =
      "You are an expert bilingual recruiter, credential evaluator, and professional translator. " +
      `Your task is to translate the user's CV (text or file) into ${targetLang}. ` +
      "Maintain the high-impact recruiting standard of the document while ensuring perfect fluency and correctness in the target language.\n\n" +
      "TRANSLATION RULES:\n" +
      `1. Translate the entire CV into beautifully styled ${targetLang}. All fields in the response schema MUST be in ${targetLang}.\n` +
      "2. Preserve metrics: Ensure all achievement metrics, numbers, percentages, and KPIs are accurately kept.\n" +
      "3. Strong active verbs: Use powerful, industry-standard action verbs in the target language.\n" +
      "4. Professional equivalents: Use standard corporate/technical/academic translations.\n" +
      "5. Preserve URLs & technical brands: Keep GitHub/LinkedIn links and platform/brand names in their standard representation.\n" +
      "6. Missing fields: If certain sections are missing, return empty arrays.\n" +
      "7. Complete translation: Do not skip elements or truncate text.";

    if (cvFile && cvFile.data && cvFile.mimeType) {
      contentsParts.push({ inlineData: { mimeType: cvFile.mimeType, data: cvFile.data } });
      contentsParts.push({ text: `Please read this CV document and translate it into ${targetLang}.` });
    } else if (cvText) {
      contentsParts.push({ text: `Here is the CV text:\n\n${cvText}\n\nPlease translate it fully into ${targetLang}.` });
    }

    const workExpItem = {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING }, company: { type: Type.STRING }, period: { type: Type.STRING },
        bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["role", "company", "period", "bullets"]
    };

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: contentsParts,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedCvData: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                professionalTitle: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                links: { type: Type.ARRAY, items: { type: Type.STRING } },
                summary: { type: Type.STRING },
                sectionTitles: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING }, experience: { type: Type.STRING },
                    education: { type: Type.STRING }, skills: { type: Type.STRING },
                    projects: { type: Type.STRING }, languages: { type: Type.STRING }
                  },
                  required: ["summary", "experience", "education", "skills"]
                },
                workExperience: { type: Type.ARRAY, items: workExpItem },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { degree: { type: Type.STRING }, institution: { type: Type.STRING }, period: { type: Type.STRING }, details: { type: Type.STRING } },
                    required: ["degree", "institution", "period"]
                  }
                },
                skills: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { category: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                    required: ["category", "items"]
                  }
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING }, period: { type: Type.STRING },
                      bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                      technologies: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "period", "bullets", "technologies"]
                  }
                },
                languages: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["fullName", "professionalTitle", "email", "phone", "location", "links", "summary", "workExperience", "education", "skills", "projects"]
            },
            translationNotes: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["translatedCvData", "translationNotes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response generated.");
    return res.json(parseGeminiJson(resultText));
  } catch (error: any) {
    console.error("POST /api/translate-cv:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});
