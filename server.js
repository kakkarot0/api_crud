const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());

// Connect to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.password,
  database: 'candidate_status'
});

connection.connect((err) => {
  if (err) {
    console.log('Error connecting to MySQL:', err);
    process.exit();
  }

  // Create the routes
  app.post('/candidate-status', (req, res) => {
    // Get the uid from the request body
    const uid = req.body.uid;
    const query = `
        SELECT
        COUNT(c.id) AS TotalCandidates,
        SUM(CASE WHEN cs.status = 'joined' THEN 1 ELSE 0 END) AS Joined,
        SUM(CASE WHEN cs.status = 'interview' THEN 1 ELSE 0 END) AS Interview
        FROM candidate c
        LEFT JOIN candidatestatus cs ON c.id = cs.cid
        WHERE c.Uid = ${uid}`;

    connection.query(query, [uid], (err, results) => {
        if (err) {
        res.status(500).send({ message: err.message });
        return;
        }

        const response = {
        Uid: uid,
        TotalCandidates: results[0].TotalCandidates,
        Joined: results[0].Joined,
        Interview: results[0].Interview
        };

        res.send(response);
    });
  });

  app.listen(3000, () => {
    console.log('API listening on port 3000');
  });
});
