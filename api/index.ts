import express from "express";

const app = express();
app.use(express.json());

// In-memory storage for Vercel compatibility
// WARNING: Vercel serverless functions are stateless. This memory will reset on cold starts.
// For a production Vercel app, replace this with Vercel Postgres (@vercel/postgres) or Vercel KV.
let reports: any[] = [];
let nextId = 1;

app.post("/api/reports", (req, res) => {
  const { businessType, location, budget, score, reportText, mapLinks } = req.body;
  const newReport = {
    id: nextId++,
    business_type: businessType,
    location,
    budget,
    score,
    report_text: reportText,
    map_links: mapLinks,
    created_at: new Date().toISOString()
  };
  reports.unshift(newReport);
  res.json({ id: newReport.id });
});

app.get("/api/reports", (req, res) => {
  res.json(reports);
});

app.delete("/api/reports/:id", (req, res) => {
  reports = reports.filter(r => r.id !== parseInt(req.params.id));
  res.json({ success: true });
});

export default app;
