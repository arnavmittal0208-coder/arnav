SkillSwapper - Hackathon Starter

This folder contains a small React demo for the Skill Exchange and Task Marketplace features described during the hackathon.

Files created under `src/`:
- `index.js` - React entry
- `App.js` - Front page, routing and dummy pages
- `App.css` - Basic styling similar to mobile UI mockups
- `firebase.js` - Firebase config template (replace with your project's values)
- `TaskMarketplace.js` - Task posting and applicant flows (uses Firestore real-time updates)
- `ExchangeSkill.js` - Skill swap proposals and approve flow (uses Firestore real-time updates)

Quick start (on your machine):
1. Install Node.js LTS from https://nodejs.org
2. In PowerShell, create the app locally (this workspace contains just the src files):
   npx create-react-app skillswapper
   cd skillswapper
3. Copy the files from this workspace's `src/` into your local `skillswapper/src/` (overwrite when prompted).
4. Install dependencies and run:

```powershell
npm install firebase react-router-dom
npm start
```

5. Create a Firebase project and Firestore DB, then paste your firebase config into `src/firebase.js`.

Notes:
- Firestore in "test mode" is fine for a hackathon demo but not for production.
- For a complete runnable app you can also let `create-react-app` scaffold the full project and then replace `src/` with these files.

If you want, I can scaffold a full project (package.json, public files) here — tell me and I'll add those files so this repo is runnable without running `create-react-app` locally.
