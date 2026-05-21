// ============================================================
// AgroSat UZ — API Services
// NASA Earthdata + Sentinel Hub integratsiyasi
// ============================================================

const NASA_TOKEN = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImFncm9zYXR1eiIsImV4cCI6MTc4NDU0MjY4MywiaWF0IjoxNzc5MzU4NjgzLCJpc3MiOiJodHRwczovL3Vycy5lYXJ0aGRhdGEubmFzYS5nb3YiLCJpZGVudGl0eV9wcm92aWRlciI6ImVkbF9vcHMiLCJhY3IiOiJlZGwiLCJhc3N1cmFuY2VfbGV2ZWwiOjN9.bHujOUpcMhsfhD75FK41nmjz3QVdlH-E1suW1FYuarNDFhJUxRjKL6ukoPKyAsV3x26Ib_Z0Myg9HwyyX_8VRAteMKPKj-UrmnSQg-9gAScPPEXSCUl97mXKbk9pB3WOktkwhlCqsvWTh7SvSqfHwLRHBe_dTqK83QAng7c1eaVwdit_AhxpTQ7LeCArQPNEu39qpoN1saABa2UmZhvqtiCQ-PZ6Ac7Lx9wJAZ4deBn3_wtpPPzmrfmh0zgjzpbjMEpE3tJbdVAEiBikOOjxcbllEBnA-S5SxTEHBF1atShy9csinGbzn7NYKhtxDRpyuSXC_npdB66086uD5cu3oA";

const SENTINEL_CLIENT_ID = "e0c995ad-0601-44f3-b2c9-7d36061bb987";
const SENTINEL_CLIENT_SECRET = "UWB2pLUhKOc0lWyWXzv4vIjmWpsvKBM0";

// O'zbekiston bounding box
const UZ_BBOX = [55.998, 37.184, 73.148, 45.590];

// ─── Sentinel Hub token olish ───────────────────────────────
let sentinelToken = null;
let sentinelTokenExpiry = 0;

export async function getSentinelToken() {
  if (sentinelToken && Date.now() < sentinelTokenExpiry) return sentinelToken;
  const resp = await fetch(
    "https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${SENTINEL_CLIENT_ID}&client_secret=${SENTINEL_CLIENT_SECRET}`,
    }
  );
  const data = await resp.json();
  sentinelToken = data.access_token;
  sentinelTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return sentinelToken;
}

// ─── NASA FIRMS — Issiqlik nuqtalari (wildfire/heat) ────────
export async function fetchFIRMS(days = 7) {
  // FIRMS API — O'zbekiston hududi
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_TOKEN}/VIIRS_SNPP_NRT/${UZ_BBOX.join(",")}/7`;
  try {
    const resp = await fetch(url);
    const text = await resp.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return getMockFIRMS();
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
      const vals = line.split(",");
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = vals[i]?.trim());
      return {
        lat: parseFloat(obj.latitude),
        lng: parseFloat(obj.longitude),
        brightness: parseFloat(obj.bright_ti4 || obj.brightness),
        frp: parseFloat(obj.frp),
        date: obj.acq_date,
        confidence: obj.confidence,
      };
    }).filter(p => !isNaN(p.lat));
  } catch {
    return getMockFIRMS();
  }
}

// ─── NASA MODIS — NDVI (Ekin sog'liqi) ──────────────────────
export async function fetchNDVI() {
  // CMR API orqali MODIS NDVI granules
  const today = new Date();
  const monthAgo = new Date(today - 30 * 864e5);
  const fmt = d => d.toISOString().split("T")[0];
  const url = `https://cmr.earthdata.nasa.gov/search/granules.json?` +
    `short_name=MOD13A3&temporal=${fmt(monthAgo)},${fmt(today)}` +
    `&bounding_box=${UZ_BBOX.join(",")}&limit=5`;
  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${NASA_TOKEN}` }
    });
    const data = await resp.json();
    if (data.feed?.entry?.length) {
      return {
        source: "NASA MODIS MOD13A3",
        granules: data.feed.entry.length,
        latest: data.feed.entry[0]?.time_start,
        data: getMockNDVI() // Pixel data mockdan
      };
    }
    return { source: "Mock", data: getMockNDVI() };
  } catch {
    return { source: "Mock", data: getMockNDVI() };
  }
}

// ─── Sentinel Hub — EVI yoki True Color Image URL ───────────
export async function getSentinelImageURL(bbox, dateFrom, dateTo, type = "NDVI") {
  try {
    const token = await getSentinelToken();
    const evalscript = type === "NDVI" ? EVALSCRIPT_NDVI : EVALSCRIPT_TRUE_COLOR;
    const body = {
      input: {
        bounds: { bbox, properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" } },
        data: [{ type: "sentinel-2-l2a", dataFilter: { timeRange: { from: dateFrom, to: dateTo }, maxCloudCoverage: 30 } }]
      },
      output: { width: 512, height: 512, responses: [{ identifier: "default", format: { type: "image/png" } }] },
      evalscript
    };
    const resp = await fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (resp.ok) {
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    }
  } catch (e) {}
  return null;
}

const EVALSCRIPT_NDVI = `//VERSION=3
function setup() { return { input: ["B04","B08"], output: { bands: 4 } }; }
function evaluatePixel(s) {
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  if (ndvi < 0) return [0.2, 0.1, 0.1, 1];
  if (ndvi < 0.2) return [0.8, 0.7, 0.3, 1];
  if (ndvi < 0.4) return [0.4, 0.7, 0.2, 1];
  return [0.1, 0.5, 0.1, 1];
}`;

const EVALSCRIPT_TRUE_COLOR = `//VERSION=3
function setup() { return { input: ["B04","B03","B02"], output: { bands: 4 } }; }
function evaluatePixel(s) { return [2.5*s.B04, 2.5*s.B03, 2.5*s.B02, 1]; }`;

// ─── Mock ma'lumotlar (API ishlamasa) ────────────────────────
function getMockFIRMS() {
  const regions = [
    { lat: 41.299, lng: 69.240, name: "Toshkent" },
    { lat: 39.654, lng: 66.957, name: "Samarqand" },
    { lat: 40.112, lng: 65.357, name: "Buxoro" },
    { lat: 40.379, lng: 71.783, name: "Farg'ona" },
    { lat: 37.848, lng: 67.283, name: "Surxondaryo" },
    { lat: 42.460, lng: 59.610, name: "Qoraqalpog'iston" },
    { lat: 41.550, lng: 60.637, name: "Xorazm" },
  ];
  return regions.flatMap(r => Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => ({
    lat: r.lat + (Math.random() - 0.5) * 0.5,
    lng: r.lng + (Math.random() - 0.5) * 0.5,
    brightness: 300 + Math.random() * 100,
    frp: Math.random() * 50,
    date: new Date(Date.now() - Math.random() * 7 * 864e5).toISOString().split("T")[0],
    confidence: ["high", "nominal", "low"][Math.floor(Math.random() * 3)],
    region: r.name,
  })));
}

function getMockNDVI() {
  const regions = [
    { name: "Farg'ona vodiysi", ndvi: 0.72, area: 22000, trend: +2.3 },
    { name: "Toshkent viloyati", ndvi: 0.58, area: 15800, trend: +1.1 },
    { name: "Samarqand viloyati", ndvi: 0.61, area: 18500, trend: -0.8 },
    { name: "Sirdaryo viloyati", ndvi: 0.65, area: 12300, trend: +3.2 },
    { name: "Xorazm viloyati", ndvi: 0.43, area: 9800, trend: -2.1 },
    { name: "Qashqadaryo viloyati", ndvi: 0.52, area: 14200, trend: +0.5 },
    { name: "Surxondaryo viloyati", ndvi: 0.55, area: 11600, trend: -1.4 },
    { name: "Buxoro viloyati", ndvi: 0.31, area: 7500, trend: -3.8 },
    { name: "Navoiy viloyati", ndvi: 0.28, area: 6200, trend: -2.2 },
    { name: "Jizzax viloyati", ndvi: 0.48, area: 10100, trend: +1.7 },
    { name: "Andijon viloyati", ndvi: 0.69, area: 19400, trend: +2.8 },
    { name: "Namangan viloyati", ndvi: 0.66, area: 17300, trend: +1.5 },
  ];
  return regions;
}

export function getMockSeismic() {
  return [
    { lat: 41.28, lng: 69.35, magnitude: 2.1, depth: 12, date: "2025-05-18", region: "Toshkent" },
    { lat: 40.38, lng: 71.78, magnitude: 3.4, depth: 28, date: "2025-05-17", region: "Farg'ona" },
    { lat: 39.65, lng: 66.96, magnitude: 1.8, depth: 8, date: "2025-05-20", region: "Samarqand" },
    { lat: 37.85, lng: 67.28, magnitude: 4.2, depth: 45, date: "2025-05-15", region: "Surxondaryo", alert: true },
    { lat: 41.55, lng: 60.64, magnitude: 2.7, depth: 20, date: "2025-05-19", region: "Xorazm" },
    { lat: 40.11, lng: 65.36, magnitude: 1.5, depth: 6, date: "2025-05-21", region: "Buxoro" },
  ];
}

export function getMockKadastr() {
  return [
    { lat: 41.15, lng: 69.10, area: 45, type: "Noqonuniy qurilish", date: "2025-05-10", severity: "high", id: "KD-001" },
    { lat: 40.50, lng: 71.90, area: 120, type: "Noqonuniy dehqonchilik", date: "2025-05-08", severity: "medium", id: "KD-002" },
    { lat: 39.70, lng: 67.10, area: 230, type: "Sanoat obyekti", date: "2025-04-29", severity: "high", id: "KD-003" },
    { lat: 41.85, lng: 60.20, area: 680, type: "Cho'llanish", date: "2025-05-01", severity: "critical", id: "KD-004" },
    { lat: 40.85, lng: 72.35, area: 55, type: "Ko'chmas mulk", date: "2025-05-14", severity: "low", id: "KD-005" },
    { lat: 37.90, lng: 65.80, area: 340, type: "Noqonuniy qazish", date: "2025-05-03", severity: "critical", id: "KD-006" },
  ];
}

export function getMockWaste() {
  return [
    { lat: 41.32, lng: 69.45, type: "Maishiy chiqindi", volume: 120, date: "2025-05-19", status: "Yangi", id: "WS-001" },
    { lat: 40.42, lng: 71.65, type: "Sanoat chiqindi", volume: 450, date: "2025-05-15", status: "Tekshirilmoqda", id: "WS-002" },
    { lat: 39.58, lng: 66.80, type: "Kimyoviy chiqindi", volume: 85, date: "2025-05-17", status: "Xavfli", id: "WS-003" },
    { lat: 41.60, lng: 60.80, type: "Qurilish chiqindi", volume: 780, date: "2025-05-12", status: "Bartaraf etildi", id: "WS-004" },
    { lat: 40.95, lng: 65.20, type: "Maishiy chiqindi", volume: 200, date: "2025-05-20", status: "Yangi", id: "WS-005" },
    { lat: 38.10, lng: 67.50, type: "Tibbiy chiqindi", volume: 35, date: "2025-05-18", status: "Xavfli", id: "WS-006" },
  ];
}

export { getMockNDVI, getMockFIRMS };
