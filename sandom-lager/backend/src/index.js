const express = require("express");

const itemsRoutes = require("./routes/items.routes");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend kjører - Sandom Lager");
});

// Items API
app.use("/items", itemsRoutes);

app.listen(PORT, () => {
  console.log("Backend startet på port " + PORT);
});
