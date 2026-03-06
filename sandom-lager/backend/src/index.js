const express = require("express");
require("dotenv").config();
const testRoutes = require("./routes/test.routes");

const itemsRoutes = require("./routes/items.routes");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Allow requests from the Vite dev server
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend kjører - Sandom Lager");
});

// Items API
app.use("/items", itemsRoutes);

app.listen(PORT, () => {
  console.log("Backend startet på port " + PORT);
});

// Secure test route
app.use("/api", testRoutes);

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