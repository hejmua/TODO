const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});
app.use(express.json());

const dbPath = path.join(__dirname, "app.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT NOT NULL)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, task_name TEXT NOT NULL, deadline TEXT NOT NULL, FOREIGN KEY(username) REFERENCES users(username))"
  );
});

app.post("/register", (req, res) => {
  console.log("POST /register", req.body);
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  db.get(
    "SELECT username FROM users WHERE username = ?",
    [username],
    (lookupErr, row) => {
      if (lookupErr) {
        return res.status(500).json({ error: "database error" });
      }
      if (row) {
        return res.status(409).json({ error: "username already exists" });
      }

      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password],
        (err) => {
          if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
              return res.status(409).json({ error: "username already exists" });
            }
            return res.status(500).json({ error: "database error" });
          }
          return res.json({ ok: true });
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  console.log("POST /login", req.body);
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  db.get(
    "SELECT password FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "database error" });
      }
      if (!row || row.password !== password) {
        return res.status(401).json({ error: "invalid credentials" });
      }
      return res.json({ ok: true });
    }
  );
});

app.post("/tasks", (req, res) => {
  console.log("POST /tasks", req.body);
  const { username, taskName, deadline } = req.body || {};
  if (!username || !taskName || !deadline) {
    return res
      .status(400)
      .json({ error: "username, taskName and deadline required" });
  }

  db.run(
    "INSERT INTO tasks (username, task_name, deadline) VALUES (?, ?, ?)",
    [username, taskName, deadline],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "database error" });
      }
      return res.json({ ok: true, id: this.lastID });
    }
  );
});

app.get("/tasks", (req, res) => {
  const nickname = req.query.nickname || req.query.username;
  console.log("GET /tasks", { nickname });
  if (!nickname) {
    return res.status(400).json({ error: "nickname required" });
  }

  db.all(
    "SELECT id, username, task_name AS taskName, deadline FROM tasks WHERE username = ? ORDER BY id DESC",
    [nickname],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "database error" });
      }
      return res.json({ ok: true, tasks: rows });
    }
  );
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);
  console.log("DELETE /tasks/:id", { id: req.params.id });
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({ error: "valid task id required" });
  }

  db.run("DELETE FROM tasks WHERE id = ?", [taskId], function (err) {
    if (err) {
      return res.status(500).json({ error: "database error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "task not found" });
    }
    return res.json({ ok: true });
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
