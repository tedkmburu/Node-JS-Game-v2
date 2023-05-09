// var http = require('http');
const mysql = require('mysql');
const url = require('url');
// const pug = require('pug');
// var fs = require('fs');
const express = require("express");
const app = express();
const util = require('util');
const PORT = 8080;
const router = express.Router()
const path = require('path');

const session = require('express-session');
// const path = require('path');


// Set EJS as templating engine
app.set('view engine', 'ejs');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());       
app.use(express.urlencoded({extended: true})); 
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
  res.render('game');

  // res.status(404).sendFile('/absolute/path/to/404.png')
})

app.get('/view-class', (req, res) => {

  let classCode =  new URL("http://" + req.url).searchParams.get('classCode');
  let sql = "SELECT courseName FROM courses WHERE courseCode = " + classCode;
  db.query(sql, (err, result) => {
    if (err) throw err 

    // console.log("class name: ", result, result[0].courseName);

//     SELECT Orders.OrderID, Customers.CustomerName, Orders.OrderDate
// FROM Orders
// INNER JOIN Customers ON Orders.CustomerID=Customers.CustomerID;


let sql2 = "SELECT student_scores.studentId, students.username, student_scores.score, student_scores.track, student_scores.starsCollected, student_scores.timeToComplete FROM student_scores INNER JOIN students ON student_scores.studentId=students.id and classCode=" + classCode;

    // let sql2 = "SELECT * FROM students WHERE classCode = " + classCode;
    db.query(sql2, (err2, result2) => {
      if (err2) throw err2

      // console.log("all students  ",  Object.values(JSON.parse(JSON.stringify(result2))));

      let allStudentData =  Object.values(JSON.parse(JSON.stringify(result2)))
      // let textToSend = ""
      // allStudentData.forEach(student => {
      //   textToSend += "<tr><td>" + student.username + "</td></tr>"
      // })

      let textToSend2 = []
      allStudentData.forEach(student => {
        textToSend2.push("<li class='sidebar-item'>  <a class='sidebar-link waves-effect waves-dark sidebar-link' href='/view-class?classCode="+ student.studentId +"' aria-expanded='false'> <span class='hide-menu'>" + student.username + "</span>  </a> </li>")

        // textToSend2 += "<tr><td>" + student.username + "</td></tr>"
      })

      let allStudentsInTableData = []
      allStudentData.forEach((student, index) => {
        allStudentsInTableData.push("<tr><td>"+(index + 1)+"</td><td>"+ student.username + "</td><td>" + student.score + "</td><td>" + student.timeToComplete + "</td></tr>")
      })

      let allStudentsDropDown = []
      allStudentData.forEach((student, index) => {
        allStudentsDropDown.push("<option value='" + student.username + "'>")
      })

      res.render('view-class', 
            {
              className: result[0].courseName.toString(),
              totalStudents: result2.length,
              newestStudent: result2[result2.length - 1],
              allStudents: textToSend2,
              allStudentsInTable: allStudentsInTableData,
              allStudentsDropDown: allStudentsDropDown
            });
      
      
    })
    
  })
  // let className = 


  // sql = "SELECT * FROM courses WHERE teacherId = " + req.session.teacherId;
  //   db.query(sql, (err, result) => {
  //     if (err) throw err 
  //     req.session.totalClasses =  parseInt(result.length);
  //     req.session.allClasses = result;

  //     let allStudents, totalStudents, newestStudent
  //     sql2 = "SELECT * FROM students WHERE classCode=" + result[0].courseCode;
  //     db.query(sql2, (err2, result2) => {
  //       console.log(result2);
  //       if (err2) throw err2
  //       allStudents = result2;
  //       totalStudents = parseInt(result2.length);
  //       newestStudent = result2[parseInt(result2.length) - 1].username;

  //       req.session.allStudents = allStudents;
  //       req.session.totalStudents = totalStudents;
  //       req.session.newestStudent = newestStudent;
  
  //       let classNames = []
  //       for (let i = 0; i < result.length; i++) {
  //         // classNames.push(result[i].courseName)
  //         console.log("result["+i+"]: ", result[i]);
  //         classNames.push("<li class='sidebar-item'>  <a class='sidebar-link waves-effect waves-dark sidebar-link' href='/view-class?classCode="+ result[i].courseCode +"' aria-expanded='false'> <span class='hide-menu'>" + result[i].courseName + "</span>  </a> </li>")
          
  //         // <li class="sidebar-item">
  //         //                   <a class="sidebar-link waves-effect waves-dark sidebar-link" href="/view-class?classCode=000"
  //         //                       aria-expanded="false">
  //         //                       <span class="hide-menu"> <%= classNames %></span>
  //         //                   </a>
  //         //               </li>
  //       }
  //       req.session.classNames = classNames
        
  //       res.render('view-class', 
  //       {
  //         totalStudents: req.session.totalStudents,
  //         totalClasses: req.session.totalClasses,
  //         allStudents: req.session.allStudents,
  //         newestStudent: req.session.newestStudent,
  //         classNames:  req.session.classNames
  //       });
  //     });

      
  //   });


  // res.render('view-class');
})

app.get('/login', (req, res) => {
  // console.log("asdf");
  res.render('login');
})

app.post('/process_login', (req, res) => {

  const myUsername = req.body.myUsername;
  const myPassword = req.body.myPassword;

  if (myUsername && myPassword) 
  {
    sql = `SELECT * FROM teachers WHERE email = '${myUsername}' AND passwordHash = '${myPassword}'`;

    db.query(sql, (err, results) => {
      if (err) throw err 
      // console.log(results[0].length);

      // res.render('dashboard', {teacherId: results[0].id});
      if (results.length > 0) 
      {
        // Authenticate the user
        // console.log(results[0])
        
        req.session.loggedin = true;
        req.session.teacherId = results[0].id;
        req.session.teacherFirstName = results[0].firstName;
        req.session.teacherLastName = results[0].lastName;
        req.session.teacherEmail = results[0].email;
        // Redirect to home page
        res.redirect('/dashboard');
      } 
      else 
      {
        req.session.loggedin = false;
        res.send('Incorrect Username and/or Password!');
      }			
    });
  }
  else 
  {
    req.session.loggedin = false;
		res.send('Please enter Username and Password!');
		res.end();
	}



})



async function getTeacherData(id)
{
  sql = "SELECT * from teachers WHERE id=" + id;
  let finalResult = await db.query(sql, (err, result) => {
    if (err) throw err;

    return result[0];
  });
  
  return await finalResult
}

async function getTotalStudents(id)
{
  // sql = "SELECT COUNT(id) from students WHERE classCode='000'";
  // db.query(sql, (err, result) => {
  //   if (err) throw err;
  //   allTeacherData = ("[" + Object.values(result[0]) + "]").split(",");

  //   return result
  // });
  // return finalResult
}


app.get('/dashboard', (req, res) => {
  
  // console.log(req)
  
  if (req.session.teacherId != null && req.session.loggedin)
  {
    sql = "SELECT * FROM courses WHERE teacherId = " + req.session.teacherId;
    db.query(sql, (err, result) => {
      if (err) throw err 
      req.session.totalClasses =  parseInt(result.length);
      req.session.allClasses = result;

      let allStudents, totalStudents, newestStudent
      sql2 = "SELECT * FROM students WHERE classCode=" + result[0].courseCode;
      db.query(sql2, (err2, result2) => {
        console.log(result2);
        if (err2) throw err2
        allStudents = result2;
        totalStudents = parseInt(result2.length);
        newestStudent = result2[parseInt(result2.length) - 1].username;

        req.session.allStudents = allStudents;
        req.session.totalStudents = totalStudents;
        req.session.newestStudent = newestStudent;
  
        let classNames = []
        for (let i = 0; i < result.length; i++) {
          // classNames.push(result[i].courseName)
          console.log("result["+i+"]: ", result[i]);
          classNames.push("<li class='sidebar-item'>  <a class='sidebar-link waves-effect waves-dark sidebar-link' href='/view-class?classCode="+ result[i].courseCode +"' aria-expanded='false'> <span class='hide-menu'>" + result[i].courseName + "</span>  </a> </li>")
          
          // <li class="sidebar-item">
          //                   <a class="sidebar-link waves-effect waves-dark sidebar-link" href="/view-class?classCode=000"
          //                       aria-expanded="false">
          //                       <span class="hide-menu"> <%= classNames %></span>
          //                   </a>
          //               </li>
        }
        req.session.classNames = classNames
        
        res.render('dashboard', 
        {
          totalStudents: req.session.totalStudents,
          totalClasses: req.session.totalClasses,
          allStudents: req.session.allStudents,
          newestStudent: req.session.newestStudent,
          classNames:  req.session.classNames
        });
      });

      
    });

    


    
  }
  else
  {
    res.send("not logged in")
  }
    // teacherClassCodes = JSON.parse(teacher.courses)


  
  
  // console.log("codes: ", teacherClassCodes)

  // sql = "SELECT * from students WHERE id=" + id;
  // // let teacher;
  // db.query(sql, (err, res) => {
  //   if (err) throw err;
  //   teacher = res;
  // });


  


})




app.post('/new-class', (req, res) => {

  const className = req.body.className;
  let randCourseCode = makeid(8) 

  if (className && req.session.teacherId != null) 
  {

    let sql = "INSERT INTO courses (courseName, courseCode, teacherId) VALUES ('" + className + "', '" + randCourseCode + "', " + req.session.teacherId + ")";
    
    db.query(sql, (err) => { 
      if (err) throw err
      console.log(sql);

      res.redirect("/view-class?classCode=" + randCourseCode)
    });

    
  }
})


app.post('/remove-student', (req, res) => {

  const studentId = req.body.studentsSelected;

  if (studentId && req.session.teacherId != null) 
  {
    let sql = "UPDATE students SET classCode = '000' WHERE username ='" + studentId + "'";
    
    db.query(sql, (err) => { 
      if (err) throw err
      console.log(sql);

      // res.redirect("/view-class?classCode=" + randCourseCode)
      res.redirect(req.originalUrl)
    });
  }
})







app.get('/leaderboardData', (req, res) => {
  let sql = "SELECT * from student_scores ORDER BY score DESC LIMIT 20";
  sql = "SELECT * from student_scores LEFT JOIN students ON student_scores. studentId = students.id ORDER BY score DESC"
  
  db.query(sql, (err, result) => {
    if (err) throw err 
    res.send(result);
  });
})

app.get('/newDevice', (req, res) => {

  const search_params = new URL("http://" + req.url).searchParams;
  // let sendDataLink = `http://localhost:8080/newDevice?username=asdfasdfasdf3`
  let username = search_params.get('username');
  let sql =  "INSERT INTO students VALUES (0 ,'" + username +  "')";
  db.query(sql, (err, result) => { 
    if (err) throw err
    res.send(result)});
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
  clearTable('courses')
  clearTable('students')
  clearTable('teachers')
  
  // generate random data
  let scoreToInsert = JSON.parse(getScores())

  // create random students
  let randCourseCode1 = '123456789'
  let randCourseCode2 = '123456788'

  scoreToInsert.forEach((score, i) => {
    
    let theClassCode = (Math.random() < 0.5) ? randCourseCode1 : randCourseCode2

    let sql = "INSERT INTO students (id, username, classCode) VALUES (" + i +", '" + score.name + "', '" + theClassCode + "')";
    db.query(sql, (err) => { if (err) throw err });
  })

  // scoreToInsert.forEach((score, i) => {
  //   let sql = "INSERT INTO student_enrollment (id, studentId, classCode) VALUES (" + i +", '" + score.name + "', '000')";
  //   db.query(sql, (err) => { if (err) throw err });
  // })

  teachersToCreate = JSON.parse(getScores())

  // create random students
  teachersToCreate.forEach((teacher, i) => {
    let emailAddress = teacher.firstName + teacher.lastName + Math.round(Math.random() * 999) + "@ithaca.edu";

    let sql = "INSERT INTO teachers (id, firstName, lastName, email, passwordHash, courses) VALUES (" + i + ",'" + teacher.firstName + "', '" + teacher.lastName + "', '" + emailAddress.toString().toLowerCase() + "', 'qwerty123', null)";
    db.query(sql, (err) => { if (err) throw err });
  })

  let sql = "INSERT INTO courses (id, courseName, courseCode, teacherId) VALUES (0, 'PHYS 102 2022', '123456789', 0)";
  db.query(sql, (err) => { if (err) throw err });
  sql = "INSERT INTO courses (id, courseName, courseCode, teacherId) VALUES (1, 'PHYS 102 2023', '123456788', 0)";
  db.query(sql, (err) => { if (err) throw err });


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
    let firstNames = ["Davina", "Tillie", "Hugh", "Ria", "Elsa", "Joseph", "Steffan", "Tommy", "Nieve", "Umair", "Hebert", "Silva", "Baker", "Sandoval", "Bolton", "Martin", "Skinner", "Hammond", "Beard", "Bonilla"]
    let lastNames = ["Wilkinson", "Young", "Hansen", "Richardson", "Pearce", "Acevedo", "Floyd", "Haley", "Stafford", "Guerra", "Muhammad", "Ophelia", "Sian", "Elspeth", "Saul", "Carly", "Leroy", "Rosa", "Ayrton", "Brittney"]
    let classCodes = ["IC PHYS 102 1", "IC PHYS 102 2", "IC PHYS 102 2", "IC PHYS 102 3", "IC PHYS 102 3", "IC PHYS 102 3", "IC PHYS 102 2", "IC PHYS 102 4", "IC PHYS 102 5", "IC PHYS 102 6", "IC PHYS 102 1", "IC PHYS 102 2", "IC PHYS 102 2", "IC PHYS 102 3", "IC PHYS 102 3", "IC PHYS 102 3", "IC PHYS 102 2", "IC PHYS 102 4", "IC PHYS 102 5", "IC PHYS 102 6"]

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


function makeid(length) 
{
  let result           = '';
  let characters       = '123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) 
  {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}