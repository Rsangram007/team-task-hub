const db = require("./src/config/db");

// Test the database connection
console.log("Testing database connection...");

// Simple query to test connection
db.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err.stack);
    process.exit(1);
  } else {
    console.log("Database connected successfully!");
    console.log("Current time from database:", res.rows[0].now);
    process.exit(0);
  }
});
