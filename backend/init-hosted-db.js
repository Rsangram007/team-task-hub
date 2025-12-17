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
  ssl: true, // Required for Render PostgreSQL
};

async function initHostedDatabase() {
  let client;

  try {
    console.log("Connecting to hosted PostgreSQL database...");
    client = new Client(dbConfig);
    await client.connect();
    console.log("Connected to hosted database successfully!");

    // Read the schema file
    const schemaPath = path.join(__dirname, "sql", "schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("Executing schema migration...");

    // Split the schema into individual statements
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
      try {
        await client.query(statement);
        console.log("✓ Success");
      } catch (err) {
        // Some statements might fail if they already exist, which is OK
        console.warn("⚠ Warning - Statement may already exist:", err.message);
      }
    }

    console.log("\n✅ Schema migration completed successfully!");
    console.log(
      "\nDatabase setup is complete. You can now run the application."
    );
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
    console.error("\nTroubleshooting tips:");
    console.error(
      "1. Check if the database credentials in .env file are correct"
    );
    console.error("2. Verify the database exists on Render");
    console.error("3. Ensure the database user has proper permissions");
    console.error("4. Check if the database is accepting connections");
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log("Database connection closed.");
    }
  }
}

// Run the initialization
initHostedDatabase();
