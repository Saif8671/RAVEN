# RAVEN Implementation Plan

Source: `RAVEN_Verification_Document.docx`

## Goal
Build RAVEN, a small-business cybersecurity checker that accepts a business name, website URL, and email domain, then scans for exposure, computes a risk score, explains findings in plain English, and emails a report with fix steps.

## Product Scope
### Core V1
- Landing page with clear RAVEN branding and call to action
- Scan form for business name, website URL, and email domain
- Backend scan proxy to Supervity workflow
- Results page with score, findings, severity labels, and remediation steps
- Email delivery of the final report
- Weekly rescan support

### Stretch Goals
- Phishing simulation
- Incident response playbook
- Saved scan history dashboard
- Managed security service presentation

## Assumptions
- Supervity workflow endpoint is available and returns the schema described in the document.
- Email sending is handled by the workflow or an integrated service exposed through the workflow response.
- The first release focuses on the hackathon demo path, not production-grade multi-tenant security.
- The app will be built with Next.js, Tailwind, and deployed on Vercel.

## Success Criteria
- A user can enter company details and start a scan.
- The system returns a structured scan result with a risk score and findings.
- Findings are translated into non-technical language with specific fix steps.
- The owner receives a report by email.
- The UI works well on desktop and mobile.

## Workstreams

### 1. Product and UX
- Define the information architecture for:
  - `/`
  - `/scan`
  - `/results`
  - `/incident`
  - `/dashboard` optional
- Create the visual system for a dark RAVEN theme.
- Add scan states: idle, validating, running, completed, failed.
- Make the results page easy to scan quickly on mobile.

### 2. Frontend
- Build the landing page with:
  - Hero section
  - Value proposition
  - Security statistics
  - Feature overview
  - CTA to start a free scan
- Build the scan form with validation for:
  - Business name
  - Website URL
  - Email domain
  - Owner email
- Build the results page with:
  - Risk score card
  - Risk level badge
  - Findings list
  - Plain-English explanations
  - Step-by-step fix instructions
  - Report download or email confirmation state
- Build the incident response page for emergency guidance.

### 3. Backend Integration
- Implement `/api/scan` as a proxy to Supervity.
- Send multipart/form-data with the required fields:
  - `workflowId`
  - `inputs[business_name]`
  - `inputs[website_url]`
  - `inputs[email_domain]`
  - `inputs[owner_email]`
- Handle API errors cleanly and surface useful messages to the UI.
- Normalize the response into a stable frontend shape.

### 4. Workflow Validation
- Verify the Supervity workflow stages:
  - Input classification
  - Web vulnerability scan
  - Email security checks
  - Breach detection
  - Risk scoring
  - Plain-English translation
  - Fix guide generation
  - Report dispatch
- Confirm the returned JSON matches the documented schema.
- Test with at least one real website URL and email domain.

### 5. Quality and Deployment
- Validate responsive behavior on mobile and desktop.
- Add loading and success animations that support the scanning narrative.
- Deploy to Vercel.
- Do a final end-to-end test from form submit to email report.

## Delivery Plan

### Phase 1: Foundation
Deliverables:
- Next.js app scaffolded
- Tailwind configured
- RAVEN branding and dark theme established
- Base routing for core pages

Tasks:
- Initialize the app structure
- Set up global layout and styling
- Define shared UI components

### Phase 2: Scan Flow
Deliverables:
- Working scan form
- API proxy endpoint
- Mock or live scan state handling

Tasks:
- Build `/scan`
- Add client-side validation
- Implement `/api/scan`
- Connect the form to the API

### Phase 3: Results Experience
Deliverables:
- Results page showing:
  - score
  - risk level
  - findings
  - fix steps
  - email sent status

Tasks:
- Render API response
- Add severity badges and readable explanations
- Add empty/error/loading states

### Phase 4: Incident Response
Deliverables:
- Emergency playbook page

Tasks:
- Build `/incident`
- Capture business type and present a 60-minute recovery checklist

### Phase 5: Polish and Launch
Deliverables:
- Responsive UI
- Motion polish
- Vercel deployment
- Final test pass

Tasks:
- Refine typography and spacing
- Add subtle animations for scan progress and score reveal
- Run device checks
- Verify deployment settings

## Task Breakdown
1. Confirm the Supervity workflow contract.
2. Scaffold the Next.js app and Tailwind theme.
3. Build the landing page.
4. Build the scan form and `/api/scan`.
5. Build the results page.
6. Build the incident response page.
7. Wire live workflow responses into the UI.
8. Test error handling, responsiveness, and email delivery.
9. Deploy and perform final verification.

## Risks
- The workflow endpoint may return a schema different from the document.
- Email delivery may be delayed or require separate configuration.
- Some security checks may depend on third-party API limits or DNS propagation.
- The product may need fallback copy for unsupported scan results.

## Open Questions
- Is `workflowId` already known, or does it need to be discovered from Supervity?
- Should scan history be stored in a database for the dashboard, or kept out of V1?
- Is the incident response feature required for the demo, or only as a stretch goal?
- Should report delivery happen through the workflow or through the Next.js backend?

## Definition of Done
- All core pages are implemented and connected.
- A scan can be submitted and completed end to end.
- Results are understandable to a non-technical business owner.
- The owner receives a report email.
- The app is deployed and tested on Vercel.

