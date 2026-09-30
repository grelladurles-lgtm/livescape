const router = require("express").Router();
const pool = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req,res) => {
  const q = await pool.query(`
    SELECT f.requester_id,f.addressee_id,f.status,u.username,p.display_name,p.avatar_url
    FROM friendships f
    JOIN users u ON u.id=CASE WHEN f.requester_id=$1 THEN f.addressee_id ELSE f.requester_id END
    JOIN profiles p ON p.user_id=u.id
    WHERE (f.requester_id=$1 OR f.addressee_id=$1) AND f.status='accepted'`,
    [req.user.id]);
  res.json(q.rows);
});

router.post("/:id", auth, async (req,res) => {
  if (req.params.id === req.user.id) return res.status(400).json({error:"No puedes agregarte a ti mismo"});
  await pool.query(
    `INSERT INTO friendships(requester_id,addressee_id,status)
     VALUES($1,$2,'pending')
     ON CONFLICT DO NOTHING`,
    [req.user.id,req.params.id]
  );
  res.status(201).json({ok:true});
});

router.post("/:id/accept", auth, async (req,res) => {
  const q = await pool.query(
    `UPDATE friendships SET status='accepted'
     WHERE requester_id=$1 AND addressee_id=$2 RETURNING *`,
    [req.params.id,req.user.id]
  );
  res.json({ok:!!q.rowCount});
});

module.exports = router;
