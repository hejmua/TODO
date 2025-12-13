import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Task = {
  id: number;
  name: string;
  deadline: Date;
};

@Component({
  selector: 'app-todos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos-list.html',
  styleUrl: './todos-list.css',
})
export class TodosList implements OnInit, OnDestroy {
  tasks: Task[] = [];
  showModal = false;
  newTask = {
    name: '',
    deadline: '',
  };
  currentTime = Date.now();
  private ticker?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.ticker = setInterval(() => {
      this.currentTime = Date.now();
    }, 1000);
  }

  ngOnDestroy() {
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

  addTask() {
    const name = this.newTask.name.trim();
    if (!name || !this.newTask.deadline) {
      return;
    }

    const parsed = new Date(this.newTask.deadline);
    if (isNaN(parsed.getTime())) {
      return;
    }

    this.tasks = [
      ...this.tasks,
      {
        id: Date.now(),
        name,
        deadline: parsed,
      },
    ];

    this.newTask = { name: '', deadline: '' };
    this.showModal = false;
  }

  removeTask(id: number) {
    this.tasks = this.tasks.filter(task => task.id !== id);
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
}
