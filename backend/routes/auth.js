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

    db.run(
      `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [name, email, password_hash, role],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists.' });
          }
          console.error(err);
          return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(201).json({ id: this.lastID, name, email, role });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  db.get(`SELECT * FROM Users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

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
  });
});

module.exports = router;
