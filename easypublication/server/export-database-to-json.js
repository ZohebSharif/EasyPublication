#!/usr/bin/env node

// Script to export database to JSON files for React app
// Run with: node export-database-to-json.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function exportToJson() {
  try {
    console.log('📦 Exporting database to JSON files...');
    
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Load database
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Query for all publication data
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
        high_impact,
        category,
        tags,
        images
      FROM publications 
      ORDER BY id
    `);
    
    if (!result || result.length === 0) {
      console.log('❌ No publications found in database');
      return;
    }
    
    const [{ columns, values }] = result;
    const publications = values.map(row => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
    
    console.log(`📊 Found ${publications.length} publications`);
    
    // Count by tags
    const tagCounts = {};
    publications.forEach(pub => {
      if (pub.tags) {
        tagCounts[pub.tags] = (tagCounts[pub.tags] || 0) + 1;
      }
    });
    
    console.log('📋 Publications by category:');
    Object.entries(tagCounts).forEach(([tag, count]) => {
      console.log(`   • ${tag}: ${count} publications`);
    });
    
    // Export to multiple locations
    const jsonData = JSON.stringify(publications, null, 2);
    
    // 1. Update src/data/all-publications.json
    const srcPath = join(__dirname, 'src', 'data', 'all-publications.json');
    writeFileSync(srcPath, jsonData);
    console.log(`✅ Exported to: ${srcPath}`);
    
    // 2. Update public/data/all-publications.json
    const publicPath = join(__dirname, 'public', 'data', 'all-publications.json');
    writeFileSync(publicPath, jsonData);
    console.log(`✅ Exported to: ${publicPath}`);
    
    // 3. Update root publications-data.json
    const rootPath = join(__dirname, 'publications-data.json');
    writeFileSync(rootPath, jsonData);
    console.log(`✅ Exported to: ${rootPath}`);
    
    // Close database
    db.close();
    
    console.log('\n🎉 Database export completed successfully!');
    console.log('💡 The React app should now load publications with tags from the updated JSON files.');
    
  } catch (error) {
    console.error('❌ Error exporting database:', error);
  }
}

// Run the function
exportToJson();
