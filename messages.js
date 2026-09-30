const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.get("/conversations", auth, async (req,res) => {
  const q = await pool.query(`
    SELECT c.id, max(m.created_at) AS last_message
    FROM conversations c
    JOIN conversation_members cm ON cm.conversation_id=c.id
    LEFT JOIN messages m ON m.conversation_id=c.id
    WHERE cm.user_id=$1
    GROUP BY c.id ORDER BY last_message DESC NULLS LAST`, [req.user.id]);
  res.json(q.rows);
});

router.get("/conversations/:id", auth, async (req,res) => {
  const allowed = await pool.query(
    `SELECT 1 FROM conversation_members WHERE conversation_id=$1 AND user_id=$2`,
    [req.params.id,req.user.id]
  );
  if (!allowed.rowCount) return res.status(403).json({error:"Sin acceso"});
  const q = await pool.query(
    `SELECT id,sender_id,body,media_url,created_at FROM messages
     WHERE conversation_id=$1 ORDER BY created_at ASC LIMIT 200`,
    [req.params.id]
  );
  res.json(q.rows);
});

router.post("/conversations", auth, async (req,res) => {
  const other = req.body.userId;
  if (!other || other === req.user.id) return res.status(400).json({error:"Usuario inválido"});
  const c = await pool.query(`INSERT INTO conversations(id) VALUES(gen_random_uuid()) RETURNING id`);
  const id = c.rows[0].id;
  await pool.query(`INSERT INTO conversation_members(conversation_id,user_id) VALUES($1,$2),($1,$3)`,
    [id,req.user.id,other]);
  res.status(201).json({id});
});

router.post("/conversations/:id", auth, async (req,res) => {
  const allowed = await pool.query(
    `SELECT 1 FROM conversation_members WHERE conversation_id=$1 AND user_id=$2`,
    [req.params.id,req.user.id]
  );
  if (!allowed.rowCount) return res.status(403).json({error:"Sin acceso"});
  const body = String(req.body.body || "").trim();
  if (!body) return res.status(400).json({error:"Mensaje vacío"});
  const q = await pool.query(
    `INSERT INTO messages(id,conversation_id,sender_id,body)
     VALUES(gen_random_uuid(),$1,$2,$3) RETURNING *`,
    [req.params.id,req.user.id,body]
  );
  res.status(201).json(q.rows[0]);
});

module.exports = router;
