# CVEDB API Dashboard — Kuwait IoT Exposure Monitor

Fetches internet-exposed IoT devices located in Kuwait via the Shodan API and correlates them with CVE vulnerability data from the Shodan CVEDB API. Built by Ali AlEnezi ([@SiteQ8](https://github.com/SiteQ8)).

## Overview

Kuwait's external IoT attack surface — industrial controllers, routers, cameras, printers, IPMI interfaces, OT devices — is a recurring blind spot for defenders. This dashboard gives a live, filterable view of what Shodan sees in `country:KW`, with CVE overlays so you can triage which exposed devices carry known exploitable vulnerabilities.

## Features

- **Kuwait IoT device inventory** — pulls `country:KW` from Shodan
- **CVE correlation** — per-device vulnerability tags, severity color-coded (Critical/High/Medium/Low by CVSS)
- **Stat tiles** — device count, unique ports, product diversity, total CVE exposure
- **Live filter** — IP / product / port / org full-text search
- **CVE lookup tool** — query any CVE ID directly against CVEDB for summary + CVSS
- **Dark ops-center GUI** — single-file `docs/index.html`, no build step, runs straight from GitHub Pages
- **Node.js backend** — Express proxy to Shodan API (keeps API key server-side)

## Architecture

```
┌──────────────┐   HTTPS    ┌────────────┐   HTTPS    ┌────────────┐
│ docs/index   │ ─────────▶ │  backend/  │ ─────────▶ │   Shodan   │
│ .html (GUI)  │            │  Express   │            │   CVEDB    │
└──────────────┘            └────────────┘            └────────────┘
```

Frontend is a static single-file dashboard. Backend is a thin Express proxy that keeps the `SHODAN_API_KEY` off the client.

## Project Structure

```
cvedb-api-dashboard/
├── backend/
│   ├── server.js          # Express proxy: /api/iot-devices, /api/cve/:id
│   ├── package.json
│   └── .env               # SHODAN_API_KEY=...  (create this)
├── frontend/              # Legacy React frontend (optional)
│   └── src/
│       ├── App.js
│       └── DeviceList.js
├── docs/
│   ├── index.html         # NEW: single-file dashboard GUI
│   └── img/               # screenshots
└── README.md
```

## Quick Start

### 1. Backend

```bash
cd backend
npm install
echo "SHODAN_API_KEY=your_key_here" > .env
node server.js
# → Server running on port 5000
```

### 2. Dashboard

Open `docs/index.html` directly in a browser, or serve the folder:

```bash
cd docs && python3 -m http.server 8080
# → http://localhost:8080
```

In the dashboard, confirm the backend URL (`http://localhost:5000` by default) and click **▶ FETCH**.

## Screenshots

Drop PNGs into `docs/img/` and they will render below on GitHub.

| | |
|---|---|
| **Dashboard Overview** | ![dashboard](docs/img/dashboard.png) |
| **Device Inventory Table** | ![devices](docs/img/devices.png) |
| **CVE Lookup** | ![cve](docs/img/cve.png) |

## API Endpoints (Backend)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/iot-devices` | Shodan `country:KW` host search |
| `GET` | `/api/cve/:cve_id` | CVEDB lookup by CVE identifier |

## Configuration

`.env` in `backend/`:

```
SHODAN_API_KEY=<your shodan api key>
PORT=5000
```

Get a Shodan API key at https://account.shodan.io.

## Security Notes

- API key stays on the backend — never exposed to the browser
- Dashboard does **not** persist device data; each FETCH is a fresh query
- Intended for defensive / authorized reconnaissance of your own or in-scope assets only
- Respect Shodan's rate limits and terms of service

## Roadmap

- [ ] Historical trending (daily snapshot diffs)
- [ ] Sector tagging (banking / telecom / gov / ICS)
- [ ] Export CSV / STIX 2.1
- [ ] Extend to full GCC (SA, AE, QA, BH, OM)
- [ ] Alert rules on new CVE appearances

## License

MIT — © 2026 Ali AlEnezi
