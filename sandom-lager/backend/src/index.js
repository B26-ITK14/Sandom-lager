const express = require("express");
require("dotenv").config();

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
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

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

// Start server
app.listen(PORT, () => {
  console.log(`Backend startet på port ${PORT}`);
});