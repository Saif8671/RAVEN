# RAVEN — Backend Integration Guide

## Project Structure

Depending on your Next.js version, use ONE of these API routes:

```
your-nextjs-project/
│
├── .env.local                       ← your secrets (never commit this)
├── .env.example                     ← template to share with team
│
├── hooks/
│   └── useScan.ts                   ← React hook for frontend → API calls
│
├── app/                             ← IF you have an `app/` folder (App Router)
│   └── api/
│       └── scan/
│           └── route.ts             ← USE THIS FILE
│
└── pages/                           ← IF you have a `pages/` folder (Pages Router)
    └── api/
        └── scan.ts                  ← USE THIS FILE
```

---

## Step 1 — Which router am I using?

Open your project root. If you see:
- An **`app/`** folder → you're on **App Router** → use `app/api/scan/route.ts`
- A **`pages/`** folder → you're on **Pages Router** → use `pages/api/scan.ts`
- Both folders → use **App Router** (`app/api/scan/route.ts`)

---

## Step 2 — Set up environment variables

Create a `.env.local` file in your project root:

```bash
SUPERVITY_WORKFLOW_ID=paste_your_workflow_id_here
SUPERVITY_BEARER_TOKEN=paste_your_bearer_token_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Where to find these values in Supervity:

**SUPERVITY_WORKFLOW_ID:**
1. Open your RAVEN workflow in Supervity
2. Look at the URL: `.../workflows/YOUR_WORKFLOW_ID/...`
3. Or go to workflow Settings → copy the Workflow ID

**SUPERVITY_BEARER_TOKEN:**
1. In Supervity → top-right avatar → Settings → API Keys
2. Generate a new key or copy an existing one
3. Paste the full token (usually starts with `Bearer ` — paste only the token part, not the word "Bearer")

---

## Step 3 — Copy the files

```bash
# App Router
cp route.ts your-project/app/api/scan/route.ts

# Pages Router  
cp scan.ts your-project/pages/api/scan.ts

# Hook (works with both)
cp useScan.ts your-project/hooks/useScan.ts
```

---

## Step 4 — Wire the hook into ScanPage

Replace the mock `setTimeout` simulation in your frontend's `ScanPage` with this:

```tsx
import { useScan } from "@/hooks/useScan";

function ScanPage({ setPage, setReport }) {
  const { scan, loading, error } = useScan();

  const runScan = async () => {
    if (!form.business_name || !form.website_url ||
        !form.email_domain || !form.owner_email) return;

    setStep("scanning");

    const result = await scan({
      business_name: form.business_name,
      website_url: form.website_url,
      email_domain: form.email_domain,
      owner_email: form.owner_email,
    });

    if (result) {
      setReport(result);   // pass real report up to parent App
      setPage("results");
    } else {
      setStep("form");     // error — go back to form
      // error message is available via `error` from useScan()
    }
  };

  // ... rest of your ScanPage
}
```

Pass `report` as a prop to `ResultsPage` instead of the mock `MOCK_REPORT`:

```tsx
// In App root:
const [report, setReport] = useState(null);

{page === "scan" && <ScanPage setPage={setPage} setReport={setReport} />}
{page === "results" && <ResultsPage report={report} />}
```

---

## Step 5 — Test locally

```bash
npm run dev
# Open http://localhost:5173
# Navigate to /scan, fill in a real domain, submit
# Check your terminal for [RAVEN] log lines
```

**Test the API directly with curl:**

```bash
curl -X POST http://127.0.0.1:8788/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Test Business",
    "website_url": "https://example.com",
    "email_domain": "example.com",
    "owner_email": "you@example.com"
  }'
```

Expected response shape:
```json
{
  "business_name": "Test Business",
  "risk_score": 42,
  "risk_level": "High",
  "total_issues": 5,
  "findings": [...],
  "breach_detected": false,
  "email_sent": true,
  "next_scan": "2026-04-17T..."
}
```

---

## Step 6 — Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Then in **Vercel Dashboard → Project → Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `SUPERVITY_WORKFLOW_ID` | your workflow ID |
| `SUPERVITY_BEARER_TOKEN` | your bearer token |
| `ALLOWED_ORIGINS` | `https://your-vercel-url.vercel.app` |

---

## Error Reference

| Error from /api/scan | Meaning | Fix |
|---------------------|---------|-----|
| `Server misconfiguration` | Missing env vars | Check `.env.local` |
| `Missing or invalid field: X` | Form validation failed | Check all 4 fields are filled |
| `Supervity timed out` | Workflow took >2 min | Check Supervity agent config |
| `Supervity 401` | Bad bearer token | Re-copy token from Supervity |
| `Supervity 404` | Wrong workflow ID | Re-copy workflow ID |
| `Cannot parse Supervity response` | Agent 8 output format wrong | Check Agent 8 prompt JSON output |

---

## Supervity Response Debugging

If you see "Cannot parse Supervity response", add this temporary debug line in your API route inside `parseJSON()`:

```ts
console.log("[RAVEN DEBUG] Raw response:", raw.slice(0, 500));
```

This tells you exactly what Supervity is returning so you can adjust Agent 8's output format.

The API route handles these common Supervity wrapper formats automatically:
- `{ "output": "<json string>" }` ← most common
- `{ "result": "<json string>" }`
- `{ "data": { ... } }`
- Raw JSON object directly
