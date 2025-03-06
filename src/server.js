const express = require("express");
const database=require("./database");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

database.connect(err => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

app.use(bodyParser.json());

app.get("/create_table",(req,res)=>{
  const createTableQuery = `CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL
  )`;
  database.query(createTableQuery, (err) => {
    if (err) {
      res.status(404).send("Error creating table: ", err);
    }
  });
  res.json({
    "message ":"The table is created"
  });
});


app.post("/addSchool", (req, res) => {
  const { name, address, latitude, longitude } = req.body;


  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ message: "All fields are required." });
  }
  const data=[name, address, latitude, longitude];
  const query = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  database.query(query, data, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(201).json({ message: "School added successfully", schoolId: result.insertId });
  });
});


function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = angle => (Math.PI / 180) * angle;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// List Schools API
app.get("/listSchools", (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: "Latitude and longitude are required." });
  }

  const query = "SELECT * FROM schools";
  database.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    console.log(results);
    const sortedSchools = results.map(school => ({
      ...school,
      distance: haversineDistance(parseFloat(latitude), parseFloat(longitude), school.latitude, school.longitude)
    })).sort((a, b) => a.distance - b.distance);
    
    res.status(200).json(sortedSchools);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
