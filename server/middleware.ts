import express from "express";
import compression from "compression";

export function applyMiddleware(app: express.Application) {
  app.use(compression({ threshold: 1024, level: 6 }));
  app.use(express.json({ limit: "50mb" }));

  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    next();
  });

  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
      return res.status(400).json({ error: "Invalid JSON payload." });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ error: "File too large. Maximum 50MB allowed." });
    }
    next();
  });
}
