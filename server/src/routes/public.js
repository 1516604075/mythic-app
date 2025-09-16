import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/home', async (req, res) => {
  const settings = await query('SELECT * FROM settings WHERE id=1');
  const buttons = await query('SELECT * FROM home_buttons ORDER BY sort_order ASC, id ASC');
  res.json({ settings: settings.rows[0], buttons: buttons.rows });
});

router.get('/recycle', async (req, res) => {
  const r = await query('SELECT * FROM recycle_config WHERE id=1');
  res.json(r.rows[0]);
});

router.get('/withdraw-records', async (req, res) => {
  const { limit=50, minAmount, maxAmount, start, end } = req.query;
  let sql = 'SELECT * FROM withdrawal_records WHERE 1=1';
  const params = [];
  let idx = 1;
  if (minAmount) { sql += ` AND amount >= $${idx++}`; params.push(minAmount); }
  if (maxAmount) { sql += ` AND amount <= $${idx++}`; params.push(maxAmount); }
  if (start) { sql += ` AND occurred_at >= $${idx++}`; params.push(new Date(start)); }
  if (end) { sql += ` AND occurred_at <= $${idx++}`; params.push(new Date(end)); }
  sql += ' ORDER BY occurred_at DESC LIMIT ' + Number(limit || 50);
  const r = await query(sql, params);
  res.json(r.rows);
});

router.get('/profile', async (req, res) => {
  const buttons = await query('SELECT * FROM profile_buttons ORDER BY sort_order ASC, id ASC');
  const avatars = await query('SELECT * FROM avatars ORDER BY id DESC LIMIT 50');
  const settings = await query('SELECT * FROM settings WHERE id=1');
  res.json({ buttons: buttons.rows, avatars: avatars.rows, settings: settings.rows[0] });
});

export default router;
