import express from "express";
import { PORT } from "./config";
import { applyMiddleware } from "./middleware";
import { applyStatic } from "./static";
import { cvRouter } from "./routes/cv";
import { tailorRouter } from "./routes/tailor";
import { builderRouter } from "./routes/builder";
import { interviewRouter } from "./routes/interview";
import { coverLetterRouter } from "./routes/cover-letter";
import { translateRouter } from "./routes/translate";
import { skillsGapRouter } from "./routes/skills-gap";
import { authRouter } from "./routes/auth";
import { supportRouter } from "./routes/support";

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

await applyStatic(app);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
});
