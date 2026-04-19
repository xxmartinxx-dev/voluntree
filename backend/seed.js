require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Cannot run seed.');
    return;
  }

  console.log('Seeding PostgreSQL database...');
  const saltRounds = 10;
  
  try {
    const orgPassword = await bcrypt.hash('password123', saltRounds);
    
    // Check if seeded
    const { rows: existingUsers } = await db.query(`SELECT id FROM Users LIMIT 1`);
    if (existingUsers.length > 0) {
      console.log('Database already contains users. Clearing database for seeding...');
      await db.query(`TRUNCATE TABLE Applications, Offers, Users RESTART IDENTITY CASCADE`);
    }

    // Insert NGOs
    await db.query(
      `INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Fundacja Zielona Ziemia', 'kontakt@zielonaziemia.pl', orgPassword, 'organization']
    );
    
    await db.query(
      `INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Schronisko "Cztery Łapy"', 'pomoc@czterylapy.pl', orgPassword, 'organization']
    );

    await db.query(
      `INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Stowarzyszenie "Złoty Wiek"', 'seniorzy@zlotywiek.pl', orgPassword, 'organization']
    );
    
    // Insert Volunteers
    await db.query(
      `INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Jan Kowalski', 'jan@example.com', orgPassword, 'volunteer']
    );

    // Insert Offers (Assuming linear IDs 1, 2, 3 for Orgs since we just seeded in empty DB)
    await db.query(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Wspólne sadzenie drzew w Parku Miejskim', 'Szukamy chętnych do pomocy przy sadzeniu 100 nowych drzewek. Rękawice robocze i świetna atmosfera zapewnione!', 'Warszawa, Park Szczęśliwicki', 'eco', 1, 'active']
    );
    
    await db.query(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Sprzątanie brzegów rzeki', 'Pomóż nam oczyścić brzeg Wisły z plastiku i śmieci. Każda para rąk się liczy w walce o czystsze środowisko.', 'Kraków, Bulwary Wiślane', 'eco', 1, 'active']
    );
    
    await db.query(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Wyprowadzanie psów ze schroniska', 'Nasze psiaki potrzebują ruchu i człowieka. Szukamy osób, które zabiorą je na długie spacery w weekendy.', 'Poznań, ul. Bukowska', 'animals', 2, 'active']
    );

    await db.query(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Zakupy dla seniora', 'Pani Krystyna (82 l.) potrzebuje pomocy w cotygodniowych zakupach spożywczych i wykupieniu recepty.', 'Gdańsk, Wrzeszcz', 'seniors', 3, 'active']
    );

    await db.query(
      `INSERT INTO Offers (title, description, location, category, organization_id, status) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Korepetycje z matematyki dla dzieci z domu dziecka', 'Poszukujemy wolontariuszy do pomocy dzieciom ze szkoły podstawowej w odrabianiu lekcji.', 'Wrocław, Dom Dziecka nr 1', 'education', 3, 'active']
    );

    console.log('PostgreSQL database seeded with test users and offers!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed:', error);
    process.exit(1);
  }
}

setTimeout(() => {
  seed();
}, 1000);
