const express = require('express');
const mysql = require('mysql2'); // Use mysql2 instead of mysql
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MySQL Connection Pool with proper authPlugins option
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0')
  }
});

// Custom query function to execute SQL queries
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      connection.query(sql, params, (err, rows) => {
        connection.release();

        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
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

function bufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64');
  }
  
  // Function to save base64-encoded image data as a PNG file
  function saveBase64Image(base64String, fileName) {
    const filePath = path.join(__dirname, 'images', fileName);
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return filePath; // Return the file path where the image is saved
  }
  
  // Route to fetch all syllabus data
  app.get('/syllabus', (req, res) => {
    const query = 'SELECT id, syllabusname, image, standard FROM syllabus';
  
    // Use the connection pool to execute the SQL query
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching syllabus data:', error);
        return res.status(500).json({ error: 'Error fetching syllabus data', details: error.message });
      }
  
      // Process syllabus data
      const syllabusData = results.map(syllabus => {
        if (syllabus.image) {
          const fileName = `syllabus_${syllabus.id}.png`;
          const imagePath = saveBase64Image(syllabus.image, fileName);
          syllabus.image = imagePath; // Update image field to the file path of the saved PNG
        } else {
          // If no image data, set a default image path
          syllabus.image = path.join(__dirname, 'images', 'default.png');
        }
  
        return {
          id: syllabus.id,
          syllabusname: syllabus.syllabusname,
          standard: syllabus.standard,
          image: syllabus.image
        };
      });
  
      res.json(syllabusData);
    });
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
