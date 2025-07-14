#!/usr/bin/env node

// Script to add a new publication to the database
// Run with: node add-publication.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function addPublicationToDatabase(publicationData) {
  try {
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Load database
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Insert the new publication
    const stmt = db.prepare(`
      INSERT INTO publications (
        title, authors, journal, online_pub_date, doi, beamlines, 
        year, high_impact, tags, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      publicationData.title || '',
      publicationData.authors || '',
      publicationData.journal || '',
      publicationData.online_pub_date || '',
      publicationData.doi || '',
      publicationData.beamlines || '8.3.2',
      publicationData.year || new Date().getFullYear().toString(),
      publicationData.high_impact || 0,
      publicationData.tags || '',
      publicationData.images || '[]'
    ]);
    
    stmt.free();
    
    // Get the ID of the inserted publication
    const lastInsertResult = db.exec("SELECT last_insert_rowid() as id");
    const newId = lastInsertResult[0].values[0][0];
    
    console.log(`✅ Added publication with ID: ${newId}`);
    
    // Save database
    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
    
    // Close database
    db.close();
    
    return newId;
    
  } catch (error) {
    console.error('❌ Error adding publication to database:', error);
    throw error;
  }
}

// If called directly from command line, run a test
if (import.meta.url === `file://${process.argv[1]}`) {
  const testPublication = {
    title: "Test Publication from Admin",
    authors: "Test Author, Another Author",
    journal: "Test Journal",
    online_pub_date: new Date().toLocaleDateString(),
    doi: "10.1000/test.123",
    beamlines: "8.3.2",
    year: "2025",
    high_impact: 0,
    tags: "chemistry and energy",
    images: JSON.stringify(["/images/test_image.png"])
  };
  
  addPublicationToDatabase(testPublication)
    .then((id) => {
      console.log(`Test publication added with ID: ${id}`);
    })
    .catch((error) => {
      console.error('Test failed:', error);
    });
}
