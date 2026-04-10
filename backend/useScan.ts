// hooks/useScan.ts
// ─── Drop this into your Next.js project and import it into ScanPage ──────────
// Usage:
//   const { scan, loading, error, report } = useScan();
//   await scan({ business_name, website_url, email_domain, owner_email });

import { useState } from "react";

export interface ScanInput {
  business_name: string;
  website_url: string;
  email_domain: string;
  owner_email: string;
}

export interface Finding {
  id: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  plain_english: string;
  fix_steps: string[];
  time_estimate: string;
}

export interface RavenReport {
  business_name: string;
  website_url: string;
  scan_date: string;
  risk_score: number;
  risk_level: "Critical" | "High" | "Medium" | "Low";
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  findings: Finding[];
  breach_detected: boolean;
  breach_details: string;
  email_sent: boolean;
  next_scan: string;
  summary_message: string;
}

export function useScan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<RavenReport | null>(null);

  const scan = async (input: ScanInput): Promise<RavenReport | null> => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      setReport(data);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { scan, loading, error, report };
}
