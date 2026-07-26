import express from "express";
import { PORT } from "./config.js";
import { applyMiddleware } from "./middleware.js";
import { applyStatic } from "./static.js";
import { cvRouter } from "./routes/cv.js";
import { tailorRouter } from "./routes/tailor.js";
import { builderRouter } from "./routes/builder.js";
import { interviewRouter } from "./routes/interview.js";
import { coverLetterRouter } from "./routes/cover-letter.js";
import { translateRouter } from "./routes/translate.js";
import { skillsGapRouter } from "./routes/skills-gap.js";
import { authRouter } from "./routes/auth.js";
import { supportRouter } from "./routes/support.js";

const app = express();

applyMiddleware(app);

app.use("/api", cvRouter);
app.use("/api", tailorRouter);
app.use("/api", builderRouter);
app.use("/api", interviewRouter);
app.use("/api", coverLetterRouter);
app.use("/api", translateRouter);
app.use("/api", skillsGapRouter);
app.use("/api", authRouter);
app.use("/api", supportRouter);

app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[API Error]:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// تشغيل Vite static server فقط في بيئة التطوير المحلية (Local Development)
// وتخطيه تماماً عند التشغيل على Vercel
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  await applyStatic(app);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

export default app;