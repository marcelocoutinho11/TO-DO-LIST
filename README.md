# TO-DO APP

A portfolio-ready productivity app built with vanilla HTML, CSS, and JavaScript.

## What I Built
This project is a multi-profile task management web app focused on practical UX, mobile usability, and progress visibility.

It supports:
- Profile-specific task spaces (up to 5 users)
- Daily task tracking with categories, priorities, and due dates
- Calendar day chips with completion status and task previews
- Analytics dashboard for completion and activity insights
- Mobile-first navigation (hamburger menu + responsive behavior)
- Built-in focus music presets (YouTube Lo-fi, YouTube Chill Gang, SoundCloud, 5FM)

## Features
- Multi-profile local persistence with isolated task data
- Task CRUD: create, complete, delete, and filter
- Calendar enhancements:
   - Status color levels (red/amber/green)
   - Up to 8 task chips per day
   - Clickable chips to jump to exact task details
- Completed task checkmarks directly in calendar chips
- Legend for interpreting calendar statuses and chip meaning
- Responsive layout for desktop and mobile

## Screenshots
Add screenshots to a `docs/screenshots` folder and update links below.

![Home Page](docs/screenshots/home.png)
![Calendar View](docs/screenshots/calendar.png)
![Mobile Navigation](docs/screenshots/mobile.png)

## Tech Used
- HTML5
- CSS3 (responsive design, dark mode support)
- JavaScript (ES6+, DOM manipulation, localStorage)
- Git + GitHub for source control

## What I Learned
- How to structure a frontend app with clear separation of markup, style, and logic
- How to build responsive/mobile-first UI behavior and debug CSS overrides
- How to model per-profile data in localStorage safely and predictably
- How to evolve feature sets iteratively with clean commits and documentation
- How to publish and maintain a portfolio project with GitHub

## Project Structure
- `public/index.html` - UI structure and pages
- `public/styles.css` - styles, responsiveness, and component states
- `src/scripts.js` - app logic for tasks, profiles, calendar, analytics, and music
- `LEARNING_NOTES.md` - growth log and engineering reflection
- `GITHUB_DEPLOY_PLAYBOOK.md` - beginner-friendly deployment steps

## Run Locally
### Option A: VS Code Live Server (recommended)
1. Open this folder in VS Code.
2. Open `public/index.html`.
3. Right-click and choose **Open with Live Server**.

### Option B: Any static server
This app works as static files (no required backend for core features).

## Data Storage Notes
- Uses browser localStorage.
- Profile data is isolated per profile ID.
- Data stays on the same browser/device unless storage is cleared.

## Security Notes
- No secrets should be committed to this repository.
- This is a frontend/localStorage app (not production authentication).
- For stronger security, move profiles/auth and data to a backend service.

## Growth Log
See `LEARNING_NOTES.md` for ongoing engineering progress and lessons learned.

## License
This project is licensed under the MIT License. See `LICENSE`.
