const express = require("express");
require("dotenv").config();
const pool = require("./db/pool");

const ErrorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");

// Routes
const recipesRoutes = require("./routes/recipes.routes");
const recipeIngredientsRoutes = require("./routes/recipeIngredients.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const userLocationsRoutes = require("./routes/userLocations.routes");
const ingredientsRoutes = require("./routes/ingredients.routes");
const shoppingListRoutes = require("./routes/shoppingList.routes");
const testRoutes = require("./routes/test.routes");
const userRoutes = require("./routes/user.routes");
const locationsRoutes = require("./routes/locations.routes");
const uploadRoutes = require("./routes/uploadRoutes");

const PORT = process.env.PORT || 3001;

const app = express();

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "AUTH0_DOMAIN",
  "AUTH0_AUDIENCE",
  "AUTH0_M2M_CLIENT_ID",
  "AUTH0_M2M_CLIENT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const CORE_TABLES = [
  "users",
  "user_locations",
  "locations",
  "ingredients",
  "inventory",
  "recipes",
  "shopping_list",
  "allergens",
  "recipe_allergens",
  "logs",
  "user_sessions",
  "revoked_sessions",
];

function logEnvDiagnostics() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.error(`[startup] Missing required env vars: ${missing.join(", ")}`);
  } else {
    console.log("[startup] Required env vars are present");
  }

  if (!process.env.ALLOWED_ORIGINS) {
    console.warn("[startup] ALLOWED_ORIGINS not set; CORS middleware currently allows all origins");
  }

  if (process.env.DATABASE_URL) {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      console.log(`[startup] DB host: ${dbUrl.hostname}, db: ${dbUrl.pathname.replace("/", "") || "(default)"}`);
    } catch {
      console.warn("[startup] DATABASE_URL is set but could not be parsed as URL");
    }
  }

  return missing;
}

async function logDatabaseDiagnostics() {
  try {
    await pool.query("SELECT 1");
    console.log("[startup] Database connectivity check passed");
  } catch (err) {
    console.error("[startup] Database connectivity check failed", {
      code: err.code,
      message: err.message,
      detail: err.detail,
    });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'`
    );

    const existing = new Set(result.rows.map((row) => row.table_name));
    const missingTables = CORE_TABLES.filter((tableName) => !existing.has(tableName));

    if (missingTables.length > 0) {
      console.error(
        `[startup] Missing expected DB tables: ${missingTables.join(", ")}. ` +
          "Run backend/src/db/schema.sql (and seed if needed) against the database in DATABASE_URL."
      );
    } else {
      console.log("[startup] Core DB tables detected");
    }
  } catch (err) {
    console.error("[startup] Failed to inspect DB tables", {
      code: err.code,
      message: err.message,
      detail: err.detail,
    });
  }
}

app.use(express.json({ limit: "8mb" }));

// Allow requests from the Vite dev server
// CORS middleware: allow origins configured via ALLOWED_ORIGINS (comma-separated).
// If ALLOWED_ORIGINS is not set, fall back to allowing all origins.
app.use((req, res, next) => {
  const allowedEnv = process.env.ALLOWED_ORIGINS || "";
  const allowed = allowedEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = req.headers.origin;

  if (allowed.length === 0) {
    // No specific origins configured — allow all (useful for quick deployments).
    res.header("Access-Control-Allow-Origin", "*");
  } else if (origin && allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  next();
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Backend kjører - Sandom Lager");
});

// Sandom API endpoints
app.use("/api", testRoutes);
app.use("/api", userRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api", recipeIngredientsRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", userLocationsRoutes);
app.use("/api", ingredientsRoutes);
app.use("/api", shoppingListRoutes);
app.use("/api", locationsRoutes);
app.use("/api", uploadRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

// Error handling middleware for JWT authentication errors and other server errors
// express-jwt v8 throws InvalidTokenError (403) for bad tokens and UnauthorizedError (401) for missing tokens
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError" || err.name === "InvalidTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or missing token",
      detail: err.message,
    });
  }

  next(err);
});

// Global error handler
app.use(ErrorHandler);

async function startServer() {
  const missing = logEnvDiagnostics();
  await logDatabaseDiagnostics();

  app.listen(PORT, () => {
    console.log(`Backend startet på port ${PORT}`);
    if (missing.length > 0) {
      console.warn("[startup] Server started with missing env vars; requests may fail");
    }
  });
}

startServer().catch((err) => {
  console.error("[startup] Fatal startup error", {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});