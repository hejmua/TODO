import { Injectable } from '@angular/core';

// Servis, ktorý rieši registráciu, prihlásenie a stav používateľa
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // "Mock" databáza používateľov v pamäti aplikácie
  // V reálnej appke by to bolo na serveri / v databáze
  users = [
    { username: 'admin', password: 'admin' }
  ];

  constructor() { }

  // Registrácia nového používateľa
  register(username: string, password: string) {
    // ak už používateľ s daným menom existuje, vyhodíme chybu
    if (this.users.find(u => u.username === username)) {
      throw new Error('Užívateľ už existuje');
    }

    // inak ho pridáme do zoznamu
    this.users.push({ username, password });
    return true;
  }

  // Prihlásenie existujúceho používateľa
  login(username: string, password: string) {
    // pokus nájsť používateľa so zadaným menom a heslom
    const user = this.users.find(u => u.username === username && u.password === password);

    if (!user) {
      // ak nenájdeme, vyhodíme chybu
      throw new Error('Nesprávne meno alebo heslo');
    }

    // pri úspešnom logine uložíme meno do localStorage (simulácia sessie)
    localStorage.setItem('loggedUser', username);
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
}
