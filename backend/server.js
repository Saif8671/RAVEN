const express = require("express");
const cors = require("cors");
const scanRouter = require("./scan");

const app = express();
const port = Number(process.env.PORT) || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "raven-backend", time: new Date().toISOString() });
});

app.use("/api", scanRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`RAVEN backend listening on http://localhost:${port}`);
});

module.exports = app;
