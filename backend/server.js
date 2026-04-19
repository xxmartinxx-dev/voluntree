const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('VolunTree API is running.');
});

// Routes
const authRoutes = require('./routes/auth');
const offersRoutes = require('./routes/offers');
const applicationsRoutes = require('./routes/applications');

app.use('/api/auth', authRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/applications', applicationsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
