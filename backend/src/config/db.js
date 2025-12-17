const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// Determine if we're in a production environment
const isProduction = process.env.NODE_ENV === "production";

// PostgreSQL connection pool configuration
const poolConfig = isProduction
  ? {
      // Production configuration - use Render database URL if available
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      // Development configuration
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "team_task_hub",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

// PostgreSQL connection pool
const pool = new Pool(poolConfig);

// Test the database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
