# Store Task & Checklist Manager — 5-Minute Demo Video Script

**Duration:** ~5 minutes  
**Presenters:** Person 1 (P1) & Person 2 (P2)  
**Format:** Side-by-side or alternating full-screen with screen capture overlay

---

## SCENE 1 — Landing Screen (0:00–0:40)

**Text Overlay:** *Store Task & Checklist Manager — Internal Workflow Management System*

**P1 (on camera, confident):**
"Modern retail runs on shifts — morning to evening, team to team. The problem? Paper checklists, verbal handovers, and zero visibility for managers."

**P2 (on camera, nodding in):**
"We built a full-stack solution — a centralized platform for tasks, checklists, and shift handovers, backed by Java, Spring Boot, and React."

> **Screen:** Split screen — P1/P2 speaking (top or side) + app login page visible below  
> **Action:** Slow zoom into the login form  
> **Transition:** Fade to screen capture

---

## SCENE 2 — Login & Dashboard (0:40–1:20) — PERSON 1

**Text Overlay:** *Secure JWT Login → Role-Based Dashboard*

**P1 (screen capture — types credentials):**
"Let's jump in. Admin login — username `admin`, password `admin123`. One click, we're in."

> **Action:** Type credentials, click "Sign In", brief loading state shown

**P1 (cursor moves across Dashboard):**
"The Dashboard gives instant visibility — 8 stat cards. Total tasks, pending, completed, overdue, pending checklists... all real-time, role-scoped. Notice the Recent Tasks panel and Pending Checklist Items — everything a manager needs at a glance."

> **Action:** Hover over each stat card slowly; highlight the numbers  
> **Zoom:** Zoom into the "Recent Tasks" panel on the right

---

## SCENE 3 — Task Management (1:20–2:20) — PERSON 2

**Text Overlay:** *Full Lifecycle: Task Creation → Status Workflow → Completion*

**P2 (screen capture — navigates to Tasks page):**
"Let's create a task. I click 'Add Task', fill in the title, assign it to a team member, set priority to High, pick a due date."

> **Action:** Click sidebar "Tasks" → Click "Add Task" → Fill form quickly (use sample data)

**P2 (while typing in form):**
"6 statuses — TODO, In Progress, In Review, Testing, Completed, Blocked. All color-coded. Role-validated assignments — a Manager can only assign within their managed teams."

> **Zoom:** Zoom into the status dropdown and the role-filtered assignee list

**P2 (after task is created):**
"Task created. Now I can move it through stages, add notes, and track progress right here."

> **Action:** Click into the created task → Scroll to the notes section → Add a quick note  
> **Highlight:** The status badge change animation

---

## SCENE 4 — Checklist Management (2:20–3:15) — PERSON 1

**Text Overlay:** *Shift-Specific Checklists with Item-Level Assignment & Progress Tracking*

**P1 (navigates to Checklists page):**
"Now let's look at Checklists — the core of our shift operations. We have shift-specific checklists. Morning shift — opening tasks. Evening — closing procedures. Each item can be assigned to a specific team member."

> **Action:** Click "Checklists" in sidebar  
> **Zoom:** Zoom into the progress bar and assigned user tags

**P1 (cursor checks off items):**
"Check an item — it's marked complete with a strikethrough. The progress bar updates instantly. You can even uncheck if needed. Only Super Admins and Managers can delete. No one can self-assign — preventing conflicts of interest."

> **Action:** Click a checkbox → Show strikethrough + progress bar update  
> **Highlight:** The progress percentage change

---

## SCENE 5 — Shift Handovers (3:15–4:05) — PERSON 2

**Text Overlay:** *Structured Handovers with Resolve/Acknowledge Lifecycle*

**P2 (navigates to Handovers page):**
"Shift Handovers — the most unique feature. When one shift ends and another begins, information can't be lost."

> **Action:** Click "Handovers" in sidebar → Show the list of handovers

**P2 (clicks into a handover):**
"A structured form — Completed Work, Pending Work, Blockers, Next Shift Instructions, and Priority — from Critical to Low. The lifecycle: *Pending* → incoming team clicks *Resolve* → outgoing team clicks *Acknowledge*. A formal, auditable handoff."

> **Zoom:** Zoom into the detail modal showing all 5 structured fields

**P2:**
"No more 'I thought you knew' moments. Every handover is tracked, every acknowledgment is logged."

> **Action:** Click "Resolve" → badge changes to "Resolved" → Click "Acknowledge" → badge shows "Acknowledged"  
> **Highlight:** Each badge state change with a color pulse effect

---

## SCENE 6 — Audit Logging (4:05–4:35) — PERSON 1

**Text Overlay:** *Full Audit Trail — Every Action, Every User, Every Change*

**P1 (navigates to Audit Logs):**
"Every single action is logged — logins, task updates, checklist completions. Role-filtered for privacy. Accountability built in. If something goes wrong, we know who did what and when."

> **Action:** Click "Audit Logs" → Scroll through the table entries  
> **Zoom:** Zoom into a row showing "TASK_UPDATED" with old/new values

---

## SCENE 7 — Quick Summary (4:35–5:00)

**Text Overlay:** *11 Modules · 50+ APIs · 6 Roles · End-to-End Full Stack*

**P1 (on camera, screen shows a scrolling view of the app):**
"To summarize — 11 integrated modules. 50+ REST APIs. 6 user roles. And a full audit trail."

**P2 (on camera, next to P1 or split screen):**
"Tasks, checklists, and shift handovers — all digitized, all secure, all real-time. Built with Java 17, Spring Boot 3.2, React 18, and PostgreSQL."

**P1 + P2 (together, looking at camera, confident):**
"*Store Task & Checklist Manager — because retail operations deserve better than paper.*"

> **Action:** Slow zoom out from the app, fade to black  
> **Final Screen:** Logo centered + tagline + "Built with Java 17 · Spring Boot 3.2 · React 18 · PostgreSQL"

---

## Demo Recording Tips

| Aspect | Recommendation |
|--------|---------------|
| **Screen Resolution** | Record at 1920×1080 (16:9) |
| **Frame Rate** | 30 fps |
| **Cursor** | Use a visible cursor enhancer (e.g., Cursor Pro) |
| **Zoom** | Use OBS or Camtasia "zoom-to-mouse" effect during key interactions |
| **Pacing** | Keep <3 seconds between clicks; pre-open modals if needed to avoid lag |
| **Sample Data** | Ensure `load-sample-data.bat` is run before recording so all lists are populated |
| **Browser** | Use Chrome incognito mode (clean UI, no extensions) |
| **Mic** | Use a lapel mic or USB condenser mic for both presenters |

## Suggested Background Music Style

- **Genre:** Corporate electronic / ambient cinematic
- **Mood:** Professional, upbeat, subtle — *not* distracting
- **Volume:** -25 dB to -30 dB (quiet enough that narration is clearly dominant)
- **Search terms:** "Modern corporate technology" "Inspirational tech documentary" "Cinematic ambient coding"
- **Recommended tracks:** *"Rise" by Peter Sandberg*, *"Growing Up" by ANBR*, or royalty-free libraries like Epidemic Sound / Artlist
- **Transitions:** Brief musical swell at scene changes (0.5–1 second)

## Camera / Screen Transition Suggestions

| Transition | When to Use |
|------------|-------------|
| **Straight cut** | Between most scenes (fast-paced, keeps energy up) |
| **Fade to black (0.5s)** | Opening title and ending summary |
| **Push slide** | Moving between major modules (Tasks → Checklists → Handovers) |
| **Zoom-in (slow, 2s)** | When highlighting specific UI elements (stat cards, status badges) |
| **Side-by-side (PIP)** | During Scene 1 — presenters introducing while app login is visible |
| **Cross-dissolve (0.3s)** | Quick transitions within same module (e.g., adding a note) |

Avoid: Spin transitions, star wipes, or any flashy effects — keep it clean and professional.

## Final Ending Line

> **"Store Task & Checklist Manager — because retail operations deserve better than paper."**

---

*End of Script*
