import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { Todos } from '../../services/todos';

type Task = {
  id: number;
  name: string;
  deadline: Date;
};

// API task shape used by the resolver.
type ApiTask = {
  id: number;
  username: string;
  taskName: string;
  deadline: string;
};

@Component({
  selector: 'app-todos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos-list.html',
  styleUrl: './todos-list.css',
})
// Task list page with modal creation and optimistic UI updates.
export class TodosList implements OnInit, OnDestroy {
  tasks: Task[] = [];
  showModal = false;
  showEditModal = false;
  newTask = {
    name: '',
    deadline: '',
  };
  editTask = {
    id: 0,
    name: '',
    deadline: '',
  };
  error = '';
  adding = false;
  savingEdit = false;
  loading = false;
  currentTime = Date.now();
  private ticker?: ReturnType<typeof setInterval>;
  private routeEventsSub?: Subscription;
  private routeDataSub?: Subscription;

  constructor(
    private todos: Todos,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Load any tasks resolved by the route before initial render.
    this.routeDataSub = this.route.data.subscribe(data => {
      const tasks = data['tasks'] as ApiTask[] | undefined;
      if (tasks) {
        this.tasks = tasks.map(task => this.mapApiTask(task));
      }
    });
    void this.loadTasks();
    // Reload tasks after navigating back to /todos.
    this.routeEventsSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === '/todos') {
          void this.loadTasks();
        }
      });
    // Tick once per second for remaining time display.
    this.ticker = setInterval(() => {
      this.currentTime = Date.now();
    }, 1000);
  }

  ngOnDestroy() {
    this.routeEventsSub?.unsubscribe();
    this.routeDataSub?.unsubscribe();
    if (this.ticker) {
      clearInterval(this.ticker);
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openEditModal(task: Task) {
    this.showEditModal = true;
    this.editTask = {
      id: task.id,
      name: task.name,
      deadline: this.toDateTimeLocal(task.deadline),
    };
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editTask = { id: 0, name: '', deadline: '' };
  }

  async addTask() {
    if (this.adding) {
      return;
    }

    const name = this.newTask.name.trim();
    if (!name || !this.newTask.deadline) {
      return;
    }

    const parsed = new Date(this.newTask.deadline);
    if (isNaN(parsed.getTime())) {
      return;
    }

    // Optimistically render a temporary task while the API call runs.
    const tempId = -Date.now();
    const optimisticTask: Task = {
      id: tempId,
      name,
      deadline: parsed,
    };

    try {
      this.adding = true;
      this.error = '';
      this.tasks = [...this.tasks, optimisticTask];
      this.newTask = { name: '', deadline: '' };
      this.showModal = false;
      const id = await this.todos.createTask(name, parsed.toISOString());
      this.tasks = this.tasks.map(task => (task.id === tempId ? { ...task, id } : task));
    } catch (error: any) {
      this.tasks = this.tasks.filter(task => task.id !== tempId);
      this.error = error?.message || 'Nepodarilo sa pridať úlohu';
    } finally {
      this.adding = false;
    }
  }

  async saveTaskEdit() {
    if (this.savingEdit) {
      return;
    }

    const id = this.editTask.id;
    const name = this.editTask.name.trim();
    if (!id || !name || !this.editTask.deadline) {
      return;
    }

    const parsed = new Date(this.editTask.deadline);
    if (isNaN(parsed.getTime())) {
      return;
    }

    const previousTasks = this.tasks;
    this.tasks = this.tasks.map(task =>
      task.id === id ? { ...task, name, deadline: parsed } : task
    );

    try {
      this.savingEdit = true;
      this.error = '';
      await this.todos.updateTask(id, name, parsed.toISOString());
      this.closeEditModal();
    } catch (error: any) {
      this.tasks = previousTasks;
      this.error = error?.message || 'Nepodarilo sa upraviť úlohu';
    } finally {
      this.savingEdit = false;
    }
  }

  async removeTask(id: number) {
    const previousTasks = this.tasks;
    this.tasks = this.tasks.filter(task => task.id !== id);
    try {
      this.error = '';
      await this.todos.deleteTask(id);
    } catch (error: any) {
      this.tasks = previousTasks;
      this.error = error?.message || 'Nepodarilo sa zmazať úlohu';
    }
  }

  remainingTime(task: Task): string {
    const diff = task.deadline.getTime() - this.currentTime;
    const abs = Math.abs(diff);
    const totalMinutes = Math.floor(abs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);

    return diff >= 0 ? `Za ${parts.join(' ')}` : `Oneskorene ${parts.join(' ')}`;
  }

  private async loadTasks() {
    try {
      this.loading = true;
      this.error = '';
      const tasks = await this.todos.fetchTasks();
      this.tasks = tasks.map(task => this.mapApiTask(task));
    } catch (error: any) {
      this.error = error?.message || 'Nepodarilo sa načítať úlohy';
      this.tasks = [];
    } finally {
      this.loading = false;
    }
  }

  private mapApiTask(task: ApiTask): Task {
    const parsed = new Date(task.deadline);
    return {
      id: task.id,
      name: task.taskName,
      deadline: isNaN(parsed.getTime()) ? new Date() : parsed,
    };
  }

  private toDateTimeLocal(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
