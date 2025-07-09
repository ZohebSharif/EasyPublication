#!/usr/bin/env node

// Script to select specific publications and save them for card rendering
// Run with: node select-publications.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function selectPublications() {
  try {
    const SQL = await initSqlJs();
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Get all publications
    const result = db.exec(`
      SELECT 
        id,
        title,
        authors,
        journal,
        online_pub_date,
        doi,
        beamlines,
        year,
        high_impact
      FROM publications 
      ORDER BY year DESC, title
    `);
    
    if (!result || result.length === 0) {
      console.log('No publications found');
      return;
    }
    
    const [{ columns, values }] = result;
    const allPublications = values.map(row => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
    
    // Example: Select some interesting publications for cards
    // You can modify this logic to select publications based on different criteria
    
    // Option 1: Select recent high-impact publications
    const highImpactRecent = allPublications.filter(pub => 
      pub.high_impact === 1 && parseInt(pub.year) >= 2022
    ).slice(0, 4);
    
    // Option 2: Select publications from specific years
    const recent2024 = allPublications.filter(pub => 
      pub.year === '2024'
    ).slice(0, 4);
    
    // Option 3: Select publications from specific journals
    const scienceNature = allPublications.filter(pub => 
      pub.journal === 'Science' || pub.journal === 'Nature' || 
      pub.journal.includes('Nature')
    ).slice(0, 4);
    
    // Option 4: Mix of different types
    const mixedSelection = [
      ...highImpactRecent.slice(0, 2),
      ...recent2024.slice(0, 2)
    ];
    
    // Save different selections
    const selectionsPath = join(__dirname, 'src', 'data');
    
    // Create the data directory if it doesn't exist
    try {
      await import('fs').then(fs => {
        if (!fs.existsSync(selectionsPath)) {
          fs.mkdirSync(selectionsPath, { recursive: true });
        }
      });
    } catch (error) {
      console.log('Directory already exists or created');
    }
    
    // Save selected publications for cards
    const selectedForCards = mixedSelection.length > 0 ? mixedSelection : allPublications.slice(0, 4);
    
    const cardDataPath = join(selectionsPath, 'selected-publications.json');
    writeFileSync(cardDataPath, JSON.stringify(selectedForCards, null, 2));
    
    console.log(`✅ Selected ${selectedForCards.length} publications for cards`);
    console.log(`📄 Saved to: ${cardDataPath}`);
    
    // Also save all publications for reference
    const allDataPath = join(selectionsPath, 'all-publications.json');
    writeFileSync(allDataPath, JSON.stringify(allPublications, null, 2));
    
    console.log(`📚 All ${allPublications.length} publications saved to: ${allDataPath}`);
    
    // Show what was selected
    console.log('\n🎯 Selected Publications for Cards:');
    selectedForCards.forEach((pub, index) => {
      console.log(`${index + 1}. ${pub.title}`);
      console.log(`   Journal: ${pub.journal} (${pub.year})`);
      console.log(`   High Impact: ${pub.high_impact ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error selecting publications:', error);
  }
}

selectPublications();
