const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req,res) => {
  const q = await pool.query(`
    SELECT p.id,p.body,p.created_at,u.id AS user_id,u.username,pr.display_name,pr.avatar_url,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) AS comments,
      (SELECT COUNT(*) FROM reactions r WHERE r.post_id=p.id) AS reactions
    FROM posts p
    JOIN users u ON u.id=p.user_id
    JOIN profiles pr ON pr.user_id=u.id
    ORDER BY p.created_at DESC LIMIT 50`);
  res.json(q.rows);
});

router.post("/", auth, async (req,res) => {
  const body = String(req.body.body || "").trim();
  if (!body) return res.status(400).json({error:"La publicación está vacía"});
  const q = await pool.query(
    `INSERT INTO posts(id,user_id,body) VALUES(gen_random_uuid(),$1,$2) RETURNING *`,
    [req.user.id, body]
  );
  res.status(201).json(q.rows[0]);
});

router.delete("/:id", auth, async (req,res) => {
  const q = await pool.query(
    `DELETE FROM posts WHERE id=$1 AND user_id=$2 RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (!q.rowCount) return res.status(404).json({error:"Publicación no encontrada"});
  res.json({ok:true});
});

router.post("/:id/reactions", auth, async (req,res) => {
  await pool.query(
    `INSERT INTO reactions(post_id,user_id,type) VALUES($1,$2,'like')
     ON CONFLICT(post_id,user_id) DO NOTHING`,
    [req.params.id, req.user.id]
  );
  res.json({ok:true});
});

router.delete("/:id/reactions", auth, async (req,res) => {
  await pool.query(`DELETE FROM reactions WHERE post_id=$1 AND user_id=$2`,[req.params.id,req.user.id]);
  res.json({ok:true});
});

router.post("/:id/comments", auth, async (req,res) => {
  const body = String(req.body.body || "").trim();
  if (!body) return res.status(400).json({error:"Comentario vacío"});
  const q = await pool.query(
    `INSERT INTO comments(id,post_id,user_id,body) VALUES(gen_random_uuid(),$1,$2,$3)
     RETURNING *`,
    [req.params.id,req.user.id,body]
  );
  res.status(201).json(q.rows[0]);
});

module.exports = router;
