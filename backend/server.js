// CVEDB API Dashboard — backend proxy
// Keeps SHODAN_API_KEY server-side, adds CORS, rate limiting, input validation
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;
const COUNTRY = process.env.COUNTRY || 'KW';

if (!SHODAN_API_KEY) {
  console.error('✗ SHODAN_API_KEY missing in .env — exiting');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '32kb' }));

// tiny in-memory rate limiter (per IP, 30 req / 60s)
const hits = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const rec = hits.get(ip) || { n: 0, t: now };
  if (now - rec.t > 60_000) { rec.n = 0; rec.t = now; }
  rec.n++;
  hits.set(ip, rec);
  if (rec.n > 30) return res.status(429).json({ error: 'rate limit exceeded' });
  next();
});

// tiny in-memory cache (60s TTL)
const cache = new Map();
const cached = async (key, ttl, fn) => {
  const c = cache.get(key);
  if (c && Date.now() - c.t < ttl) return c.v;
  const v = await fn();
  cache.set(key, { v, t: Date.now() });
  return v;
};

app.get('/api/health', (_req, res) => res.json({ ok: true, version: '2.0.0', country: COUNTRY }));

app.get('/api/iot-devices', async (_req, res) => {
  try {
    const data = await cached('devices', 60_000, async () => {
      const r = await axios.get('https://api.shodan.io/shodan/host/search', {
        params: { key: SHODAN_API_KEY, query: `country:${COUNTRY}` },
        timeout: 15_000,
      });
      return r.data;
    });
    res.json(data);
  } catch (err) {
    console.error('iot-devices error:', err.message);
    res.status(502).json({ error: 'upstream fetch failed', detail: err.message });
  }
});

// strict CVE ID validation to prevent SSRF / path injection
const CVE_RX = /^CVE-\d{4}-\d{4,7}$/i;
app.get('/api/cve/:cve_id', async (req, res) => {
  const id = req.params.cve_id;
  if (!CVE_RX.test(id)) return res.status(400).json({ error: 'invalid CVE id format' });
  try {
    const data = await cached(`cve:${id}`, 600_000, async () => {
      const r = await axios.get(`https://api.shodan.io/cves/${encodeURIComponent(id)}`, {
        params: { key: SHODAN_API_KEY },
        timeout: 15_000,
      });
      return r.data;
    });
    res.json(data);
  } catch (err) {
    console.error('cve lookup error:', err.message);
    res.status(502).json({ error: 'upstream fetch failed', detail: err.message });
  }
});

app.listen(PORT, () => console.log(`✓ CVEDB backend v2 listening on :${PORT} (country:${COUNTRY})`));
