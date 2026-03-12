const express = require("express");
require("dotenv").config();


const recipesRoutes = require("./routes/recipes.routes");
const recipeIngredientsRoutes = require("./routes/recipeIngredients.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const userLocationsRoutes = require("./routes/userLocations.routes");
const ingredientsRoutes = require("./routes/ingredients.routes");
const shoppingListRoutes = require("./routes/shoppingList.routes");
const testRoutes = require("./routes/test.routes");
const userRoutes = require("./routes/user.routes");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json({ limit: "8mb" }));

// Allow requests from the Vite dev server
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend kjører - Sandom Lager");
});

// Sandom API
app.use("/api", testRoutes);
app.use("/api", userRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api", recipeIngredientsRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", userLocationsRoutes);
app.use("/api", ingredientsRoutes);
app.use("/api", shoppingListRoutes);

// Error handling middleware for JWT authentication errors and other server errors
// express-jwt v8 throws InvalidTokenError (403) for bad tokens and UnauthorizedError (401) for missing tokens
app.use((err, req, res, next) => {
  console.error("[error handler]", err.name, err.message);

  if (err.name === "UnauthorizedError" || err.name === "InvalidTokenError") {
    return res.status(401).json({
      message: "Invalid or missing token",
      detail: err.message,
    });
  }

  res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend startet på port ${PORT}`);
});