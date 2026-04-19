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
      ['Fundacja Zielona Ziemia', 'kontakt@zielonaziemia.pl', orgPassword, 'organization']
    );
    
    db.run(
      `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Schronisko "Cztery Łapy"', 'pomoc@czterylapy.pl', orgPassword, 'organization']
    );

    db.run(
      `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Stowarzyszenie "Złoty Wiek"', 'seniorzy@zlotywiek.pl', orgPassword, 'organization']
    );
    
    // Insert Volunteers
    db.run(
      `INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Jan Kowalski', 'jan@example.com', orgPassword, 'volunteer']
    );

    // Insert Offers
    db.run(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Wspólne sadzenie drzew w Parku Miejskim', 'Szukamy chętnych do pomocy przy sadzeniu 100 nowych drzewek. Rękawice robocze i świetna atmosfera zapewnione!', 'Warszawa, Park Szczęśliwicki', 'eco', 1, 'active']
    );
    
    db.run(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Sprzątanie brzegów rzeki', 'Pomóż nam oczyścić brzeg Wisły z plastiku i śmieci. Każda para rąk się liczy w walce o czystsze środowisko.', 'Kraków, Bulwary Wiślane', 'eco', 1, 'active']
    );
    
    db.run(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Wyprowadzanie psów ze schroniska', 'Nasze psiaki potrzebują ruchu i człowieka. Szukamy osób, które zabiorą je na długie spacery w weekendy.', 'Poznań, ul. Bukowska', 'animals', 2, 'active']
    );

    db.run(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Zakupy dla seniora', 'Pani Krystyna (82 l.) potrzebuje pomocy w cotygodniowych zakupach spożywczych i wykupieniu recepty.', 'Gdańsk, Wrzeszcz', 'seniors', 3, 'active']
    );

    db.run(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Korepetycje z matematyki dla dzieci z domu dziecka', 'Poszukujemy wolontariuszy do pomocy dzieciom ze szkoły podstawowej w odrabianiu lekcji.', 'Wrocław, Dom Dziecka nr 1', 'education', 3, 'active']
    );

    console.log('Database seeded with test users and offers!');
  });
}

// Add a short delay to ensure DB is ready if it was locked.
setTimeout(() => {
  seed();
}, 500);
