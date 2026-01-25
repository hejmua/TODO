# Project Documentation - Todo Frontend (Angular)

This document is a detailed, practical guide for understanding the project before an exam.
It explains the architecture, data flow, routing, HTTP fetches, local storage usage, and UI behavior (including the modal).
All references point to the current code in this repo.

## 1) What this project is

A simple Angular 21 standalone app that lets a user register, log in, and manage a personal TODO list.
The backend is expected to run on `http://localhost:4000` and provides login/register and CRUD for tasks.

High-level flow:
1. User registers or logs in.
2. Username is stored in localStorage to simulate a session.
3. Tasks are fetched from the API using that username.
4. User can add tasks (via a modal) or mark tasks done (delete).

## 2) Technology stack

- Angular 21 (standalone components)
- RxJS for HTTP observable handling (converted to Promises via `firstValueFrom`)
- Angular Router for navigation and guards
- Angular Forms (template-driven, `[(ngModel)]`)
- CSS only (no component library)

Scripts (see `package.json`):
- `npm run start` -> `ng serve`
- `npm run build` -> `ng build`
- `npm run test` -> `ng test`

## 3) Project structure

Key folders:
- `src/app/` -> application code
  - `services/` -> HTTP logic and auth
  - `pages/` -> standalone page components (login/register/todos list)
  - `components/` -> shared UI (menu)
  - `app.routes.ts` -> routing and guards
  - `app.config.ts` -> app configuration (providers)
- `src/styles.css` -> global styles and CSS variables

### Root component
- `src/app/app.ts`
  - Root component that renders `Menu` and `<router-outlet>`.
  - `title` is a signal but unused.
- `src/app/app.html`
  - Page shell with top menu and the routed page.

## 4) Routing and navigation

Routes are defined in `src/app/app.routes.ts`:
- `/` redirects to `/login`.
- `/login` -> `Login` component (guarded so logged-in users are redirected to `/todos`).
- `/register` -> `Register` component (same redirect behavior as login).
- `/todos` -> `TodosList` component (requires auth; has a resolver for tasks).

Code example (routes + guards + resolver) from `src/app/app.routes.ts`:
```ts
const redirectIfLoggedIn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree(['/todos']) : true;
};

const requireAuth = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

const resolveTasks = async () => {
  const todos = inject(Todos);
  try {
    return await todos.fetchTasks();
  } catch {
    return [];
  }
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', canActivate: [redirectIfLoggedIn], loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', canActivate: [redirectIfLoggedIn], loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  {
    path: 'todos',
    canActivate: [requireAuth],
    resolve: { tasks: resolveTasks },
    loadComponent: () => import('./pages/todos-list/todos-list').then(m => m.TodosList)
  }
];
```

### Guard behavior
- `redirectIfLoggedIn`:
  - Uses `AuthService.isLoggedIn()`.
  - If already logged in, redirects to `/todos`.
- `requireAuth`:
  - If not logged in, redirects to `/login`.

### Resolver behavior
- `resolveTasks`:
  - Before entering `/todos`, it calls `Todos.fetchTasks()`.
  - If it fails, it returns an empty array (so the UI still loads).

### Router configuration
- `app.config.ts` uses `withRouterConfig({ onSameUrlNavigation: 'reload' })`.
  - This allows reloading the same URL and re-triggering the resolver.

## 5) Authentication (local storage)

All auth logic is in `src/app/services/auth.ts`.

### HTTP endpoints used
- `POST http://localhost:4000/register` with `{ username, password }`.
- `POST http://localhost:4000/login` with `{ username, password }`.

Code example (login + localStorage) from `src/app/services/auth.ts`:
```ts
async login(username: string, password: string) {
  try {
    await firstValueFrom(
      this.http.post<AuthResponse>(`${AUTH_BASE_URL}/login`, { username, password })
    );
    localStorage.setItem('loggedUser', username);
  } catch (error) {
    throw this.toAuthError(error);
  }
}

logout() {
  localStorage.removeItem('loggedUser');
}
```

### Local storage behavior
- On successful login, it stores the username:
  - `localStorage.setItem('loggedUser', username)`
- On logout, it clears it:
  - `localStorage.removeItem('loggedUser')`
- Logged-in checks:
  - `isLoggedIn()` returns true if localStorage has `loggedUser`.
  - `getLoggedUser()` returns the stored username or `null`.

### Error handling
- Uses `HttpErrorResponse` to parse `{ error?: string }` from the backend.
- If no error message is provided, it falls back to:
  - `Chyba pri komunikacii so serverom` (communication error message).

## 6) Todos service (fetching data)

All task data is handled in `src/app/services/todos.ts`.
It also depends on `AuthService` to get the current username.

### HTTP endpoints used
Base URL: `http://localhost:4000`

- Fetch tasks:
  - `GET /tasks?nickname=<username>`
  - Returns `{ ok: boolean, tasks: ApiTask[] }`.

- Create task:
  - `POST /tasks`
  - Body: `{ username, taskName, deadline }`
  - Returns `{ ok: boolean, id: number }`.

- Delete task:
  - `DELETE /tasks/<id>`
  - Returns `{ ok: boolean }`.

Code example (fetch + create + delete) from `src/app/services/todos.ts`:
```ts
async fetchTasks(): Promise<ApiTask[]> {
  const username = this.requireUser();
  const response = await firstValueFrom(
    this.http.get<TasksResponse>(
      `${TODOS_BASE_URL}/tasks?nickname=${encodeURIComponent(username)}`
    )
  );
  return response.tasks ?? [];
}

async createTask(taskName: string, deadline: string): Promise<number> {
  const username = this.requireUser();
  const response = await firstValueFrom(
    this.http.post<CreateTaskResponse>(`${TODOS_BASE_URL}/tasks`, {
      username,
      taskName,
      deadline,
    })
  );
  return response.id;
}

async deleteTask(id: number) {
  await firstValueFrom(
    this.http.delete<{ ok: boolean }>(`${TODOS_BASE_URL}/tasks/${id}`)
  );
}
```

### User requirement
- `requireUser()` throws `Najprv sa prihlaste` if no user is in localStorage.

### Error handling
- Same pattern as auth: parse `{ error?: string }` in `HttpErrorResponse`.

## 7) Todo list page (main UI)

Code: `src/app/pages/todos-list/todos-list.ts` and `.html`.
This page is the core UI for viewing and managing tasks.

### Internal task model
- API returns `taskName` + `deadline` (string).
- UI uses `Task` with `name` and `deadline: Date`.
- `mapApiTask` converts API data to internal `Task`.

Code example (mapping API -> UI) from `src/app/pages/todos-list/todos-list.ts`:
```ts
private mapApiTask(task: ApiTask): Task {
  const parsed = new Date(task.deadline);
  return {
    id: task.id,
    name: task.taskName,
    deadline: isNaN(parsed.getTime()) ? new Date() : parsed,
  };
}
```

### Loading behavior
- On init:
  - Reads tasks from resolver data (if provided).
  - Calls `loadTasks()` to fetch latest tasks.
  - Subscribes to `router.events` and re-fetches if URL is `/todos`.
- `loading` flag shows a "Načitavam úlohy..." message.

Code example (load + refresh) from `src/app/pages/todos-list/todos-list.ts`:
```ts
ngOnInit() {
  this.routeDataSub = this.route.data.subscribe(data => {
    const tasks = data['tasks'] as ApiTask[] | undefined;
    if (tasks) {
      this.tasks = tasks.map(task => this.mapApiTask(task));
    }
  });
  void this.loadTasks();
  this.routeEventsSub = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      if (this.router.url === '/todos') {
        void this.loadTasks();
      }
    });
  this.ticker = setInterval(() => {
    this.currentTime = Date.now();
  }, 1000);
}
```

### Add task flow (modal)
- `openModal()` toggles `showModal = true`.
- Modal is shown only when `showModal` is true.
- Form uses `[(ngModel)]` for `newTask.name` and `newTask.deadline`.

Code example (modal toggle + add) from `src/app/pages/todos-list/todos-list.ts`:
```ts
openModal() {
  this.showModal = true;
}

async addTask() {
  if (this.adding) {
    return;
  }
  const name = this.newTask.name.trim();
  if (!name || !this.newTask.deadline) {
    return;
  }
  const parsed = new Date(this.newTask.deadline);
  if (isNaN(parsed.getTime())) {
    return;
  }
  const tempId = -Date.now();
  const optimisticTask: Task = { id: tempId, name, deadline: parsed };
  try {
    this.adding = true;
    this.error = '';
    this.tasks = [...this.tasks, optimisticTask];
    this.newTask = { name: '', deadline: '' };
    this.showModal = false;
    const id = await this.todos.createTask(name, parsed.toISOString());
    this.tasks = this.tasks.map(task => (task.id === tempId ? { ...task, id } : task));
  } catch (error: any) {
    this.tasks = this.tasks.filter(task => task.id !== tempId);
    this.error = error?.message || 'Nepodarilo sa pridať úlohu';
  } finally {
    this.adding = false;
  }
}
```

Code example (modal template) from `src/app/pages/todos-list/todos-list.html`:
```html
<div class="modal-backdrop" *ngIf="showModal">
  <div class="modal">
    <div class="modal-header">
      <div>
        <span class="eyebrow">Nová úloha</span>
        <h3>Pridať úlohu</h3>
      </div>
      <button type="button" class="ghost" (click)="closeModal()">×</button>
    </div>
    <form (ngSubmit)="addTask()">
      <label>
        Názov úlohy
        <input [(ngModel)]="newTask.name" name="taskName" required placeholder="Napr. Nakŕmiť mačku" />
      </label>
      <label>
        Deadline (dátum + čas)
        <input type="datetime-local" [(ngModel)]="newTask.deadline" name="taskDeadline" required />
      </label>
      <div class="actions">
        <button type="button" class="ghost" (click)="closeModal()">Zrušiť</button>
        <button type="submit" [disabled]="adding">Pridať</button>
      </div>
    </form>
  </div>
</div>
```

Validation before submission:
- Name is trimmed and must not be empty.
- Deadline must be set and parseable to a valid Date.

Optimistic UI behavior:
1. A temporary task is created with a negative ID (`-Date.now()`).
2. The task appears immediately in the list.
3. A POST is sent to create the task.
4. If it succeeds, the temporary ID is replaced with the real ID.
5. If it fails, the temporary task is removed and an error is shown.

### Remove task flow
- UI removes the task immediately (optimistic delete).
- If the server delete fails, the list is restored.

Code example (optimistic delete) from `src/app/pages/todos-list/todos-list.ts`:
```ts
async removeTask(id: number) {
  const previousTasks = this.tasks;
  this.tasks = this.tasks.filter(task => task.id !== id);
  try {
    this.error = '';
    await this.todos.deleteTask(id);
  } catch (error: any) {
    this.tasks = previousTasks;
    this.error = error?.message || 'Nepodarilo sa zmazať úlohu';
  }
}
```

### Remaining time calculation
- `remainingTime()` compares task deadline with current time (updated every 1 second).
- Displays:
  - `Za Xd Xh Xm` for future tasks.
  - `Oneskorene Xd Xh Xm` for past tasks.

Code example (remaining time) from `src/app/pages/todos-list/todos-list.ts`:
```ts
remainingTime(task: Task): string {
  const diff = task.deadline.getTime() - this.currentTime;
  const abs = Math.abs(diff);
  const totalMinutes = Math.floor(abs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return diff >= 0 ? `Za ${parts.join(' ')}` : `Oneskorene ${parts.join(' ')}`;
}
```

### Current time ticker
- `setInterval` runs each second to update `currentTime`.
- Cleaned up in `ngOnDestroy`.

## 8) Modal details

The modal is defined directly in `todos-list.html`:
- Wrapper div: `.modal-backdrop` is fixed, full-screen, and blurred.
- `.modal` is centered and contains the form.
- Modal is controlled entirely by `showModal` boolean.
- Close actions:
  - "x" button in header
  - "Zrusit" button in the form

No external modal library is used.

## 9) Login and register pages

### Login page (`src/app/pages/login`)
- Template-driven form using `[(ngModel)]`.
- Simple validation: both username and password must be filled.
- On success, navigates to `/todos`.
- Error message shown if login fails.

Code example (login handler) from `src/app/pages/login/login.ts`:
```ts
async login() {
  this.error = '';
  if (!this.username || !this.password) {
    this.error = 'Zadaj meno a heslo';
    return;
  }
  try {
    await this.auth.login(this.username, this.password);
    this.router.navigate(['/todos']);
  } catch (e: any) {
    this.error = e?.message || 'Chyba pri prihlásení';
  }
}
```

### Register page (`src/app/pages/register`)
- Requires username, password, and password confirmation.
- Validates that passwords match.
- On success, auto-logins and navigates to `/todos`.
- Shows success or error messages.

Code example (register handler) from `src/app/pages/register/register.ts`:
```ts
async register() {
  this.error = '';
  this.success = '';
  if (!this.username || !this.password || !this.password2) {
    this.error = 'Vyplň všetky polia';
    return;
  }
  if (this.password !== this.password2) {
    this.error = 'Heslá sa nezhodujú';
    return;
  }
  try {
    await this.auth.register(this.username, this.password);
    await this.auth.login(this.username, this.password);
    this.success = 'Registrácia prebehla úspešne.';
    this.router.navigate(['/todos']);
  } catch (e: any) {
    this.error = e?.message || 'Chyba pri registrácii';
  }
}
```

## 10) Menu component (top navigation)

Component: `src/app/components/menu`.

Behavior:
- Shows "Zoznam" link always.
- If logged in:
  - Displays username from localStorage.
  - Provides "Log out" button.
- If logged out:
  - Shows links to login and register.

Logout:
- Calls `AuthService.logout()` (clears localStorage).
- Navigates to `/login`.

Code example (menu logout) from `src/app/components/menu/menu.ts`:
```ts
logout() {
  this.auth.logout();
  this.router.navigate(['/login']);
}
```

## 11) Styling and UI system

Global styles are in `src/styles.css`.
Important details:
- CSS variables define theme colors and spacing.
- Base typography uses Nunito via Google Fonts.
- `.card` provides white container with border and shadow.
- Buttons, inputs, and forms are globally styled.

Todos list has its own styles:
- Table layout with headers and rows.
- `.ghost` button is used for "Hotovo" and modal close.
- Modal backdrop uses `backdrop-filter: blur(4px)`.

## 12) Additional / unused page

There is a `todos-add` page (`src/app/pages/todos-add`), but:
- It is not referenced in `app.routes.ts`.
- It has mock markup and no behavior.
- It appears to be an earlier or unused idea.

## 13) Testing setup

Spec files exist for services and components:
- `src/app/services/auth.spec.ts`
- `src/app/services/todos.spec.ts`
- Component specs in `src/app/pages/*/*.spec.ts`

The test runner is configured by Angular CLI (`ng test`).

## 14) Typical user journey (exam-friendly narrative)

1. Open app -> routed to `/login`.
2. Register a new user or log in.
3. Login stores the username in localStorage as `loggedUser`.
4. Access to `/todos` is allowed only when logged in.
5. Todos page resolves tasks (GET request) and shows them in a table.
6. User clicks "+" to open modal and add a new task.
7. Task appears immediately (optimistic UI), then is confirmed by backend.
8. User marks task done using "Hotovo" (DELETE request).
9. Logout clears localStorage and returns to `/login`.

## 15) Common exam questions you might get

- Where is the session stored? -> `localStorage` key `loggedUser`.
- What happens if backend fails? -> Error messages shown, optimistic changes rolled back.
- What are the API endpoints? -> `/register`, `/login`, `/tasks` GET/POST, `/tasks/:id` DELETE.
- How is the modal controlled? -> `showModal` boolean; no third-party library.
- How are tasks displayed? -> Table; deadlines formatted with Angular DatePipe.
- Why does `/todos` always reload tasks? -> `onSameUrlNavigation: 'reload'` + router events.

## 16) Known limitations

- No refresh token or secure auth; localStorage only simulates session.
- No error boundary UI besides basic error messages.
- `todos-add` page is unused.
- No form-level validation beyond simple checks.
