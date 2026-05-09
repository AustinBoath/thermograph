#!/usr/bin/env node
// logger.js — reads HomeKit temperature every 60s, stores in SQLite

const { execFile } = require("child_process");
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "data", "temperatures.db");
const SWIFT_SCRIPT = path.join(__dirname, "scripts", "read_temp.swift");
const INTERVAL_MS = 60 * 1000; // 60 seconds

// ── Database setup ──────────────────────────────────────────────────────────
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT    NOT NULL,
    celsius   REAL    NOT NULL,
    source    TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_timestamp ON readings(timestamp);
`);

const insert = db.prepare(
  "INSERT INTO readings (timestamp, celsius, source) VALUES (?, ?, ?)"
);

// ── Read temperature via Swift helper ───────────────────────────────────────
function readTemperature(callback) {
  execFile("swift", [SWIFT_SCRIPT], { timeout: 15000 }, (err, stdout, stderr) => {
    if (err) {
      console.error(`[ERROR] Swift reader failed: ${stderr || err.message}`);
      return callback(null);
    }
    try {
      const data = JSON.parse(stdout.trim());
      callback(data);
    } catch (e) {
      console.error(`[ERROR] Could not parse output: ${stdout}`);
      callback(null);
    }
  });
}

// ── Log one reading ─────────────────────────────────────────────────────────
function logReading() {
  const ts = new Date().toISOString();
  readTemperature((data) => {
    if (!data) return;
    insert.run(ts, data.celsius, data.name);
    console.log(`[${ts}] ${data.celsius.toFixed(1)}°C  (${data.name})`);
  });
}

// ── Start ────────────────────────────────────────────────────────────────────
console.log("🌡️  HomeKit Temperature Logger started");
console.log(`   Database: ${DB_PATH}`);
console.log(`   Interval: ${INTERVAL_MS / 1000}s\n`);

logReading(); // immediate first reading
setInterval(logReading, INTERVAL_MS);
