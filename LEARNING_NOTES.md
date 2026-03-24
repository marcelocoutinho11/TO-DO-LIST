# LEARNING NOTES - TO-DO APP JOURNEY

## 1. Project Snapshot
This app is a multi-profile task manager built with HTML, CSS, and JavaScript.

Current key features:
- Profile-based task separation (up to 5 profiles)
- Tasks with category, priority, due date, and completion state
- Calendar with per-day task chips and completion color levels
- Analytics dashboard
- Mobile navigation improvements
- Music presets (YouTube Lo-fi, YouTube Chill Gang, SoundCloud, 5FM)

---

## 2. What I Learned

### Frontend Architecture
- Keep structure in `public/index.html`
- Keep all styles in `public/styles.css`
- Keep logic in `src/scripts.js`
- Store state in localStorage for simple offline-first behavior

### UX
- Mobile-first tweaks matter: menu visibility, scroll behavior, fixed docks
- Small legends and chip status indicators reduce confusion
- Tappable chips improve discoverability and navigation speed

### Data Design
- Per-profile data keys in localStorage (`tasks_<profileId>`)
- Separate streak keys per profile (`streak_<profileId>`)
- Keep rendering functions pure and recalculate from source data

### Security Basics
- localStorage is convenient but not secure for secrets
- Frontend-only apps are great for prototypes but not for secure account systems
- HTTPS should always be used in public deployment

---

## 3. Git and GitHub Commands (Cheat Sheet)

### First-time setup in this project
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

### Daily workflow
```bash
git add .
git commit -m "Describe change"
git push
```

### Pull latest
```bash
git pull
```

---

## 4. Deployment Notes (HTTPS)

Recommended static hosting options:
- Netlify
- Vercel
- Cloudflare Pages

Why:
- Free HTTPS certificates
- Easy GitHub integration
- Automatic redeploys on push

Deployment flow:
1. Push code to GitHub.
2. Import repo in your hosting platform.
3. Set publish directory to `public` (if asked).
4. Deploy and share the HTTPS URL.

---

## 5. Next Learning Targets

### Short-term
- Add proper `.gitignore` and clean commit history
- Learn branching (`feature/*`, `fix/*`)
- Add issue tracking in GitHub

### Medium-term
- Add backend (Node/Express) for real multi-user auth
- Move from localStorage to database (PostgreSQL/Firebase)
- Add API security (JWT/session + authorization)

### Cybersecurity Path
- OWASP Top 10 basics
- Input validation and output escaping
- Content Security Policy and secure headers
- Authentication vs authorization

---

## 6. Known Limits in Current Version
- Data is per-browser/device (not cloud synced)
- No true login/password auth yet
- No server-side validation yet

---

## 7. Personal Progress Log
Use this section after each upgrade.

### Entry Template
- Date:
- What I built:
- What broke:
- How I fixed it:
- What I learned:
- Next step:

### Entry 1
- Date: 2026-03-24
- What I built: Calendar chips, per-day task visibility, mobile nav fixes, Chill Gang music preset.
- What broke: Mobile menu visibility due to CSS override.
- How I fixed it: Added mobile override to force hamburger visibility and improved sidebar handling.
- What I learned: Mobile CSS ordering can break critical navigation.
- Next step: Publish to GitHub and deploy to HTTPS.
