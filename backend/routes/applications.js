const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, volOnlyMiddleware, orgOnlyMiddleware } = require('../middleware/auth');

// POST /api/applications - Volunteer applying for an offer
router.post('/', authMiddleware, volOnlyMiddleware, async (req, res) => {
  const { offer_id } = req.body;
  const volunteerId = req.user.id;

  if (!offer_id) {
    return res.status(400).json({ error: 'Offer ID is required.' });
  }

  try {
    // Check if offer exists and is active
    const offerQuery = await db.query(`SELECT status FROM Offers WHERE id = $1`, [offer_id]);
    if (offerQuery.rows.length === 0) return res.status(404).json({ error: 'Offer not found.' });
    if (offerQuery.rows[0].status !== 'active') return res.status(400).json({ error: 'Offer is closed.' });

    // Check if already applied
    const existing = await db.query(`SELECT id FROM Applications WHERE volunteer_id = $1 AND offer_id = $2`, [volunteerId, offer_id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Already applied to this offer.' });

    const insertResult = await db.query(
      `INSERT INTO Applications (volunteer_id, offer_id) VALUES ($1, $2) RETURNING id`,
      [volunteerId, offer_id]
    );
    res.status(201).json({ id: insertResult.rows[0].id, offer_id, status: 'pending' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/applications/volunteer - Volunteer viewing their applications
router.get('/volunteer', authMiddleware, volOnlyMiddleware, async (req, res) => {
  const volunteerId = req.user.id;
  const query = `
    SELECT Applications.id as application_id, Applications.status as application_status, Applications.applied_at,
           Offers.id as offer_id, Offers.title, Offers.location, Offers.category, Users.name as organization_name
    FROM Applications
    JOIN Offers ON Applications.offer_id = Offers.id
    JOIN Users ON Offers.organization_id = Users.id
    WHERE Applications.volunteer_id = $1
    ORDER BY Applications.applied_at DESC
  `;

  try {
    const { rows } = await db.query(query, [volunteerId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/applications/organization - Org viewing applicants to their offers
router.get('/organization', authMiddleware, orgOnlyMiddleware, async (req, res) => {
  const orgId = req.user.id;
  const query = `
    SELECT Applications.id as application_id, Applications.status as application_status, Applications.applied_at,
           Offers.id as offer_id, Offers.title, 
           Users.id as volunteer_id, Users.name as volunteer_name, Users.email as volunteer_email
    FROM Applications
    JOIN Offers ON Applications.offer_id = Offers.id
    JOIN Users ON Applications.volunteer_id = Users.id
    WHERE Offers.organization_id = $1 AND Applications.status = 'pending'
    ORDER BY Applications.applied_at ASC
  `;

  try {
    const { rows } = await db.query(query, [orgId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/applications/:id/status - Org accepts or rejects
router.put('/:id/status', authMiddleware, orgOnlyMiddleware, async (req, res) => {
  const { status } = req.body;
  const applicationId = req.params.id;
  const orgId = req.user.id;

  if (status !== 'accepted' && status !== 'rejected') {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    // Ensure this application belongs to an offer owned by the org
    const authCheck = await db.query(
      `SELECT Offers.organization_id FROM Applications JOIN Offers ON Applications.offer_id = Offers.id WHERE Applications.id = $1`,
      [applicationId]
    );
    
    if (authCheck.rows.length === 0) return res.status(404).json({ error: 'Application not found.' });
    if (authCheck.rows[0].organization_id !== orgId) return res.status(403).json({ error: 'Forbidden.' });

    await db.query(`UPDATE Applications SET status = $1 WHERE id = $2`, [status, applicationId]);
    res.json({ success: true, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
