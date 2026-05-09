#!/usr/bin/env node
// server.js — serves the dashboard and a JSON API for temperature data

const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const PORT = 3456;
const DB_PATH = path.join(__dirname, "data", "temperatures.db");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

// ── Open DB (read-only) ──────────────────────────────────────────────────────
let db;
try {
  db = new Database(DB_PATH, { readonly: true });
} catch {
  console.error("Database not found yet — start logger.js first, then re-run server.js");
  process.exit(1);
}

// ── API: last 24 hours of readings ───────────────────────────────────────────
app.get("/api/readings", (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const rows = db
    .prepare(
      "SELECT timestamp, celsius FROM readings WHERE timestamp >= ? ORDER BY timestamp ASC"
    )
    .all(since);

  res.json(rows);
});

// ── API: latest single reading ───────────────────────────────────────────────
app.get("/api/latest", (req, res) => {
  const row = db
    .prepare("SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1")
    .get();
  res.json(row || {});
});

// ── API: simple stats ────────────────────────────────────────────────────────
app.get("/api/stats", (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const stats = db
    .prepare(
      `SELECT
        ROUND(MIN(celsius),1) as min,
        ROUND(MAX(celsius),1) as max,
        ROUND(AVG(celsius),1) as avg,
        COUNT(*) as count
       FROM readings WHERE timestamp >= ?`
    )
    .get(since);
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🌡️  Dashboard running at http://localhost:${PORT}`);
});
