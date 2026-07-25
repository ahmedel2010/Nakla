import express from "express";
import crypto from "crypto";
import { Type } from "@google/genai";
import { getGeminiClient, generateContentWithRetry, parseGeminiJson, handleGeminiError } from "../lib/gemini";
import { cvEvaluationCache } from "../lib/cache";

export const cvRouter = express.Router();

cvRouter.post("/evaluate-cv", async (req, res): Promise<any> => {
  try {
    const { cvText, cvFile, lang = "ar" } = req.body;

    const contentToHash = JSON.stringify({ cvText, cvFile, lang });
    const inputHash = crypto.createHash("sha256").update(contentToHash).digest("hex");

    if (cvEvaluationCache.has(inputHash)) {
      return res.json(cvEvaluationCache.get(inputHash));
    }

    const ai = getGeminiClient();
    let parts: any[] = [];

    const systemInstruction =
      "You are an expert HR Specialist and Technical Recruiter with 15+ years of experience in human resources and Applicant Tracking Systems (ATS).\n" +
      "Assess the given CV critically. Be realistic and precise. Provide constructive feedback.\n" +
      "Rate the CV on an ATS parsing scale of 0 to 100 based on keyword density, standard style and layout formatting, quantifiability of impacts, correct contact info structures, and clearly structured sections.\n" +
      "CRITICAL SCORING RULE FOR STRUCTURALLY PERFECT REMADE RESUMES:\n" +
      "- If the CV has clean structured sections (Professional Summary, Work Experience, Projects, Skills, Academic Education),\n" +
      "- If work experience and projects bullets begin with strong action verbs,\n" +
      "- If achievements are consistently quantified with realistic percentages and performance metrics (e.g. increases of 15%-40%, cost/time savings),\n" +
      "- If skills are neatly categorized and contain rich industry-relevant technical keywords, and the overall grammar/spelling is superb,\n" +
      "THEN this CV is in the top 1% of ATS candidates. You MUST award such resumes an outstanding top-tier score (typically between 88 to 98 out of 100) as they represent perfect compatibility, instead of penalizing them to average scores. If the CV text or PDF image is formatted this beautifully, grant it 90-97 out of 100.\n\n" +
      (lang === "en"
        ? "Please deliver all your text analysis, advice, and summaries entirely in English."
        : "If the CV is in Arabic, please deliver your text analysis and advice in Arabic. If it's in English or mixed, respond in Arabic but preserve necessary English technical/career keywords so the candidate knows exactly what to write.");

    if (cvFile && cvFile.data && cvFile.mimeType) {
      parts.push({ inlineData: { mimeType: cvFile.mimeType, data: cvFile.data } });
      parts.push({ text: "Please analyze this attached CV document (PDF or image) in detail for ATS optimization and provide the complete structured response." });
    } else if (cvText) {
      parts.push({ text: `Here is the plain text of the CV to analyze:\n\n${cvText}\n\nPlease perform standard ATS scoring and detailed breakdown.` });
    } else {
      return res.status(400).json({ error: "CV text or CV file attachment is required." });
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: parts,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "ATS compatibility score from 0 to 100." },
            summary: { type: Type.STRING, description: "Overall professional assessment of the CV." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key strengths found in this CV." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Weaknesses or missing elements." },
            grammarAndStyle: { type: Type.STRING, description: "Analysis of grammar, spelling, formatting, tone, and action verbs." },
            sectionsAnalysis: {
              type: Type.OBJECT,
              properties: {
                contactInfo: { type: Type.STRING, description: "Analysis of name, phone, email, LinkedIn, GitHub." },
                summary: { type: Type.STRING, description: "Review of professional summary." },
                experience: { type: Type.STRING, description: "Review of work experience section." },
                education: { type: Type.STRING, description: "Review of degree, dates, institutions." },
                skills: { type: Type.STRING, description: "Review of technology and technical keywords." }
              },
              required: ["contactInfo", "summary", "experience", "education", "skills"]
            },
            atsRecommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific actionable steps to score above 90." }
          },
          required: ["score", "summary", "strengths", "weaknesses", "grammarAndStyle", "sectionsAnalysis", "atsRecommendations"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response generated.");
    const parsedResult = parseGeminiJson(resultText);
    cvEvaluationCache.set(inputHash, parsedResult);
    return res.json(parsedResult);
  } catch (error: any) {
    console.error("POST /api/evaluate-cv:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});

cvRouter.post("/generate-corrected-cv", async (req, res): Promise<any> => {
  try {
    const { cvText, cvFile, lang = "ar" } = req.body;
    const ai = getGeminiClient();
    let parts: any[] = [];

    const systemInstruction =
      "You are an elite, world-class ATS specialist, professional recruiter, and executive resume architect. " +
      "Your goal is to parse the user's CV (text or file), identify ALL structural issues, grammatical/spelling mistakes, " +
      "lack of standard keywords, weak experience descriptions, or missing project entries, and generate a fully restructured, " +
      "100% optimized, and flawless version of their CV. It must represent a top-tier professional that stands out in any job application and scores 90-98 in ATS checkers.\n\n" +
      "LANGUAGE RULE:\n" +
      (lang === "en"
        ? "- Write the corrected CV and all field values entirely in English."
        : "- If the input CV was mostly in Arabic, write the corrected text and terms in Arabic.\n" +
          "- If the input CV was mostly in English, or a mix of Arabic and English, write the corrected version in English.\n\n") +
      "CORE CONTENT REQUIREMENTS:\n" +
      "1. Summary: Write an incredibly punchy, professional 3-4 line ATS-optimized career summary packed with strong keywords.\n" +
      "2. Work Experience: Rephrase each experience bullet point to start with a strong active verb and infuse quantified metrics/achievement percentages.\n" +
      "3. Projects: Rephrase and professionalize any projects ensuring they detail the architecture, tools used, and achievements.\n" +
      "4. Skills: Neatly group all technical and soft skills into structured categories. CRITICAL: Classify 'TypeScript' and 'JavaScript' as Programming Languages, NOT as Frameworks.\n" +
      "5. Missing Info: If any key contact details are missing, generate professional fallback placeholders.\n" +
      "6. Complete Correction: Ensure ALL weaknesses, grammar mistakes, and formatting gaps are thoroughly addressed.";

    if (cvFile && cvFile.data && cvFile.mimeType) {
      parts.push({ inlineData: { mimeType: cvFile.mimeType, data: cvFile.data } });
      parts.push({ text: "Please generate the completely optimized, corrected, and restructured version of this attached CV in JSON." });
    } else if (cvText) {
      parts.push({ text: `Here is the CV text:\n\n${cvText}\n\nPlease restructure and optimize it completely.` });
    } else {
      return res.status(400).json({ error: "CV text or CV file attachment is required." });
    }

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
      contents: parts,
      config: {
        systemInstruction,
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Failed to generate corrected CV.");
    return res.json(parseGeminiJson(resultText));
  } catch (error: any) {
    console.error("POST /api/generate-corrected-cv:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});
