// Backend code (server.js)

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "syallabus" // Corrected database name
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error:', err);
  } else {
    console.log('MySQL Connected!');
  }
});

app.get('/chapter', (req, res) => {
  const query = 'SELECT * FROM chapters';

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
    } else {
      res.json(result);
    }
  });
});

/*app.get('/chapterdetails', (req, res) => {
  const chapterTitle = req.query.subjectname;
  const query = `SELECT chapterdid, chapterdetails, subjectname FROM chapterdetails WHERE subjectname = ?`;

  db.query(query, [chapterTitle], (err, result) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
    } else {
      res.json(result);
    }
  });
});
app.get('/Chapterdetails', (req, res) => {
  const query = 'SELECT * FROM chapterdetails';

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
    } else {
      res.json(result);
    }
  });
});*/
app.get('/Chapterdetails', (req, res) => {
  const chapterName = req.query.name; // Corrected to use req.query
  const query = `SELECT * FROM chapterdetails INNER JOIN chapters ON chapterdetails.subjectname = chapters.name WHERE chapterdetails.subjectname = ?`;

  db.query(query, [chapterName], (err, result) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
    } else {
      res.json(result);
    }
  });
});

// Assuming you have configured your database connection and Express app

// Endpoint to fetch chapter details by name
app.get('/chapterd', (req, res) => {
  const chapterName = req.query.subjectname;
  const query = `SELECT * FROM chapterdetails WHERE subjectname = ?`;

  db.query(query, [chapterName], (err, result) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).json({ error: 'Error fetching data from the database', details: err.message });
    } else {
      res.json(result[0]); // Assuming only one row will be returned
    }
  });
});
app.get('/sidebaritems', (req, res) => {
  const query = `SELECT *  FROM sidebar `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).json({ error: 'Error fetching data from the database', details: err.message }); 
    } else {
      res.json(result); // Return all sidebar details items
    }
  });
});


app.get('/sidebardetails', (req, res) => {
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

  // Execute the query with user inputs
  db.query(query, [subjectname, sidebaritem], (err, result) => {
    if (err) {
      console.error('Error executing database query:', err);
      return res.status(500).json({ error: 'Error fetching data from database' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Data not found for the specified criteria' });
    }

    res.json(result[0]); // Assuming only one row will be returned
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
