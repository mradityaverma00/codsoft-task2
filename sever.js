const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Create or open a SQLite database
const db = new sqlite3.Database('tasks.db');

// Create a table for tasks if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT)");
});

app.use(express.json());

// Serve the frontend
app.use(express.static('public'));

// API endpoints
app.get('/api/tasks', (req, res) => {
    db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/tasks', (req, res) => {
    const task = req.body.task;
    if (!task) {
        return res.status(400).json({ error: 'Task is required' });
    }

    db.run("INSERT INTO tasks (task) VALUES (?)", [task], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ id: this.lastID, task });
        }
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;

    db.run("DELETE FROM tasks WHERE id = ?", [taskId], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ success: true });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
