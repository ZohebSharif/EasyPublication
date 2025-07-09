#!/usr/bin/env node

// Simple script to fetch publication data and save as JSON file
// Returns: title, id, authors, journal, online_pub_date, doi, beamlines
// Run with: node get-publications-file.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getPublications() {
  const SQL = await initSqlJs();
  const dbPath = join(__dirname, 'als-publications.db');
  const fileBuffer = readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);
  
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
  
  if (!result || result.length === 0) return [];
  
  const [{ columns, values }] = result;
  const publications = values.map(row => {
    const obj = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
  
  db.close();
  return publications;
}

// Get data and save to file
const data = await getPublications();
const outputPath = join(__dirname, 'publications-data.json');
writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`Saved ${data.length} publications to ${outputPath}`);
