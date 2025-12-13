import { Routes } from '@angular/router';

// Zoznam všetkých ciest (URL) v aplikácii – standalone štýl (bez AppRoutingModule)
export const routes: Routes = [
  // Pri prázdnej URL ("/") presmerujeme na login
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Auth stránky
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },

  // Todos stránky (zoznam úloh a pridanie úlohy)
  { path: 'todos', loadComponent: () => import('./pages/todos-list/todos-list').then(m => m.TodosList) }
];
