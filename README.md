# 🌡️ homekit-temp-logger

A minimal, fully local macOS app that reads your HomeKit temperature sensor every 60 seconds and shows a live dashboard in your browser.

**No cloud. No subscriptions. No fuss.**

---

## What it does

- Reads temperature from any HomeKit temperature sensor (HomePod mini, Aqara, Eve, etc.)
- Logs a reading every 60 seconds to a local SQLite database
- Serves a dashboard at `http://localhost:3456`
- Auto-refreshes every 30 seconds
- Shows current temp, 24h min/max/avg, and a smooth line chart

---

## Requirements

| Tool | Check | Install |
|------|-------|---------|
| macOS 12+ | — | — |
| Xcode Command Line Tools | `xcode-select -p` | `xcode-select --install` |
| Node.js 18+ | `node -v` | [nodejs.org](https://nodejs.org) or `brew install node` |
| Homebrew (optional) | `brew -v` | [brew.sh](https://brew.sh) |

You must also have **at least one HomeKit temperature accessory** set up in the Home app on the same Mac (or iCloud account).

---

## Quick start (3 steps)

```bash
# 1. Clone and enter the project
git clone https://github.com/YOUR_USERNAME/homekit-temp-logger.git
cd homekit-temp-logger

# 2. Install Node dependencies
npm install

# 3. Start everything
node start.js
```

Then open **http://localhost:3456** in your browser.

> **First run**: macOS will ask you to grant Home access to Terminal (or your shell). Click **Allow** — this is required for the HomeKit reader to work.

---

## Folder structure

```
homekit-temp-logger/
├── scripts/
│   └── read_temp.swift        # Swift helper — reads HomeKit temperature
├── public/
│   └── index.html             # Dashboard (Chart.js, auto-refresh)
├── data/                      # Created automatically
│   └── temperatures.db        # SQLite database (gitignored)
├── logger.js                  # Polls HomeKit every 60s, writes to DB
├── server.js                  # Express server + JSON API
├── start.js                   # Launches logger + server together
├── com.homekit-temp-logger.plist  # Optional: run at login
├── package.json
└── .gitignore
```

---

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/readings?hours=24` | All readings for the last N hours |
| `GET /api/latest` | Most recent single reading |
| `GET /api/stats` | 24h min, max, avg, count |

---

## Run automatically at login (optional)

```bash
# 1. Edit the plist file — replace YOUR_USERNAME and paths
nano com.homekit-temp-logger.plist

# 2. Copy to LaunchAgents
cp com.homekit-temp-logger.plist ~/Library/LaunchAgents/

# 3. Load it
launchctl load ~/Library/LaunchAgents/com.homekit-temp-logger.plist
```

To stop the auto-start:
```bash
launchctl unload ~/Library/LaunchAgents/com.homekit-temp-logger.plist
```

Logs go to `/tmp/homekit-temp-logger.log` and `/tmp/homekit-temp-logger.err`.

---

## Troubleshooting

**"No temperature sensor found"**
- Open the Home app on this Mac and confirm a temperature sensor appears there.
- Make sure you're signed into the same Apple ID that owns the Home.
- The first time you run the logger, macOS may show a permission prompt — click Allow.

**Swift script is slow (~5-10 seconds)**
- Normal for the first read; HomeKit needs a moment to connect. Subsequent reads are faster.

**Port 3456 already in use**
- Change `PORT` at the top of `server.js` to any free port.

**Node not found in LaunchAgent**
- Run `which node` and paste the full path into the plist `ProgramArguments`.

---

## License

MIT — do whatever you like with it.
