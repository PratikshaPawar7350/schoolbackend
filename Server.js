const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// Custom query function to execute SQL queries
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err); // Reject if unable to get connection
      }

      connection.query(sql, params, (err, rows) => {
        connection.release(); // Release the connection back to the pool

        if (err) {
          reject(err); // Reject if query execution fails
        }

        resolve(rows); // Resolve with query results
      });
    });
  });
};

// Routes
app.get('/chapter', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM chapters');
    res.json(rows);
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
  }
});

app.get('/chapterdetails', async (req, res) => {
  const chapterName = req.query.name;
  const queryStr = `
    SELECT * 
    FROM chapterdetails 
    INNER JOIN chapters ON chapterdetails.subjectname = chapters.name 
    WHERE chapterdetails.subjectname = ?`;

  try {
    const rows = await query(queryStr, [chapterName]);
    res.json(rows);
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
