#!/usr/bin/env node

// IS CONFIGURED FOR ONLY BEAMLINE 8.3.2 CURRENTLY!

// Script to refresh publications database by adding ONLY NEW publications from beamline 8.3.2
// Run with: node scripts/refresh_publications.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(dirname(__dirname), 'server', 'als-publications.db');

async function refreshPublications() {
  try {
    console.log('🔄 Starting publications database refresh...');
    
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Check if database exists
    let db;
    if (existsSync(DB_PATH)) {
      console.log(`📂 Loading existing database from: ${DB_PATH}`);
      const fileBuffer = readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      
      console.log('✅ Existing database loaded successfully');
    } else {
      console.log('⚠️ No existing database found, creating a new one');
      db = new SQL.Database();
      
      // Create tables if this is a new database
      console.log('📋 Creating database tables...');
      
      // Create beamlines table
      db.run(`
        CREATE TABLE IF NOT EXISTS beamlines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pk INTEGER UNIQUE,
          beamline TEXT NOT NULL,
          order_num INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create publications table
      db.run(`
        CREATE TABLE IF NOT EXISTS publications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          authors TEXT,
          journal TEXT,
          volume TEXT,
          issue TEXT,
          page_from TEXT,
          page_to TEXT,
          year TEXT,
          online_pub_date TEXT,
          doi TEXT UNIQUE,
          beamlines TEXT,
          verified BOOLEAN DEFAULT 0,
          high_impact BOOLEAN DEFAULT 0,
          category TEXT,
          tags TEXT,
          images TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Database tables created');
    }
    
    // Get existing DOIs to avoid duplicates
    const existingDOIs = new Set();
    const existingDOIsResult = db.exec("SELECT doi FROM publications WHERE doi IS NOT NULL AND doi != ''");
    if (existingDOIsResult.length > 0 && existingDOIsResult[0].values) {
      existingDOIsResult[0].values.forEach(row => {
        if (row[0]) existingDOIs.add(row[0].toLowerCase());
      });
    }
    console.log(`📊 Found ${existingDOIs.size} existing publications with DOIs`);

    // Get existing beamline PKs to avoid duplicates
    const existingBeamlinePKs = new Set();
    const existingBeamlinesResult = db.exec("SELECT pk FROM beamlines WHERE pk IS NOT NULL");
    if (existingBeamlinesResult.length > 0 && existingBeamlinesResult[0].values) {
      existingBeamlinesResult[0].values.forEach(row => {
        if (row[0]) existingBeamlinePKs.add(row[0]);
      });
    }
    
    // Fetch beamlines first
    console.log('📊 Fetching beamlines list...');
    const beamlinesResponse = await fetch('https://alsusweb.lbl.gov/GetALSPubBeamlineList');
    
    if (!beamlinesResponse.ok) {
      throw new Error(`Failed to fetch beamlines: ${beamlinesResponse.status}`);
    }
    
    const beamlinesData = await beamlinesResponse.json();
    const beamlines = beamlinesData.PubBeamlines.sort((a, b) => a.Order - b.Order);
    
    // Insert new beamlines
    let newBeamlineCount = 0;
    const beamlineStmt = db.prepare(`
      INSERT OR IGNORE INTO beamlines (pk, beamline, order_num) 
      VALUES (?, ?, ?)
    `);
    
    for (const beamline of beamlines) {
      if (!existingBeamlinePKs.has(beamline.pk)) {
        beamlineStmt.run([beamline.pk, beamline.beamline, beamline.Order]);
        newBeamlineCount++;
      }
    }
    beamlineStmt.free();
    
    console.log(`✅ Added ${newBeamlineCount} new beamlines`);
    
    // Fetch publications for beamline 8.3.2
    console.log('📚 Fetching publications for beamline 8.3.2...');
    const pubResponse = await fetch('https://alsusweb.lbl.gov/GetALSPubs/?bl=8.3.2');
    
    if (!pubResponse.ok) {
      throw new Error(`Failed to fetch publications: ${pubResponse.status}`);
    }
    
    const publicationsData = await pubResponse.json();
    const publications = Array.isArray(publicationsData.Publications) 
      ? publicationsData.Publications 
      : [publicationsData.Publications];
    
    // Insert new publications only
    let newPublicationsCount = 0;
    const pubStmt = db.prepare(`
      INSERT INTO publications (
        title, authors, journal, volume, issue, page_from, page_to,
        year, online_pub_date, doi, beamlines, verified, high_impact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const pub of publications) {
      // Skip publications with DOIs we already have
      const doi = pub.DOI?.trim() || '';
      if (doi && existingDOIs.has(doi.toLowerCase())) {
        continue;
      }
      
      // Skip publications without a title
      if (!pub.Title?.trim()) {
        continue;
      }
      
      pubStmt.run([
        pub.Title || '',
        pub.Authors || '',
        pub.Journal || '',
        pub.Volume || '',
        pub.Issue || '',
        pub.PageFrom || '',
        pub.PageTo || '',
        pub.Year || '',
        pub.OnlinePubDate || '',
        doi,
        pub.Beamlines || '',
        pub.Verified ? 1 : 0,
        pub.HighImpact ? 1 : 0
      ]);
      
      newPublicationsCount++;
      existingDOIs.add(doi.toLowerCase()); // Add to the set to avoid duplicates in the current run
    }
    pubStmt.free();
    
    console.log(`✅ Added ${newPublicationsCount} new publications from beamline 8.3.2`);
    
    // Get statistics
    const totalPubs = db.exec("SELECT COUNT(*) as count FROM publications")[0]?.values[0][0] || 0;
    const totalBeamlines = db.exec("SELECT COUNT(*) as count FROM beamlines")[0]?.values[0][0] || 0;
    const highImpactCount = db.exec("SELECT COUNT(*) as count FROM publications WHERE high_impact = 1")[0]?.values[0][0] || 0;
    const lastYearCount = db.exec(`SELECT COUNT(*) as count FROM publications WHERE year >= '${new Date().getFullYear() - 1}'`)[0]?.values[0][0] || 0;
    
    console.log('\n📈 Database Statistics:');
    console.log(`   • Total Publications: ${totalPubs}`);
    console.log(`   • Total Beamlines: ${totalBeamlines}`);
    console.log(`   • High Impact Publications: ${highImpactCount}`);
    console.log(`   • Publications in last year: ${lastYearCount}`);
    
    // Export the updated database to a file
    console.log('\n💾 Saving updated database...');
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
    
    console.log(`✅ Database saved to: ${DB_PATH}`);
    
    // Update the JSON export
    console.log('\n📤 Updating JSON exports...');
    try {
      // Import the export script
      const { default: exportToJson } = await import('./export-database-to-json.js');
      await exportToJson();
      console.log('✅ JSON exports updated successfully');
    } catch (error) {
      console.error('⚠️ Could not automatically update JSON exports:', error.message);
      console.log('Please run the export script manually:');
      console.log('   cd server && node export-database-to-json.js');
    }
    
    console.log('\n🎉 Database refresh completed successfully!');
    console.log('🔍 New publications have been added without overwriting existing data');
    
    // Close database
    db.close();
    
  } catch (error) {
    console.error('❌ Database refresh failed:', error);
    process.exit(1);
  }
}

// Run the script
refreshPublications(); 