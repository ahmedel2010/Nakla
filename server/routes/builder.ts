import express from "express";
import { getGeminiClient, generateContentWithRetry, parseGeminiJson, handleGeminiError } from "../lib/gemini.js";

export const builderRouter = express.Router();

builderRouter.post("/builder-transform", async (req, res): Promise<any> => {
  try {
    const { type, text, title, lang = "ar" } = req.body;
    const ai = getGeminiClient();
    let prompt = "";

    if (type === "summary") {
      prompt = `You are a professional technical recruiter. Write an exceptionally high-impact, keyword-rich, and ATS-optimized professional summary (3-4 lines maximum) for a candidate with the professional title: "${title}". ${text ? `Base your writing on these raw user notes: "${text}"` : "Create a modern, inspiring general career summary from scratch."}. Write the response strictly in ${lang === "en" ? "English" : "Arabic"}. Output ONLY the summary text, do not add any quotes, markdown headers, or introductions. Keep it compact!`;
    } else if (type === "experience") {
      prompt = `You are an elite executive resume architect. Rewrite the following work duties/tasks: "${text}" for a "${title}" role.
      CRITICAL PERFORMANCE-DRIVEN RULES:
      1. Turn them into exactly 3-4 professional, punchy resume bullet points.
      2. Start every bullet point with a strong, active verb.
      3. CRITICAL: For every item, you MUST invent natural, highly realistic quantitative accomplishments.
      4. Write the results in ${lang === "en" ? "English" : "Arabic"}.
      5. Output ONLY a valid JSON array of strings. Do not wrap in backticks or Markdown. Output ONLY the pure JSON array.`;
    } else if (type === "project") {
      prompt = `You are a high-end CV project optimizer. Rewrite the following description of a portfolio project: "${text}" with title "${title}".
      1. Turn it into exactly 2 high-impact, action-verb professional bullet points.
      2. Start each bullet with a strong active verb explaining what was built, optimized or saved. Include realistic metrics.
      3. Write the results in ${lang === "en" ? "English" : "Arabic"}.
      4. Output ONLY a valid JSON array of strings. Output ONLY the raw JSON array.`;
    } else {
      return res.status(400).json({ error: "Invalid transform type." });
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: [{ text: prompt }]
    });

    let resText = (response.text || "").trim();
    if (resText.startsWith("```")) {
      resText = resText.replace(/^```jsons*/i, "").replace(/^```s*/, "").replace(/```s*$/, "").trim();
    }

    if (type === "experience" || type === "project") {
      try {
        return res.json({ result: parseGeminiJson(resText) });
      } catch {
        const bullets = resText.split("\n").map((l: string) => l.replace(/^[-*•\d.\s]*/, "").trim()).filter((l: string) => l.length > 0);
        return res.json({ result: bullets });
      }
    }

    return res.json({ result: resText });
  } catch (error: any) {
    console.error("POST /api/builder-transform:", error.message);
    return res.status(500).json({ error: handleGeminiError(error, req.body.lang || "ar") });
  }
});
