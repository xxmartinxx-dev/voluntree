const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, orgOnlyMiddleware } = require('../middleware/auth');

// GET /api/offers - Get all active offers, optionally filtered
router.get('/', async (req, res) => {
  const { category, location } = req.query;
  
  let query = `
    SELECT Offers.*, Users.name as organization_name 
    FROM Offers 
    JOIN Users ON Offers.organization_id = Users.id 
    WHERE status = 'active'
  `;
  const params = [];

  if (category && category !== 'all') {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }

  if (location && location !== '') {
    params.push(`%${location}%`);
    query += ` AND location LIKE $${params.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/offers/my-offers - Org only
router.get('/my-offers', authMiddleware, orgOnlyMiddleware, async (req, res) => {
  const orgId = req.user.id;
  
  const query = `
    SELECT * FROM Offers 
    WHERE organization_id = $1 
    ORDER BY created_at DESC
  `;
  
  try {
    const { rows } = await db.query(query, [orgId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// POST /api/offers - Create a new offer (org only)
router.post('/', authMiddleware, orgOnlyMiddleware, async (req, res) => {
  const { title, description, location, category } = req.body;
  const orgId = req.user.id;

  if (!title || !description || !location || !category) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO Offers (title, description, location, category, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, description, location, category, orgId]
    );
    res.status(201).json({ id: rows[0].id, title, description, location, category, status: 'active' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
