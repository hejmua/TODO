import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

type AuthResponse = {
  ok: boolean;
};

type AuthErrorResponse = {
  error?: string;
};

const AUTH_BASE_URL = 'http://localhost:4000';

// Servis, ktorý rieši registráciu, prihlásenie a stav používateľa
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  // Registrácia nového používateľa
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

  // Prihlásenie existujúceho používateľa
  async login(username: string, password: string) {
    try {
      await firstValueFrom(
        this.http.post<AuthResponse>(`${AUTH_BASE_URL}/login`, { username, password })
      );
      // pri úspešnom logine uložíme meno do localStorage (simulácia sessie)
      localStorage.setItem('loggedUser', username);
    } catch (error) {
      throw this.toAuthError(error);
    }
  }

  // Odhlásenie používateľa – zmažeme údaj z localStorage
  logout() {
    localStorage.removeItem('loggedUser');
  }

  // Zistí, či je niekto prihlásený (či v localStorage je loggedUser)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('loggedUser');
  }

  // Vráti meno prihláseného používateľa, alebo null ak nikto nie je prihlásený
  getLoggedUser(): string | null {
    return localStorage.getItem('loggedUser');
  }

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
