const jwt = require('jsonwebtoken');

const REST_SECRET = 'supersecret_voluntree_key_for_mvp'; // In production, use env variables

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, REST_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const orgOnlyMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'organization') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Organization only' });
  }
};

const volOnlyMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'volunteer') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Volunteer only' });
  }
};

module.exports = {
  authMiddleware,
  orgOnlyMiddleware,
  volOnlyMiddleware,
  REST_SECRET
};
