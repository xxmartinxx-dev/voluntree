require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Often needed for free cloud DBs like Neon/Supabase
  }
});

function initDb() {
  const initSchemaQuery = `
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'volunteer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Offers (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      organization_id INTEGER,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES Users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS Applications (
      id SERIAL PRIMARY KEY,
      volunteer_id INTEGER,
      offer_id INTEGER,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (volunteer_id) REFERENCES Users (id) ON DELETE CASCADE,
      FOREIGN KEY (offer_id) REFERENCES Offers (id) ON DELETE CASCADE
    );
  `;

  db.query(initSchemaQuery)
    .then(() => {
      console.log('Database tables initialized or verified.');
    })
    .catch(err => {
      console.error('Error initializing database tables:', err);
    });
}

db.connect()
  .then(() => {
    console.log('Connected to the PostgreSQL database.');
    initDb();
  })
  .catch(err => {
    if (process.env.DATABASE_URL) {
      console.error('Error connecting to PostgreSQL:', err);
    } else {
      console.log('No DATABASE_URL provided. Skipping DB connection.');
    }
  });

module.exports = db;
