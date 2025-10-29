const express = require("express");
const cors = require("cors");
require("./db/database");

const authRoutes = require("./routes/authRoutes");
const collaboratorsRoutes = require("./routes/collaborators");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/collaborators", collaboratorsRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "API UNIR funcionando 🚀" });
});

app.listen(3001, () => {
  console.log("🚀 Backend en http://localhost:3001");
});
