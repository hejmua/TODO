import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
// Registration page with simple form validation and auto-login.
export class Register {
  username = '';
  password = '';
  password2 = '';
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    this.error = '';
    this.success = '';

    // Ensure all fields are present.
    if (!this.username || !this.password || !this.password2) {
      this.error = 'Vyplň všetky polia';
      return;
    }

    // Check password match before hitting the API.
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
}
