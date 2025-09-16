import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';

const router = express.Router();

function randomUserNo() {
  // e.g. MX-2025-xxxxx
  const n = Math.floor(Math.random()*90000+10000);
  return `MX-${new Date().getFullYear()}-${n}`;
}

router.post('/register',
  body('username').isLength({ min: 3, max: 30 }),
  body('password').isLength({ min: 6, max: 100 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
      // ensure unique user_no
      let userNo = randomUserNo();
      let tries = 0;
      while (tries < 5) {
        const exists = await query('SELECT 1 FROM users WHERE user_no=$1', [userNo]);
        if (exists.rowCount === 0) break;
        userNo = randomUserNo();
        tries++;
      }
      const result = await query(
        'INSERT INTO users (username, password_hash, user_no) VALUES ($1,$2,$3) RETURNING id, username, is_admin, user_no',
        [username, hash, userNo]
      );
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
      res.json({ message: '注册成功', user });
    } catch (e) {
      if (e.message.includes('unique') || e.message.includes('duplicate')) {
        return res.status(400).json({ error: '用户名已存在' });
      }
      console.error(e);
      res.status(500).json({ error: '服务器错误' });
    }
  }
);

router.post('/login',
  body('username').notEmpty(),
  body('password').notEmpty(),
  async (req, res) => {
    const { username, password } = req.body;
    const result = await query('SELECT * FROM users WHERE username=$1', [username]);
    if (result.rowCount === 0) return res.status(400).json({ error: '用户名或密码错误' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: '用户名或密码错误' });
    const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ message: '登录成功', user: { id: user.id, username: user.username, is_admin: user.is_admin, user_no: user.user_no, alipay_name: user.alipay_name, alipay_account: user.alipay_account, avatar_url: user.avatar_url } });
  }
);

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: '已退出' });
});

router.get('/me', async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query('SELECT id, username, is_admin, user_no, alipay_name, alipay_account, avatar_url FROM users WHERE id=$1', [payload.id]);
    res.json({ user: result.rows[0] });
  } catch (e) {
    res.json({ user: null });
  }
});

export default router;
