# GitHub + HTTPS Deployment Playbook (Beginner Friendly)

## Goal
Publish this app to GitHub and get a public HTTPS link.

---

## A. Install Required Tools (Windows)

### 1. Install Git
- Download: https://git-scm.com/download/win
- Install with default options
- Restart VS Code

### 2. Optional: Install GitHub Desktop
- Download: https://desktop.github.com/
- Useful if you prefer UI over terminal

---

## B. Push Project to GitHub (Terminal Method)

Open terminal in project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Create a new empty repo on GitHub, then run:

```bash
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

If push asks for auth:
- Sign in through browser when prompted, or
- Use GitHub Personal Access Token

---

## C. Deploy to Public HTTPS (Netlify)

### Option 1: Netlify UI (easiest)
1. Go to https://app.netlify.com/
2. Click "Add new site" -> "Import an existing project"
3. Connect GitHub and choose your repo
4. Build command: leave empty
5. Publish directory: `public`
6. Click Deploy

You will receive a live HTTPS URL like:
`https://your-app-name.netlify.app`

### Option 2: Vercel
1. Go to https://vercel.com/
2. Import repo
3. Framework: Other
4. Output/public dir: `public`
5. Deploy

---

## D. Share for Testing
Send your live link to family/friends:

"Please test my app here: https://your-app-name.netlify.app"

Ask them to test:
- profile switch
- add/edit/check/delete tasks
- calendar chips
- analytics
- mobile menu and navigation

---

## E. Update Workflow After Changes
Whenever you make updates:

```bash
git add .
git commit -m "Describe changes"
git push
```

Netlify/Vercel redeploys automatically.

---

## F. Troubleshooting

### Git command not found
- Git is not installed or terminal not restarted.
- Reinstall Git and restart VS Code.

### Remote already exists
```bash
git remote remove origin
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
```

### Push rejected
```bash
git pull --rebase origin main
git push
```

### Deploy shows 404
- Confirm publish directory is `public`
- Confirm `public/index.html` exists

---

## G. Knowledge Reflection Prompt
After deploying, write:
- What worked first try?
- What failed and why?
- What command solved it?
- What will you automate next?
