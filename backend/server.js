const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Connection error:", err));

app.get("/jobLists", async (req, res) => {
  const { searchTerm } = req.query;
  let queryText = "SELECT * FROM job_listings";
  let queryParams = [];

  if (searchTerm) {
    queryText += " WHERE title ILIKE $1 OR description ILIKE $1";
    queryParams = [`%${searchTerm}%`];
  }

  try {
    const result = await pool.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching jobs" });
  }
});

app.get("/jobLists/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM job_listings WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).send("Job not found");
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.post("/jobLists", async (req, res) => {
  const { title, description, company, location, type, postedago, isremote, tags } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO job_listings (title, description, company, location, type, postedago, isremote, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, company, location, type, postedago, isremote, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
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
      res.status(404).json({ error: "Job not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/jobLists/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM job_listings WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Job deleted" });
    } else {
      res.status(404).send("Job not found");
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on ${port}`));
