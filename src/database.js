const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "bacmjbaxbw2rak4nmmor-mysql.services.clever-cloud.com",
  user: "ullvprklpijlqwru",
  password: "0Vq6MvrMqU1Zylkn6HV3",
  database: "bacmjbaxbw2rak4nmmor",
  port:3306
});

module.exports=db;