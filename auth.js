const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

router.post("/register", async (req, res) => {
  const { username, email, password, displayName } = req.body;
  if (!username || !email || !password || !displayName)
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  if (password.length < 8)
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users(username,email,password_hash) VALUES($1,$2,$3)
       RETURNING id,username,email`,
      [username.trim().toLowerCase(), email.trim().toLowerCase(), hash]
    );
    const user = result.rows[0];
    await pool.query(
      `INSERT INTO profiles(user_id,display_name) VALUES($1,$2)`,
      [user.id, displayName.trim()]
    );
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "El usuario o correo ya existe" });
    console.error(e);
    res.status(500).json({ error: "No se pudo crear la cuenta" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT id,username,email,password_hash FROM users WHERE email=$1`,
      [String(email || "").trim().toLowerCase()]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password || "", user.password_hash)))
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" });
    delete user.password_hash;
    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

module.exports = router;
