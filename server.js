require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.disable("x-powered-by");
app.use(helmet());
app.use(rateLimit({windowMs:15*60*1000,max:300,standardHeaders:true,legacyHeaders:false}));
app.use(express.json({limit:"2mb"}));
app.get("/health", async (req,res) => {
  try {
    const pool = require("./db");
    await pool.query("SELECT 1");
    res.json({ok:true,service:"livescape"});
  } catch {
    res.status(503).json({ok:false,service:"livescape"});
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/moderation", require("./routes/moderation"));

app.use(express.static(path.join(__dirname,"../../frontend")));

app.get("*", (req,res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({error:"Ruta no encontrada"});
  res.sendFile(path.join(__dirname,"../../frontend/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`Livescape activo en port ${port}`));
