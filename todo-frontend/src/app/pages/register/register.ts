import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

// Register komponenta – formulár na vytvorenie nového používateľa
@Component({
  selector: 'app-register',
  standalone: true,
  // FormsModule kvôli [(ngModel)] v HTML
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  // prepojené s inputmi v šablóne
  username = '';
  password = '';
  password2 = '';
  // chybová správa (červený text)
  error = '';
  // informácia o úspechu (zelený text)
  success = '';

  // AuthService použijeme na uloženie nového používateľa (do mock databázy)
  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    // pri každom pokuse resetujeme správy
    this.error = '';
    this.success = '';

    // jednoduchá kontrola – všetky polia musia byť vyplnené
    if (!this.username || !this.password || !this.password2) {
      this.error = 'Vyplň všetky polia';
      return;
    }

    // heslo a overenie hesla musia byť rovnaké
    if (this.password !== this.password2) {
      this.error = 'Heslá sa nezhodujú';
      return;
    }

    try {
      // pokus o registráciu nového používateľa
      await this.auth.register(this.username, this.password);
      await this.auth.login(this.username, this.password);
      this.success = 'Registrácia prebehla úspešne.';
      this.router.navigate(['/todos']);
    } catch (e: any) {
      // ak používateľ už existuje alebo iná chyba
      this.error = e?.message || 'Chyba pri registrácii';
    }
  }
}
