# RAVEN Sprint Implementation Guide

## Sprint 0: Foundation (Now - Next 24 Hours)

### Task 0.1: Document API Contracts
**File**: Create `docs/API_CONTRACT.md`
**Status**: ✅ IN PROGRESS

### Task 0.2: Create Backend Report Store
**File**: Create `backend/reportStore.js`
**Purpose**: Persistent in-memory storage with file fallback
**What to include**:
- saveReport(report) - returns reportId
- getReport(reportId) - returns report or null
- listReports() - returns all reports
- Clear on timeout for demo

### Task 0.3: Verify Scan Pipeline
**File**: Review `backend/scan.js`
**Checklist**:
- ✅ Parallel timeout (30s) per scan
- ✅ Fallback handling for failed scans
- ✅ Response normalization

## Sprint 1: Backend Hardening (Next 2-3 Days)

### Task 1.1: Create Supervity Handler
**File**: Create `backend/supervity.js`
**Purpose**: Build 5-agent workflow for reports
**Exports**:
- buildSupervityReport(domain, score, findings, aiGuide)

### Task 1.2: Enhance Report Generation
**File**: Update `backend/scan.js`
**Changes**:
- Import and use reportStore
- Call supervity handler
- Return complete report payload

### Task 1.3: Create Email Service
**File**: Create `backend/emailService.js`
**Purpose**: Format and send/simulate email delivery
**Exports**:
- formatReportEmail(report)
- sendReportEmail(email, report) - logs or sends

## Sprint 2: Frontend Components (Days 4-7)

### Task 2.1: Create Scan Form Component
**File**: Create `raven-app-vite/src/components/ScanForm.jsx`
**Features**:
- Input fields: domain, email, business_name
- Submit handler calls runFullScan()
- Loading state
- Error display

### Task 2.2: Create Report Display Component
**File**: Create `raven-app-vite/src/components/ReportDisplay.jsx`
**Shows**:
- Score badge (0-100)
- Severity counts
- Findings list with severity colors
- Quick wins section
- Email button

### Task 2.3: Create Pages
**Files**:
- `raven-app-vite/src/pages/ScanPage.jsx` - Form + Loading
- `raven-app-vite/src/pages/ReportPage.jsx` - Full report display
- `raven-app-vite/src/pages/HistoryPage.jsx` - Past scans

### Task 2.4: Wire API Integration
**File**: Update `raven-app-vite/src/lib/api.js`
**Add**:
- Error handling
- Retry logic
- Response validation

## Sprint 3: Testing & Polish (Days 8-10)

### Task 3.1: End-to-End Flows
**Test Cases**:
- Form submit → Scan → Report display
- Report retrieval by ID
- Email delivery
- Error handling

### Task 3.2: Demo Data
**File**: Create `backend/demoData.js`
**Exports**:
- getDemoScanResult(domain)
- Used when backend unavailable

## Success Criteria for Each Sprint

### Sprint 0 ✅
- [ ] API contract documented
- [ ] reportStore working
- [ ] scan pipeline verified

### Sprint 1 ✅
- [ ] POST /api/scan/full returns complete report
- [ ] GET /api/report/:id works
- [ ] POST /api/report/email works
- [ ] All responses have correct fields

### Sprint 2 ✅
- [ ] Frontend form submits scan
- [ ] Report displays live data
- [ ] Email button functional
- [ ] Loading/error states work

### Sprint 3 ✅
- [ ] End-to-end demo works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Ready for presentation