const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'voluntree.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
  console.log('Seeding database...');
  const saltRounds = 10;
  
  // Create mock organizations
  const orgPassword = await bcrypt.hash('password123', saltRounds);
  
  db.serialize(() => {
    // Insert NGOs
    db.run(
      `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Green Earth Action', 'contact@greenearth.org', orgPassword, 'organization']
    );
    
    db.run(
      `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Ocean Rescue', 'info@oceanrescue.ngo', orgPassword, 'organization']
    );
    
    // Insert Volunteers
    db.run(
      `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['John Doe', 'john@example.com', orgPassword, 'volunteer']
    );

    // Insert Offers
    // Assuming Green Earth Action has ID 1 and Ocean Rescue has ID 2
    db.run(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Plant Trees in City Park', 'Join us to plant 100 saplings in the central park. Gloves provided!', 'Central Park, NY', 'Environment', 1, 'active']
    );
    
    db.run(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Beach Cleanup Drive', 'Help us clean the local beach and sort plastics for recycling.', 'Sunny Beach', 'Environment', 2, 'active']
    );
    
    db.run(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Community Garden Maintenance', 'We need hands to weed and water the community garden.', 'Downtown Community Center', 'Community', 1, 'active']
    );

    console.log('Database seeded with test users and offers!');
  });
}

// Add a short delay to ensure DB is ready if it was locked.
setTimeout(() => {
  seed();
}, 500);
