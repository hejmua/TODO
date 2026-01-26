# Pages and Components Reference

This document lists all pages and reusable components in the app.
For each page, it explains what is inside, which functions it has, and what it is used for.

## Pages

### Login page
- Files: `src/app/pages/login/login.ts`, `src/app/pages/login/login.html`
- What is in it:
  - A card layout with a login form (username + password).
  - Error message area for failed login.
- Functions:
  - `login()` validates inputs, calls `AuthService.login()`, and navigates to `/todos` on success.
- Used for:
  - Authenticating an existing user and starting a session (localStorage set in the service).

### Register page
- Files: `src/app/pages/register/register.ts`, `src/app/pages/register/register.html`
- What is in it:
  - A registration form (username, password, password confirmation).
  - Success and error message areas.
- Functions:
  - `register()` validates inputs and password match, calls `AuthService.register()`,
    auto-logs in, and navigates to `/todos`.
- Used for:
  - Creating a new user account and immediately logging in.

### Todos list page (main UI)
- Files: `src/app/pages/todos-list/todos-list.ts`, `src/app/pages/todos-list/todos-list.html`
- What is in it:
  - Tasks table with name, deadline, and remaining time.
  - "Add task" button that opens a modal with a form.
  - Loading text, empty state, and error message area.
- Functions:
  - `ngOnInit()` loads tasks from resolver, refreshes on `/todos` navigation, and starts a time ticker.
  - `ngOnDestroy()` unsubscribes and stops the ticker.
  - `openModal()` / `closeModal()` toggle the add-task modal.
  - `addTask()` validates input, creates a task via `Todos.createTask()`, and uses optimistic UI.
  - `removeTask()` deletes a task via `Todos.deleteTask()` with optimistic UI.
  - `remainingTime()` formats time left or overdue.
  - `loadTasks()` fetches latest tasks from API.
  - `mapApiTask()` converts API tasks into UI model.
- Used for:
  - Viewing, adding, and completing tasks for the logged-in user.

### Todos add page (unused)
- Files: `src/app/pages/todos-add/todos-add.ts`, `src/app/pages/todos-add/todos-add.html`
- What is in it:
  - A mock form layout (title, detail, due date, mock save button).
- Functions:
  - No logic (empty class).
- Used for:
  - Not currently used; not linked in routing.

## Reusable components

### App root component
- Files: `src/app/app.ts`, `src/app/app.html`
- What is in it:
  - Application shell with the top menu and a `router-outlet`.
- Functions:
  - No user actions; it declares the `Menu` and the routing outlet.
- Used for:
  - Root layout that wraps every page.

### Menu component (top navigation)
- Files: `src/app/components/menu/menu.ts`, `src/app/components/menu/menu.html`
- What is in it:
  - Brand area, links to pages, logged-in user name, and logout button.
  - Login/Register links when user is logged out.
- Functions:
  - `isLoggedIn()` checks auth state from `AuthService`.
  - `loggedUser()` reads current username from `AuthService`.
  - `logout()` clears localStorage via `AuthService.logout()` and routes to `/login`.
- Used for:
  - Navigation and session actions available on all pages.
