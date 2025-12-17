const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
};

// Create a client instance
const client = new Client(dbConfig);

async function migrate() {
  try {
    // Connect to the database
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected to database successfully!");

    // Read the schema file
    const schemaPath = path.join(__dirname, "sql", "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("Executing schema migration...");

    // Split the schema into individual statements
    // We need to handle the fact that pg doesn't support multiple statements in a single query
    // Also need to handle multi-line statements like CREATE TYPE
    let statements = [];
    let currentStatement = "";

    const lines = schemaSQL.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip comments
      if (trimmedLine.startsWith("--")) {
        continue;
      }

      // If we're in the middle of building a statement, continue adding lines
      if (currentStatement) {
        currentStatement += "\n" + line; // Preserve original line formatting
      } else {
        currentStatement = line; // Start a new statement
      }

      // If line ends with semicolon, we have a complete statement
      if (trimmedLine.endsWith(";")) {
        statements.push(currentStatement);
        currentStatement = "";
      }
    }

    // Filter out empty statements
    statements = statements.filter((stmt) => stmt.trim().length > 0);

    // Clean up statements by removing leading/trailing whitespace and comments
    statements = statements
      .map((stmt) => {
        return stmt
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join(" ")
          .trim();
      })
      .filter((stmt) => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log("Executing:", statement.substring(0, 50) + "...");
      await client.query(statement);
    }

    console.log("Schema migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    console.error("\nTroubleshooting tips:");
    console.error("1. Make sure PostgreSQL is installed and running");
    console.error(
      "2. Check if the database 'team_task_hub' exists (create it if not)"
    );
    console.error("3. Verify database credentials in .env file");
    console.error(
      "4. For local development, ensure DB_HOST=localhost and correct DB_USER/DB_PASSWORD"
    );
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

// Run the migration
migrate();
