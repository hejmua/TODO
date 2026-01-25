import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

// Login komponenta – formulár na prihlásenie používateľa
@Component({
  // HTML tag, ktorý reprezentuje túto komponentu
  selector: 'app-login',
  // standalone = nepotrebuje byť v module, importy si rieši sama
  standalone: true,
  // FormsModule umožňuje používať [(ngModel)] v šablóne
  imports: [CommonModule, FormsModule],
  // cesta k HTML šablóne a CSS štýlom
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // prepojené s inputmi v šablóne cez [(ngModel)]
  username = '';
  password = '';
  // sem sa ukladá chybová správa, ak niečo zlyhá
  error = '';

  // do komponenty si vkladáme AuthService a Router (dependency injection)
  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    // pri každom pokuse o login vymažeme starú chybu
    this.error = '';

    // jednoduchá validácia – musia byť vyplnené obe polia
    if (!this.username || !this.password) {
      this.error = 'Zadaj meno a heslo';
      return;
    }

    try {
      // pokus o prihlásenie cez AuthService (kontrola proti "mock" databáze)
      await this.auth.login(this.username, this.password);
      // po prihlásení môžeš napr. presmerovať na todo stránku
      this.router.navigate(['/todos']);
    } catch (e: any) {
      // ak login zlyhá (zlé meno/heslo), zobrazíme správu z chyby
      this.error = e?.message || 'Chyba pri prihlásení';
    }
  }
}
