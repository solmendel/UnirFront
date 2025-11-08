const express = require("express");
const cors = require("cors");
require("./db/database");

const authRoutes = require("./routes/authRoutes");
const collaboratorsRoutes = require("./routes/collaborators");
const historyRoutes = require("./routes/historyRoutes");
const historyMiddleware = require("./middlewares/historyMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para registrar acciones POST y PUT
app.use(historyMiddleware.logAction);

app.use("/api/auth", authRoutes);
app.use("/api/collaborators", collaboratorsRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "API UNIR funcionando 🚀" });
});

app.listen(3001, () => {
  console.log("🚀 Backend en http://localhost:3001");
});
