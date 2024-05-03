const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const port= 4000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }

      connection.query(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        }

        resolve(rows);
        connection.release();
      });
    });
  });
};

app.get('/chapter', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM chapters');
    res.json(rows);
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
  }
});

app.get('/Chapterdetails', async (req, res) => {
  const chapterName = req.query.name; // Corrected to use req.query
  const query = `SELECT * FROM chapterdetails INNER JOIN chapters ON chapterdetails.subjectname = chapters.name WHERE chapterdetails.subjectname = ?`;

  try {
    const [rows] = await query(query, [chapterName]);
    res.json(rows);
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
  }
});

// Endpoint to fetch chapter details by name
app.get('/chapterd', async (req, res) => {
  const chapterName = req.query.subjectname;
  const query = `SELECT * FROM chapterdetails WHERE subjectname = ?`;

  try {
    const [rows] = await query(query, [chapterName]);
    res.json(rows[0]); // Assuming only one row will be returned
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
  }
});

app.get('/sidebaritems', async (req, res) => {
  const query = `SELECT *  FROM sidebar `;

  try {
    const [rows] = await query(query);
    res.json(rows); // Return all sidebar details items
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
  }
});

app.get('/sidebardetails', async (req, res) => {
  const { subjectname, sidebaritem } = req.query;

  // Validate required parameters
  if (!subjectname || !sidebaritem) {
    return res.status(400).json({ error: 'Both subjectname and sidebaritem are required' });
  }

  // SQL query to fetch data based on user inputs
  const query = `
    SELECT *
    FROM sidebardetails
    WHERE subjectname = ? AND sidebaritem = ?
  `;

  try {
    const [rows] = await query(query, [subjectname, sidebaritem]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Data not found for the specified criteria' });
    }

    res.json(rows[0]); // Assuming only one row will be returned
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).json({ error: 'Error fetching data from database' });
 }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});