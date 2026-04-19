const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, volOnlyMiddleware, orgOnlyMiddleware } = require('../middleware/auth');

// POST /api/applications - Volunteer applying for an offer
router.post('/', authMiddleware, volOnlyMiddleware, (req, res) => {
  const { offer_id } = req.body;
  const volunteerId = req.user.id;

  if (!offer_id) {
    return res.status(400).json({ error: 'Offer ID is required.' });
  }

  // Check if offer exists and is active
  db.get(`SELECT status FROM Offers WHERE id = ?`, [offer_id], (err, offer) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    if (!offer) return res.status(404).json({ error: 'Offer not found.' });
    if (offer.status !== 'active') return res.status(400).json({ error: 'Offer is closed.' });

    // Check if already applied
    db.get(`SELECT id FROM Applications WHERE volunteer_id = ? AND offer_id = ?`, [volunteerId, offer_id], (err, existing) => {
      if (err) return res.status(500).json({ error: 'Internal server error.' });
      if (existing) return res.status(400).json({ error: 'Already applied to this offer.' });

      db.run(
        `INSERT INTO Applications (volunteer_id, offer_id) VALUES (?, ?)`,
        [volunteerId, offer_id],
        function (err) {
          if (err) return res.status(500).json({ error: 'Internal server error.' });
          res.status(201).json({ id: this.lastID, offer_id, status: 'pending' });
        }
      );
    });
  });
});

// GET /api/applications/volunteer - Volunteer viewing their applications
router.get('/volunteer', authMiddleware, volOnlyMiddleware, (req, res) => {
  const volunteerId = req.user.id;
  const query = `
    SELECT Applications.id as application_id, Applications.status as application_status, Applications.applied_at,
           Offers.id as offer_id, Offers.title, Offers.location, Offers.category, Users.name as organization_name
    FROM Applications
    JOIN Offers ON Applications.offer_id = Offers.id
    JOIN Users ON Offers.organization_id = Users.id
    WHERE Applications.volunteer_id = ?
    ORDER BY Applications.applied_at DESC
  `;

  db.all(query, [volunteerId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
    res.json(rows);
  });
});

// GET /api/applications/organization - Org viewing applicants to their offers
router.get('/organization', authMiddleware, orgOnlyMiddleware, (req, res) => {
  const orgId = req.user.id;
  const query = `
    SELECT Applications.id as application_id, Applications.status as application_status, Applications.applied_at,
           Offers.id as offer_id, Offers.title, 
           Users.id as volunteer_id, Users.name as volunteer_name, Users.email as volunteer_email
    FROM Applications
    JOIN Offers ON Applications.offer_id = Offers.id
    JOIN Users ON Applications.volunteer_id = Users.id
    WHERE Offers.organization_id = ? AND Applications.status = 'pending'
    ORDER BY Applications.applied_at ASC
  `;

  db.all(query, [orgId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
    res.json(rows);
  });
});

// PUT /api/applications/:id/status - Org accepts or rejects
router.put('/:id/status', authMiddleware, orgOnlyMiddleware, (req, res) => {
  const { status } = req.body;
  const applicationId = req.params.id;
  const orgId = req.user.id;

  if (status !== 'accepted' && status !== 'rejected') {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  // Ensure this application belongs to an offer owned by the org
  db.get(
    `SELECT Offers.organization_id FROM Applications JOIN Offers ON Applications.offer_id = Offers.id WHERE Applications.id = ?`,
    [applicationId],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Internal server error.' });
      if (!row) return res.status(404).json({ error: 'Application not found.' });
      if (row.organization_id !== orgId) return res.status(403).json({ error: 'Forbidden.' });

      db.run(
        `UPDATE Applications SET status = ? WHERE id = ?`,
        [status, applicationId],
        function(err) {
          if (err) return res.status(500).json({ error: 'Internal server error.' });
          res.json({ success: true, status });
        }
      );
    }
  );
});

module.exports = router;
