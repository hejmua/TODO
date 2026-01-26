import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
// Login page with basic client-side validation.
export class Login {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    this.error = '';

    // Minimal validation before calling the API.
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
}
