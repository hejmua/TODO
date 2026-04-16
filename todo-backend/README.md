# todo-backend

Minimal Express + SQLite backend for authentication and TODO tasks.

## Requirements

- Node.js 18+ (LTS recommended)
- npm

## Install

```bash
cd todo-backend
npm install
```

## Run

```bash
npm start
```

Server starts on:

- `http://localhost:4000`

## Project Files

- `server.js` - API server and SQLite schema initialization
- `app.db` - SQLite database file (auto-used by the server)
- `package.json` - scripts and dependencies

## API Overview

Base URL: `http://localhost:4000`

- `POST /register` - create user
- `POST /login` - login user
- `GET /tasks?nickname=<username>` - list tasks for user
- `POST /tasks` - create task
- `PUT /tasks/:id` - update task
- `DELETE /tasks/:id` - delete task

### Register

```bash
curl -X POST http://localhost:4000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

### Login

```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

### Create Task

```bash
curl -X POST http://localhost:4000/tasks \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","taskName":"Buy milk","deadline":"2026-04-20T10:00:00.000Z"}'
```

### Get Tasks

```bash
curl "http://localhost:4000/tasks?nickname=demo"
```

### Update Task

```bash
curl -X PUT http://localhost:4000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","taskName":"Buy milk and bread","deadline":"2026-04-21T10:00:00.000Z"}'
```

### Delete Task

```bash
curl -X DELETE http://localhost:4000/tasks/1
```

## Notes

- This backend is intentionally simple and does not implement JWT/session auth.
- User context is provided by `username` in requests.
- If you want a clean database, stop the server and remove `app.db`, then start again.
