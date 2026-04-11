require("dotenv").config();
const express = require("express");
const cors = require("cors");

const vulnerabilityRoutes = require("./routes/vulnerability");
const emailSecurityRoutes = require("./routes/emailSecurity");
const breachRoutes = require("./routes/breach");
const phishingRoutes = require("./routes/phishing");
const incidentRoutes = require("./routes/incident");
const reportRoutes = require("./routes/report");
const scanScheduler = require("./services/scanScheduler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Routes
app.use("/api/vulnerability", vulnerabilityRoutes);
app.use("/api/email-security", emailSecurityRoutes);
app.use("/api/breach", breachRoutes);
app.use("/api/phishing", phishingRoutes);
app.use("/api/incident", incidentRoutes);
app.use("/api/report", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start scheduler
scanScheduler.init();

app.listen(PORT, () => {
  console.log(`CyberShield backend running on port ${PORT}`);
});
