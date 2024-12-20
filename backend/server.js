const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Update pool configuration to use backend .env variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Error connecting to PostgreSQL:", err));

app.get("/jobLists", async (req, res) => {
  const { searchTerm } = req.query;
  let queryText = "SELECT * FROM job_listings";
  let queryParams = [];

  if (searchTerm) {
    queryText += " WHERE title ILIKE $1 OR description ILIKE $1";
    queryParams = [`%${searchTerm}%`];
  }

  try {
    console.log('Executing query:', queryText, queryParams);
    const result = await pool.query(queryText, queryParams);
    console.log(`Found ${result.rows.length} jobs`);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: "Error fetching job listings" });
  }
});

app.get("/jobLists/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM job_listings WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send("Job listing not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching job listing");
  }
});

app.post("/jobLists", async (req, res) => {
  const { title, description, company, location, type, postedago, isremote, tags } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO job_listings (
        title, description, company, location, type, postedago, isremote, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, company, location, type, postedago, isremote, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/jobLists/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, company, location, type, postedago, isremote, tags } = req.body;

  try {
    const result = await pool.query(
      `UPDATE job_listings 
       SET title = $1, description = $2, company = $3, location = $4, 
           type = $5, postedago = $6, isremote = $7, tags = $8 
       WHERE id = $9 RETURNING *`,
      [title, description, company, location, type, postedago, isremote, tags, id]
    );
    
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Job listing not found" });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/jobLists/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM job_listings WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Job listing deleted successfully" });
    } else {
      res.status(404).send("Job listing not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting job listing");
  }
});

const port = process.env.API_PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
