import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth';

// API payloads for task endpoints.
type TasksResponse = {
  ok: boolean;
  tasks: ApiTask[];
};

type CreateTaskResponse = {
  ok: boolean;
  id: number;
};

type UpdateTaskResponse = {
  ok: boolean;
};

// Server task shape as returned by the API.
type ApiTask = {
  id: number;
  username: string;
  taskName: string;
  deadline: string;
};

type TodosErrorResponse = {
  error?: string;
};

// Tasks API base for local development.
const TODOS_BASE_URL = 'http://localhost:4000';

@Injectable({
  providedIn: 'root',
})
export class Todos {
  constructor(private http: HttpClient, private auth: AuthService) {}

  // Load tasks for the current user.
  async fetchTasks(): Promise<ApiTask[]> {
    const username = this.requireUser();
    try {
      const response = await firstValueFrom(
        this.http.get<TasksResponse>(
          `${TODOS_BASE_URL}/tasks?nickname=${encodeURIComponent(username)}`
        )
      );
      return response.tasks ?? [];
    } catch (error) {
      throw this.toTodosError(error);
    }
  }

  async createTask(taskName: string, deadline: string): Promise<number> {
    const username = this.requireUser();
    try {
      const response = await firstValueFrom(
        this.http.post<CreateTaskResponse>(`${TODOS_BASE_URL}/tasks`, {
          username,
          taskName,
          deadline,
        })
      );
      return response.id;
    } catch (error) {
      throw this.toTodosError(error);
    }
  }

  async deleteTask(id: number) {
    try {
      await firstValueFrom(
        this.http.delete<{ ok: boolean }>(`${TODOS_BASE_URL}/tasks/${id}`)
      );
    } catch (error) {
      throw this.toTodosError(error);
    }
  }

  async updateTask(id: number, taskName: string, deadline: string) {
    const username = this.requireUser();
    try {
      await firstValueFrom(
        this.http.put<UpdateTaskResponse>(`${TODOS_BASE_URL}/tasks/${id}`, {
          username,
          taskName,
          deadline,
        })
      );
    } catch (error) {
      throw this.toTodosError(error);
    }
  }

  // Ensure API calls have a logged-in user context.
  private requireUser(): string {
    const username = this.auth.getLoggedUser();
    if (!username) {
      throw new Error('Najprv sa prihlaste');
    }
    return username;
  }

  // Normalize HTTP errors into simple Error instances for UI display.
  private toTodosError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as TodosErrorResponse | undefined;
      const message = apiError?.error || 'Chyba pri komunikácii so serverom';
      return new Error(message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Chyba pri komunikácii so serverom');
  }
}
