TO-DO APP - PROJECT NOTES AND GITHUB GUIDE

Overview
This is a profile-based task management app built with HTML, CSS, and JavaScript.
It includes:
- Up to 5 user profiles
- Daily tasks with categories and priorities
- Calendar view with task chips per day
- Completion color levels in calendar (red, amber, green)
- Analytics dashboard
- Mobile sidebar navigation
- Music page with source switching

Project Structure
- public/index.html: app layout and pages
- public/styles.css: styling and responsive/mobile behavior
- src/scripts.js: app logic (tasks, profiles, calendar, analytics, music)
- QUICK_START.md: quick usage notes

How the Data is Saved
- Data is stored in browser local storage.
- Each profile has separate task data.
- Data remains on the same browser/device unless storage is cleared.

Run Locally
Option A (recommended): VS Code Live Server
1. Open the folder in VS Code.
2. Open public/index.html.
3. Right-click and choose Open with Live Server.

Option B: any static file server
You can host this as static files because there is no required backend for the main app.

Mobile Notes
- Sidebar is hidden on mobile and opens from the hamburger button.
- Music dock is hidden on mobile unless Music page is active.
- Calendar task chips are clickable and can jump to selected task details.

Calendar Legend
- Red day: 0% done
- Amber day: partial completion
- Green day: 100% done
- Task chip with checkmark means completed task

Publish to GitHub (first time)
1. Install Git
- Download from https://git-scm.com/download/win
- Complete install and restart terminal/VS Code

2. Create a new empty repository on GitHub
- Log in to GitHub
- Click New repository
- Name example: todo-app
- Leave it empty (no README from GitHub page)
- Click Create repository

3. Open terminal in this project folder and run:

   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main

Replace YOUR_USERNAME and YOUR_REPO_NAME with your values.

If you use GitHub Desktop instead
1. Open GitHub Desktop
2. Add local repository from this folder
3. Commit all changes
4. Publish repository

Suggested Learning Notes (for your knowledge growth)
- Learn Git basics: init, add, commit, push, pull, branch
- Learn web app security basics for frontend apps
- Learn how local storage differs from backend database storage
- Learn deployment with HTTPS using Netlify or Vercel

Simple Improvement Roadmap
1. Add backend auth for true account security
2. Add cloud database for shared multi-device sync
3. Add password reset and role-based access
4. Add tests for task and calendar logic
5. Add CI pipeline for automatic checks

Troubleshooting
- If mobile menu does not appear, hard refresh browser cache.
- If calendar chips look stale, switch month forward/back once.
- If tasks are missing, verify active profile in the top-left profile area.

License
Use for learning and personal projects.
