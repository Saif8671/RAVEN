# RAVEN Full Scan Workflow Plan

## Goal
Build the end-to-end security workflow:

`Frontend Form -> /api/scan/full -> vulnScan + emailScan + breachScan -> scorer -> AI fix guide -> Supervity report workflow -> save + return report -> email workflow on demand`

This plan assumes the current backend modules stay as the core engine:
- `backend/vulnScanner.js`
- `backend/emailScan.js`
- `backend/passwordScan.js`
- `backend/scorer.js`
- `backend/aiFixGuide.js`
- `backend/scan.js`
- `raven-app-vite/src/lib/api.js`

## Current State
What already exists:
- `/api/scan/full` runs the three scans in parallel.
- Risk scoring already produces a `0-100` score plus a severity-bucketed finding list.
- AI fix guidance already returns a fallback guide and can call an external model when credentials exist.
- The frontend API client already knows how to call `/scan/full` and `/report/email`.

What still needs to be made complete:
- A reliable report lifecycle with persistence.
- A clearly defined Supervity workflow for the full report.
- A separate Supervity workflow for email delivery.
- Frontend screens and states that consume the live report response cleanly.

## Target Workflow
1. User submits the scan form on the frontend.
2. Frontend sends the payload to `/api/scan/full`.
3. Backend runs `vulnScan`, `emailScan`, and `breachScan` in parallel.
4. `scorer` converts raw scan output into a score, severity counts, and prioritized findings.
5. `aiFixGuide` turns findings into plain-English remediation guidance.
6. Supervity workflow 1 builds the full report from scan data and AI guidance.
7. The backend saves the report and returns it to the frontend.
8. When the user clicks Email, Supervity workflow 2 prepares and sends the report to the inbox.

## Phase 1: Lock the data contract
### Tasks
- Define the canonical request payload for `/api/scan/full`.
- Define the canonical response shape for:
  - `report`
  - `supervity`
  - `aiGuide`
  - email delivery response
- Make sure the frontend and backend use the same field names for:
  - `domain`
  - `email`
  - `business_name`
  - `website_url`
  - `findings`
  - `score`
  - `band`
  - `counts`

### Deliverables
- A documented payload/response contract in the repo.
- No ambiguity between "report data" and "workflow data".

### Acceptance Criteria
- The frontend can render a report without guessing missing fields.
- `/api/scan/full` response is stable and predictable.

## Phase 2: Harden the scan pipeline
### Tasks
- Keep the parallel scan execution in `/api/scan/full`.
- Add timeout and fallback handling around each scan module.
- Normalize scan failures so one failed sub-scan does not break the full report.
- Ensure each scan result includes enough context for scoring and reporting.

### Deliverables
- Reliable combined scan result object.
- Consistent error handling for partial failures.

### Acceptance Criteria
- One failed dependency does not prevent a report from being generated.
- The response still includes usable findings and next steps.

## Phase 3: Improve scoring and remediation
### Tasks
- Keep `scorer.js` as the single source of truth for the risk score.
- Verify all findings map to severity and deduction weights correctly.
- Make AI fix guidance reference the final scored findings, not raw scan fragments.
- Keep the fix guide chat-like, plain English, and business-friendly.

### Deliverables
- Final score calculation path.
- Prioritized fix guidance payload.

### Acceptance Criteria
- Every major issue contributes to the score and a visible finding.
- The fix guide reads like a usable action plan, not a technical dump.

## Phase 4: Build Supervity workflow 1
### Purpose
Create the full report generation workflow that turns scan output into a polished report.

### Tasks
- Define workflow input:
  - business identity
  - scan outputs
  - score bundle
  - AI fix guide
- Define workflow stages:
  - ingest scan data
  - summarize the business risk
  - classify findings
  - assemble narrative
  - generate report-ready JSON
  - produce a final report payload
- Keep the workflow deterministic enough that the frontend can trust the returned report shape.

### Deliverables
- A report-building workflow contract.
- A final report object that includes:
  - summary
  - score
  - findings
  - quick wins
  - incident playbook
  - attack story
  - source metadata

### Acceptance Criteria
- The workflow produces a complete report object every time.
- Report text is understandable for non-technical business users.

## Phase 5: Persist and return reports
### Tasks
- Store the generated report with a unique `reportId`.
- Keep a lookup endpoint for later retrieval.
- Decide whether storage is:
  - in-memory only for demo mode, or
  - durable storage for production
- Return the saved report immediately after generation.

### Deliverables
- Saved report lifecycle.
- `GET /api/report/:id` stays usable.

### Acceptance Criteria
- A report can be retrieved after generation.
- The frontend can show the report from the backend response without rebuilding it locally.

## Phase 6: Build Supervity workflow 2 for email
### Purpose
Send the final report to the user's inbox after they click Email.

### Tasks
- Define email workflow input:
  - `reportId`
  - recipient email
  - selected report snapshot
- Prepare email content from the stored report.
- Add delivery status tracking:
  - queued
  - sent
  - failed
- Keep the API response honest if delivery is only simulated in demo mode.

### Deliverables
- Email workflow endpoint.
- Clear inbox delivery response.

### Acceptance Criteria
- Clicking Email triggers the second workflow.
- The user gets a clear success or failure result.

## Phase 7: Frontend integration
### Tasks
- Wire the form to `runFullScan`.
- Replace any mock report rendering with live backend data.
- Render:
  - score
  - severity counts
  - findings
  - fix guide
  - incident playbook
  - attack story
- Add loading, empty, and error states.
- Add the email action to use `sendReportEmail`.

### Deliverables
- Frontend connected to live API data.
- A report page that reflects the backend response faithfully.

### Acceptance Criteria
- A user can submit the form, see the report, and send it by email.
- The UI handles backend failures gracefully.

## Phase 8: Testing and polish
### Tasks
- Verify the following flows end to end:
  - scan submission
  - full report generation
  - report retrieval
  - email delivery
- Add sample/demo data for the hackathon presentation.
- Polish wording and UI copy to keep the experience SMB-friendly.

### Deliverables
- Final QA checklist.
- Demo-ready workflow.

### Acceptance Criteria
- The app works reliably in a live demo.
- The report feels coherent from first scan to emailed output.

## Implementation Order
1. Finalize the data contract.
2. Harden the scan pipeline.
3. Polish scoring and AI fix guidance.
4. Implement Supervity workflow 1.
5. Persist and return reports.
6. Implement Supervity workflow 2 for email.
7. Wire the frontend to the live backend.
8. Test and polish the end-to-end flow.

## Suggested File Focus
- Backend orchestration: `backend/scan.js`
- Scoring: `backend/scorer.js`
- Fix guidance: `backend/aiFixGuide.js`
- Scan modules: `backend/vulnScanner.js`, `backend/emailScan.js`, `backend/passwordScan.js`
- Frontend API client: `raven-app-vite/src/lib/api.js`
- Report UI pages/components: `raven-app-vite/src/`

## Notes
- If Supervity integration is not available in the current environment, keep a deterministic fallback path so the demo still works.
- For the hackathon, prioritize a reliable live report over adding more scan types.
- Treat the emailed report as a second workflow, not just a resend of the first response.
