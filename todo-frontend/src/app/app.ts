import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from './components/menu/menu';

// Root (hlavná) komponenta celej aplikácie
@Component({
  selector: 'app-root',
  standalone: true,
  // RouterOutlet = miesto, kde sa vykresľujú komponenty podľa aktuálnej URL (routy)
  // Menu = horné menu, ktoré sa zobrazuje na všetkých stránkach
  imports: [RouterOutlet, Menu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // signal je reaktívna hodnota, tu drží názov aplikácie (momentálne sa len nepoužíva)
  protected readonly title = signal('todo-frontend');
}
