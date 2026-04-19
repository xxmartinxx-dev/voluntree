const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'voluntree.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'volunteer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Offers table
    db.run(`
      CREATE TABLE IF NOT EXISTS Offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT NOT NULL,
        organization_id INTEGER,
        status TEXT NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organization_id) REFERENCES Users (id)
      )
    `);

    // Applications table
    db.run(`
      CREATE TABLE IF NOT EXISTS Applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        volunteer_id INTEGER,
        offer_id INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (volunteer_id) REFERENCES Users (id),
        FOREIGN KEY (offer_id) REFERENCES Offers (id)
      )
    `);
    
    console.log('Database tables initialized.');
  });
}

module.exports = db;
