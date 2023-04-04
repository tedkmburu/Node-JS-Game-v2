// var http = require('http');
const mysql = require('mysql');
const url = require('url');
// const pug = require('pug');
// var fs = require('fs');
const express = require("express");
const app = express();
const PORT = 8080;
const router = express.Router()
const path = require('path');

app.use('/public', express.static('public'))

let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "defi",
  port: 3306,
  // socketPath: '/var/run/mysqld/mysqld.sock'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Server!');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/game.html'));
})

app.get('/leaderboardData', (req, res) => {

  let sql = "SELECT * from student_scores ORDER BY score DESC LIMIT 20";

  sql = "SELECT * from student_scores LEFT JOIN students ON student_scores. studentId = students.id ORDER BY score DESC"

  db.query(sql, (err, result) => {
    if (err) throw err 
    res.send(result);
  });
    
  // });

  // res.send(getScores());
  // res.end(); 
})

app.get('/sendData/', (req, res) => {
  const search_params = new URL("http://" + req.url).searchParams;
  // let id = search_params.get('_id');
  let id = 272;
  let time = search_params.get('time');
  let timestamp = search_params.get('timestamp');
  let score = search_params.get('score');
  let stars_collected = search_params.get('stars_collected');
  let track = search_params.get('track');

  // get real students id of student
  sql = "SELECT * from students WHERE id=" + id;

  //insert score with that id
  db.query(sql, (err, res) => {
    if (err) throw err;

    let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let sql = "INSERT INTO student_scores (studentId, score, track, starsCollected, timeToComplete, timeStamp) VALUES (" + id + ", " + score + ", 1, " + stars_collected + ", " + time + ", '" +  currentTime + "')";

    db.query(sql, (err) => { if (err) throw err });
  });
  
  // res.end(); 
})

app.get('/populateDB', (req, res) => {

  clearTable('student_scores')
  clearTable('students')
  
  // generate random data
  let scoreToInsert = JSON.parse(getScores())

  // create random students
  scoreToInsert.forEach(score => {
    let sql = "INSERT INTO students (username) VALUES ('" + score.name + "')";
    db.query(sql, (err) => { if (err) throw err });
  })

  // scoreToInsert.forEach(score => {
  //   let sql = "INSERT INTO teachers (username) VALUES ('" + score.name + "')";
  //   db.query(sql, (err) => { if (err) throw err });
  // })
  
  // get real students ids
  let allStudents;
  sql = "SELECT * from students"
  db.query(sql, (err, res) => {
    if (err) throw err;

    //all students from db
    allStudents = res;
    let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    allStudents.forEach((student, i) => {
      let sql = "INSERT INTO student_scores (studentId, score, track, starsCollected, timeToComplete, timeStamp) VALUES (" + student.id + ", " + scoreToInsert[i].score + ", 1, " + scoreToInsert[i].starsCollected + ", " + scoreToInsert[i].time + ", '" +  currentTime + "')";
      db.query(sql, (err) => { if (err) throw err });
    })
  });


  res.send("Done")
})

function clearTable(tableName)
{
  let sql = "DELETE FROM " + tableName + "";

  db.query(sql, (err, res) => {
    if (err) throw err;
  });
}

function getScores()
{
    let scores = []
    let firstNames = ["Davina", "Tillie", "Hugh", "Ria", "Elsa", "Joseph", "Steffan", "Tommy", "Nieve", "Umair"]
    let lastNames = ["Wilkinson", "Young", "Hansen", "Richardson", "Pearce", "Acevedo", "Floyd", "Haley", "Stafford", "Guerra"]
    let classCodes = ["IC PHYS 102 1", "IC PHYS 102 2", "IC PHYS 102 2", "IC PHYS 102 3", "IC PHYS 102 3", "IC PHYS 102 3", "IC PHYS 102 2", "IC PHYS 102 4", "IC PHYS 102 5", "IC PHYS 102 6"]

    firstNames.sort(function(){return 0.5 - Math.random()})
    lastNames.sort(function(){return 0.5 - Math.random()})
    classCodes.sort(function(){return 0.5 - Math.random()})
    
    firstNames.forEach((name, i) => {
        let numberOfStarsCollected = Math.round(Math.random() * 3);
        let fullName = "\"name\": \"" + name + " " + lastNames[i] + "\"";
        let firstName = "\"firstName\": \"" + name + "\"";
        let lastName = "\"lastName\": \"" + lastNames[i] + "\"";
        let score = " \"score\": " + Math.round(Math.random() * 10000 * (numberOfStarsCollected + 1));
        let time = " \"time\": " + Math.round(Math.random() * 30000);
        let starsCollected = " \"starsCollected\": " + numberOfStarsCollected;
        let classCode = " \"classCode\": \"" + classCodes[i] + "\"";
        let track = " \"track\": " + 1;
        scores.push("{" + fullName + "," + firstName + "," + lastName + "," + score + "," + time + "," + starsCollected + "," + classCode + "," + track + "}")
    })

    return "[" + scores.toString() + "]";
}


app.listen(PORT, () => {
  console.log("Server running on port: ", PORT);
})
