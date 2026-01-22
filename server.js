// include required packages
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
 
const port = 3000;
 
// database config
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};
 
// initialize app
const app = express();
app.use(express.json());
 
// CORS config
const allowedOrigins = [
    "http://localhost:3000",
    "https://onlinecardapp.onrender.com"
];
 
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
    })
);
 
// start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
 
 
// ================= ROUTES =================
 
// GET all
app.get('/alltasks', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM greenplan');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for alltasks' });
    } finally {
        if (connection) await connection.end();
    }
});
 
// ADD
app.post('/addtask', async (req, res) => {
    const { task_name, task_status } = req.body;
    let connection;
 
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO greenplan (task_name, task_status) VALUES (?, ?)',
            [task_name, task_status]
        );
        res.status(201).json({ message: `${task_name} added successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not add task' });
    } finally {
        if (connection) await connection.end();
    }
});
 
// UPDATE
app.put('/updatetask/:id', async (req, res) => {
    const { id } = req.params;
    const { task_name, task_status } = req.body;
    let connection;
 
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE greenplan SET task_name=?, task_status=? WHERE id=?',
            [task_name, task_status, id]
        );
        res.json({ message: `Task ${id} updated successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update task' });
    } finally {
        if (connection) await connection.end();
    }
});

// DELETE
app.delete('/deletetask/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
 
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM greenplan WHERE id=?',
            [id]
        );
        res.json({ message: `Task ${id} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete task' });
    } finally {
        if (connection) await connection.end();
    }
});
