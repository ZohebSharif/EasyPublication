#!/usr/bin/env node

// Simple script to query the populated SQLite database
// Run with: node query-database.js

import initSqlJs from 'sql.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function queryDatabase() {
  try {
    console.log('🔍 Querying ALS Publications Database...\n');
    
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Load existing database
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Query statistics
    console.log('📊 Database Statistics:');
    const totalPubs = db.exec("SELECT COUNT(*) as count FROM publications")[0]?.values[0][0] || 0;
    const totalBeamlines = db.exec("SELECT COUNT(*) as count FROM beamlines")[0]?.values[0][0] || 0;
    const highImpactCount = db.exec("SELECT COUNT(*) as count FROM publications WHERE high_impact = 1")[0]?.values[0][0] || 0;
    
    console.log(`   • Total Publications: ${totalPubs}`);
    console.log(`   • Total Beamlines: ${totalBeamlines}`);
    console.log(`   • High Impact Publications: ${highImpactCount}`);
    
    // Query some recent publications
    console.log('\n📚 Recent Publications from Beamline 8.3.2:');
    const recentPubs = db.exec(`
      SELECT title, authors, journal, year, high_impact 
      FROM publications 
      WHERE beamlines LIKE '%8.3.2%' 
      ORDER BY year DESC, title 
      LIMIT 5
    `);
    
    if (recentPubs.length > 0) {
      recentPubs[0].values.forEach((row, index) => {
        const [title, authors, journal, year, highImpact] = row;
        const impact = highImpact ? '⭐ High Impact' : '';
        console.log(`\n${index + 1}. ${title}`);
        console.log(`   Authors: ${authors}`);
        console.log(`   Journal: ${journal} (${year}) ${impact}`);
      });
    }
    
    // Query by year distribution
    console.log('\n📅 Publications by Year:');
    const yearDist = db.exec(`
      SELECT year, COUNT(*) as count 
      FROM publications 
      WHERE beamlines LIKE '%8.3.2%' AND year != ''
      GROUP BY year 
      ORDER BY year DESC 
      LIMIT 10
    `);
    
    if (yearDist.length > 0) {
      yearDist[0].values.forEach(row => {
        const [year, count] = row;
        console.log(`   ${year}: ${count} publications`);
      });
    }
    
    console.log('\n✅ Database query completed successfully!');
    
    // Close database
    db.close();
    
  } catch (error) {
    console.error('❌ Database query failed:', error);
    process.exit(1);
  }
}

// Run the script
queryDatabase();
