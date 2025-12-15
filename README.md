# Clinic Workspace (Frontend-only Demo)

Interactive product prototype for clinic workflows. **No backend services**, **no external APIs**, all data is stored locally in the browser via **localStorage**.

## Run locally

- **Prerequisites**: Node.js (LTS recommended)

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Open:
   - `http://localhost:3000`

## Notes

- Use **Settings → Seed Demo Data** to generate 3 psychiatry prior-auth demo cases.
- Use **Settings → Clear All Local Data** to reset localStorage.

## GitHub Pages

This repo is configured to deploy to GitHub Pages via Actions.

- Repository: `https://github.com/AlyciaBHZ/ClinicWorkspace.git`
- Pages deployment workflow: `.github/workflows/pages.yml`

## Guided Demo: Spravato TRD (one click)

1. Open **Dashboard**
2. In the right-side card **“演示脚本（Spravato TRD 拒付申诉）”**, click **Run full scenario**
3. The app will (frontend-only, deterministic):
   - Ensure demo data exists
   - Create/ensure the fixed demo case id: `exampleCaseId`
   - Auto-pin evidence by tags (TRD + esketamine/spravato)
   - Generate **PA Pack** and **Appeal Letter**, and save **v1**
   - Set status to **denied** for appeal workflow demo
4. Use the Stepper “Go” buttons to jump into each module with `caseId` context.
