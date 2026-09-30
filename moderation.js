const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.post("/blocks/:id", auth, async (req,res) => {
  await pool.query(
    `INSERT INTO blocks(blocker_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
    [req.user.id,req.params.id]
  );
  res.json({ok:true});
});

router.delete("/blocks/:id", auth, async (req,res) => {
  await pool.query(`DELETE FROM blocks WHERE blocker_id=$1 AND blocked_id=$2`,
    [req.user.id,req.params.id]);
  res.json({ok:true});
});

router.post("/reports", auth, async (req,res) => {
  const { reportedUserId, postId, reason, details } = req.body;
  if (!reason) return res.status(400).json({error:"Falta el motivo"});
  const q = await pool.query(
    `INSERT INTO reports(id,reporter_id,reported_user_id,post_id,reason,details)
     VALUES(gen_random_uuid(),$1,$2,$3,$4,$5) RETURNING id`,
    [req.user.id,reportedUserId || null,postId || null,reason,details || null]
  );
  res.status(201).json(q.rows[0]);
});

module.exports = router;
