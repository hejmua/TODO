import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  loggedUser() {
    return this.auth.getLoggedUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
