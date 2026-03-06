const express = require("express");

const testRoutes = require("./routes/test.routes");
const recipesRoutes = require("./routes/recipes.routes");
const recipeIngredientsRoutes = require("./routes/recipeIngredients.routes");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend kjører - Sandom Lager");
});

// Items API
app.use("/api", testRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api", recipeIngredientsRoutes);

// Error handling middleware for JWT authentication errors and other server errors
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      message: "Invalid or missing token",
    });
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend startet på port ${PORT}`);
});