#!/usr/bin/env node

// Interactive script to select which publications to display on cards
// Run with: node update-cards.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateCards() {
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
    
    console.log('🎯 Choose how to select publications for cards:\n');
    console.log('1. High Impact Recent (2022+)');
    console.log('2. Most Recent (2024+)');
    console.log('3. Specific Journal (Science, Nature, PNAS)');
    console.log('4. Specific IDs (enter comma-separated IDs)');
    console.log('5. Random Selection');
    console.log('6. High Impact All Time');
    
    // For demonstration, let's implement option 1 (you can expand this)
    console.log('\n📝 Selecting High Impact Recent publications...\n');
    
    const selectedPublications = allPublications.filter(pub => 
      pub.high_impact === 1 && parseInt(pub.year) >= 2022
    ).slice(0, 4);
    
    // If not enough high impact, fill with recent publications
    if (selectedPublications.length < 4) {
      const additionalPubs = allPublications
        .filter(pub => !selectedPublications.find(sp => sp.id === pub.id))
        .filter(pub => parseInt(pub.year) >= 2023)
        .slice(0, 4 - selectedPublications.length);
      
      selectedPublications.push(...additionalPubs);
    }
    
    // Save to both locations
    const srcDataPath = join(__dirname, 'src', 'data', 'selected-publications.json');
    const publicDataPath = join(__dirname, 'public', 'data', 'selected-publications.json');
    
    writeFileSync(srcDataPath, JSON.stringify(selectedPublications, null, 2));
    writeFileSync(publicDataPath, JSON.stringify(selectedPublications, null, 2));
    
    console.log(`✅ Updated cards with ${selectedPublications.length} publications:`);
    console.log(`📁 Saved to: ${srcDataPath}`);
    console.log(`📁 Saved to: ${publicDataPath}`);
    
    console.log('\n🎯 Selected Publications:');
    selectedPublications.forEach((pub, index) => {
      console.log(`${index + 1}. ${pub.title}`);
      console.log(`   Journal: ${pub.journal} (${pub.year})`);
      console.log(`   High Impact: ${pub.high_impact ? 'Yes' : 'No'}`);
      console.log(`   ID: ${pub.id}`);
      console.log('');
    });
    
    console.log('🚀 Cards updated! Refresh your React app to see changes.');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error updating cards:', error);
  }
}

updateCards();
