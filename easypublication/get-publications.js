#!/usr/bin/env node

// Simple script to fetch specific publication data as JSON
// Returns: title, id, author, journal, online_pub_date, doi, beamlines
// Run with: node get-publications.js

import initSqlJs from 'sql.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getPublications() {
  try {
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Load database
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Query for specific fields
    const result = db.exec(`
      SELECT 
        id,
        title,
        authors,
        journal,
        online_pub_date,
        doi,
        beamlines
      FROM publications 
      ORDER BY id
    `);
    
    // Convert to JSON objects
    if (!result || result.length === 0) {
      return [];
    }
    
    const [{ columns, values }] = result;
    const publications = values.map(row => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
    
    // Close database
    db.close();
    
    return publications;
    
  } catch (error) {
    console.error('Error fetching publications:', error);
    return [];
  }
}

// Run and output JSON
getPublications().then(data => {
  console.log(JSON.stringify(data, null, 2));
});
