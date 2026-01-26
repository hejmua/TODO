import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

// API responses for auth endpoints.
type AuthResponse = {
  ok: boolean;
};

type AuthErrorResponse = {
  error?: string;
};

// Auth API base for local development.
const AUTH_BASE_URL = 'http://localhost:4000';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  // Register a new user and surface API errors as user-friendly messages.
  async register(username: string, password: string) {
    try {
      await firstValueFrom(
        this.http.post<AuthResponse>(`${AUTH_BASE_URL}/register`, { username, password })
      );
      return true;
    } catch (error) {
      throw this.toAuthError(error);
    }
  }

  async login(username: string, password: string) {
    try {
      await firstValueFrom(
        this.http.post<AuthResponse>(`${AUTH_BASE_URL}/login`, { username, password })
      );
      // Store a minimal session marker for guards and services.
      localStorage.setItem('loggedUser', username);
    } catch (error) {
      throw this.toAuthError(error);
    }
  }

  logout() {
    localStorage.removeItem('loggedUser');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('loggedUser');
  }

  getLoggedUser(): string | null {
    return localStorage.getItem('loggedUser');
  }

  // Normalize HTTP errors into simple Error instances for UI display.
  private toAuthError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as AuthErrorResponse | undefined;
      const message = apiError?.error || 'Chyba pri komunikácii so serverom';
      return new Error(message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Chyba pri komunikácii so serverom');
  }
}
