const mysql = require('mysql');
const express = require("express");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
  });
  
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   con.query("CREATE DATABASE mydb", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
// });

db.connect((err) => {
    if (err) throw err;
    console.log("MySql Connected");
  });