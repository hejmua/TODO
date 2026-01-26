import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { AuthService } from './services/auth';
import { Todos } from './services/todos';

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

const redirectUnknownRoute = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn()
    ? router.createUrlTree(['/todos'])
    : router.createUrlTree(['/login']);
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
  },

  {
    path: '**',
    canActivate: [redirectUnknownRoute],
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  }
];
