const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.get("/me", auth, async (req,res) => {
  const q = await pool.query(
    `SELECT u.id,u.username,u.email,p.display_name,p.bio,p.avatar_url,p.cover_url
     FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=$1`,
    [req.user.id]
  );
  res.json(q.rows[0] || null);
});

router.patch("/me", auth, async (req,res) => {
  const { displayName, bio, avatarUrl, coverUrl } = req.body;
  const q = await pool.query(
    `UPDATE profiles SET display_name=COALESCE($1,display_name),
      bio=COALESCE($2,bio),avatar_url=COALESCE($3,avatar_url),
      cover_url=COALESCE($4,cover_url),updated_at=now()
     WHERE user_id=$5 RETURNING *`,
    [displayName,bio,avatarUrl,coverUrl,req.user.id]
  );
  res.json(q.rows[0]);
});

router.get("/search", auth, async (req,res) => {
  const term = `%${String(req.query.q || "").trim()}%`;
  const q = await pool.query(
    `SELECT u.id,u.username,p.display_name,p.avatar_url
     FROM users u JOIN profiles p ON p.user_id=u.id
     WHERE u.username ILIKE $1 OR p.display_name ILIKE $1
     ORDER BY p.display_name LIMIT 20`,
    [term]
  );
  res.json(q.rows);
});

module.exports = router;
