import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/bind-alipay',
  authRequired,
  body('alipay_name').isLength({ min: 2 }),
  body('alipay_account').isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { alipay_name, alipay_account } = req.body;
    const r = await query('UPDATE users SET alipay_name=$1, alipay_account=$2 WHERE id=$3 RETURNING id, username, alipay_name, alipay_account, avatar_url, user_no',
      [alipay_name, alipay_account, req.user.id]);
    res.json({ message: '绑定成功', user: r.rows[0] });
  }
);

router.post('/choose-avatar', authRequired, body('avatar_url').notEmpty(), async (req, res) => {
  const { avatar_url } = req.body;
  await query('UPDATE users SET avatar_url=$1 WHERE id=$2', [avatar_url, req.user.id]);
  res.json({ message: '已更新头像', avatar_url });
});

export default router;
