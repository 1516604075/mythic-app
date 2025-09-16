import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = express.Router();

// file upload (local)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const fname = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext;
    cb(null, fname);
  }
});
const upload = multer({ storage });

// One-time elevate to admin
router.post('/elevate', authRequired, body('secret').notEmpty(), async (req, res) => {
  const { secret } = req.body;
  if (secret !== process.env.ADMIN_ELEVATE_SECRET) return res.status(403).json({ error: '密钥不正确' });
  const userId = req.user.id;
  await query('UPDATE users SET is_admin=TRUE WHERE id=$1', [userId]);
  res.json({ message: '已设为管理员' });
});

// Upload image -> returns URL
router.post('/upload-image', authRequired, adminRequired, upload.single('file'), async (req, res) => {
  const url = `/static/uploads/${req.file.filename}`;
  res.json({ url });
});

// Settings
router.get('/settings', authRequired, adminRequired, async (req, res) => {
  const r = await query('SELECT * FROM settings WHERE id=1');
  res.json(r.rows[0]);
});

router.put('/settings', authRequired, adminRequired, async (req, res) => {
  const { home_background_url, ornament_urls, min_withdraw_amount, min_withdraw_hours } = req.body;
  const r = await query(`UPDATE settings SET 
    home_background_url=COALESCE($1, home_background_url),
    ornament_urls=COALESCE($2, ornament_urls),
    min_withdraw_amount=COALESCE($3, min_withdraw_amount),
    min_withdraw_hours=COALESCE($4, min_withdraw_hours)
    WHERE id=1 RETURNING *`,
    [home_background_url, ornament_urls, min_withdraw_amount, min_withdraw_hours]);
  res.json(r.rows[0]);
});

// Home buttons CRUD (expect up to 6)
router.get('/home-buttons', authRequired, adminRequired, async (req, res) => {
  const r = await query('SELECT * FROM home_buttons ORDER BY sort_order ASC, id ASC');
  res.json(r.rows);
});

router.post('/home-buttons', authRequired, adminRequired, async (req, res) => {
  const buttons = req.body.buttons || [];
  await query('DELETE FROM home_buttons');
  for (let i=0; i<buttons.length; i++) {
    const b = buttons[i];
    await query('INSERT INTO home_buttons (label, icon_url, content_text, sort_order) VALUES ($1,$2,$3,$4)',
      [b.label, b.icon_url, b.content_text, i]);
  }
  const r = await query('SELECT * FROM home_buttons ORDER BY sort_order ASC, id ASC');
  res.json(r.rows);
});

// Recycle long image
router.get('/recycle', authRequired, adminRequired, async (req, res) => {
  const r = await query('SELECT * FROM recycle_config WHERE id=1');
  res.json(r.rows[0]);
});
router.put('/recycle', authRequired, adminRequired, async (req, res) => {
  const { image_url } = req.body;
  const r = await query('UPDATE recycle_config SET image_url=$1, updated_at=NOW() WHERE id=1 RETURNING *', [image_url]);
  res.json(r.rows[0]);
});

// Profile buttons CRUD (expect 4)
router.get('/profile-buttons', authRequired, adminRequired, async (req, res) => {
  const r = await query('SELECT * FROM profile_buttons ORDER BY sort_order ASC, id ASC');
  res.json(r.rows);
});
router.post('/profile-buttons', authRequired, adminRequired, async (req, res) => {
  const items = req.body.items || [];
  await query('DELETE FROM profile_buttons');
  for (let i=0; i<items.length; i++) {
    const it = items[i];
    await query('INSERT INTO profile_buttons (label, type, payload, sort_order) VALUES ($1,$2,$3,$4)',
      [it.label, it.type || 'modal', it.payload || '', i]);
  }
  const r = await query('SELECT * FROM profile_buttons ORDER BY sort_order ASC, id ASC');
  res.json(r.rows);
});

// Avatars
router.get('/avatars', authRequired, adminRequired, async (req, res) => {
  const r = await query('SELECT * FROM avatars ORDER BY id DESC');
  res.json(r.rows);
});
router.post('/avatars', authRequired, adminRequired, upload.single('file'), async (req, res) => {
  const url = `/static/uploads/${req.file.filename}`;
  const r = await query('INSERT INTO avatars (url) VALUES ($1) RETURNING *', [url]);
  res.json(r.rows[0]);
});

// Generate withdrawal records
router.post('/generate-withdrawals', authRequired, adminRequired, async (req, res) => {
  const { amountMin=50, amountMax=300, dateStart, dateEnd, count=50, namePrefix='用户' } = req.body || {};
  const start = dateStart ? new Date(dateStart) : new Date(Date.now() - 7*24*3600*1000);
  const end = dateEnd ? new Date(dateEnd) : new Date();
  const inserts = [];
  for (let i=0; i<count; i++) {
    const amount = (Math.random() * (amountMax - amountMin) + amountMin).toFixed(2);
    const t = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const uname = `${namePrefix}${String(i+1).padStart(3,'0')}`;
    inserts.push(query('INSERT INTO withdrawal_records (username, amount, occurred_at) VALUES ($1,$2,$3)',
      [uname, amount, t]));
  }
  await Promise.all(inserts);
  res.json({ message: '已生成', count });
});

export default router;
