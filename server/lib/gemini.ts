import { GoogleGenAI } from "@google/genai";

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateContentWithRetry = async (
  ai: any,
  params: { model: string; contents: any; config?: any },
  retries = 4,
  delayMs = 1500
): Promise<any> => {
  const modelsToTry = [
    params.model,
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        attempt++;

        const status = err.status || (err.error && err.error.status) || "";
        const code = err.code || (err.error && err.error.code) || 0;
        const msg = err.message || JSON.stringify(err);

        const isTemporary =
          status === "UNAVAILABLE" ||
          code === 503 ||
          code === 429 ||
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("spike") ||
          msg.includes("Resource has been exhausted") ||
          msg.includes("overloaded") ||
          msg.includes("429") ||
          msg.toLowerCase().includes("quota") ||
          msg.toLowerCase().includes("rate limit") ||
          msg.toLowerCase().includes("resource_exhausted");

        if (isTemporary && attempt < retries) {
          const backoff = delayMs * Math.pow(2, attempt) + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, backoff));
        } else {
          break;
        }
      }
    }
  }
  throw lastError || new Error("Failed to process request after exhausting all model fallbacks.");
};

export const parseGeminiJson = (text: string) => {
  let s = text.trim();
  if (s.startsWith("```json")) {
    s = s.slice(7).trim();
    if (s.endsWith("```")) s = s.slice(0, -3).trim();
  } else if (s.startsWith("```")) {
    s = s.slice(3).trim();
    if (s.endsWith("```")) s = s.slice(0, -3).trim();
  }
  return JSON.parse(s);
};

export const handleGeminiError = (error: any, lang = "ar"): string => {
  const errMsg = error.message || JSON.stringify(error) || "";
  const e = errMsg.toLowerCase();

  if (e.includes("503") || e.includes("unavailable") || e.includes("high demand") || e.includes("overloaded") || e.includes("temporary")) {
    return lang === "ar"
      ? "يعاني النموذج حالياً من ضغط مرتفع مؤقت. يرجى الانتظار وإعادة المحاولة."
      : "The model is currently under high demand. Please wait and try again.";
  }

  if (e.includes("quota") || e.includes("rate_limit") || e.includes("429") || e.includes("resource_exhausted") || e.includes("limit exceeded")) {
    return lang === "ar"
      ? "لقد تجاوزت حد الاستخدام المؤقت. يرجى الانتظار دقيقة واحدة ثم المحاولة مجدداً."
      : "You have temporarily exceeded the usage limit. Please wait one minute and try again.";
  }

  if (e.includes("api_key_invalid") || (e.includes("api key") && e.includes("invalid"))) {
    return lang === "ar"
      ? "مفتاح الـ API غير صالح أو منتهي الصلاحية."
      : "The API key is invalid or expired.";
  }

  return lang === "ar"
    ? `عذراً، حدث خطأ في المعالجة: ${error.message || "خطأ غير متوقع"}`
    : `Processing failed: ${error.message || "An unexpected error occurred"}`;
};
