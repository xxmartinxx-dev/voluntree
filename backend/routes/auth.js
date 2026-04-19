const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { REST_SECRET } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (role !== 'volunteer' && role !== 'organization') {
    return res.status(400).json({ error: 'Role must be volunteer or organization.' });
  }

  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      `INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, email, password_hash, role]
    );
    
    res.status(201).json({ id: result.rows[0].id, name, email, role });
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({ error: 'Email already exists.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  try {
    const result = await db.query(`SELECT * FROM Users WHERE email = $1`, [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      REST_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
