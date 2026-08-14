# Campus Pass

BIT Automated Student Leave & Outpass Management System with Parent Notification Workflows

Campus Pass is a demo-ready, deterministic rule-based workflow system for managing student leave, OD and campus exits with parent consent, mentor/HOD and warden approvals, automated campus pass generation, QR & OTP gate verification, and an auditable lifecycle.

This repository is a single-page React + Vite app intended as a demo of a workflow-driven Campus Pass product.

## Run Locally

Prerequisites: Node.js (16+)

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open the app at the printed local URL (usually `http://localhost:5173`).

## Demo Credentials (username = password)

- Student: `student@bitsathy`
- Parent: `parent@bitsathy`
- Mentor: `mentor@bitsathy`
- Warden: `warden@bitsathy`
- Security: `security@bitsathy`
- Management: `management@bitsathy`
- Admin: `admin@bitsathy`

## Notes

- The app runs in interactive client mode and uses a local in-memory/demo persistence layer (`dataService`) that saves state to `localStorage`.
- Notifications are simulated in-app; email/SMS delivery is marked as development-simulated.
- No external AI services are used — the system is deterministic and rule-based.

If you want me to run tests, wire Supabase, or further harden role-based access and RLS, tell me which part to prioritize.
