import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Jednoduché horné menu s odkazmi na rôzne stránky
@Component({
  selector: 'app-menu',
  standalone: true,
  // RouterModule je potrebný kvôli direktíve routerLink v HTML
  imports: [RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {}
