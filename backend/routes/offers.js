const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, orgOnlyMiddleware } = require('../middleware/auth');

// GET /api/offers - Get all active offers, optionally filtered
router.get('/', (req, res) => {
  const { category, location } = req.query;
  
  let query = `
    SELECT Offers.*, Users.name as organization_name 
    FROM Offers 
    JOIN Users ON Offers.organization_id = Users.id 
    WHERE status = 'active'
  `;
  const params = [];

  if (category && category !== 'all') {
    query += ` AND category = ?`;
    params.push(category);
  }

  if (location && location !== '') {
    query += ` AND location LIKE ?`;
    params.push(`%${location}%`);
  }

  query += ` ORDER BY created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
    res.json(rows);
  });
});

// GET /api/offers/my-offers - Org only
router.get('/my-offers', authMiddleware, orgOnlyMiddleware, (req, res) => {
  const orgId = req.user.id;
  
  const query = `
    SELECT * FROM Offers 
    WHERE organization_id = ? 
    ORDER BY created_at DESC
  `;
  
  db.all(query, [orgId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
    res.json(rows);
  });
});


// POST /api/offers - Create a new offer (org only)
router.post('/', authMiddleware, orgOnlyMiddleware, (req, res) => {
  const { title, description, location, category } = req.body;
  const orgId = req.user.id;

  if (!title || !description || !location || !category) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  db.run(
    `INSERT INTO Offers (title, description, location, category, organization_id) VALUES (?, ?, ?, ?, ?)`,
    [title, description, location, category, orgId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
      }
      res.status(201).json({ id: this.lastID, title, description, location, category, status: 'active' });
    }
  );
});

module.exports = router;
