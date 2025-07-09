#!/usr/bin/env node

// Simple standalone script to populate SQLite database with beamline 8.3.2 publications
// Run with: node populate-832-simple.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function populateBeamline832() {
  try {
    console.log('🚀 Starting database population for beamline 8.3.2...');
    
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Create new database
    const db = new SQL.Database();
    
    // Create tables
    console.log('📋 Creating database tables...');
    
    // Create beamlines table
    db.run(`
      CREATE TABLE IF NOT EXISTS beamlines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pk INTEGER,
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
        doi TEXT,
        beamlines TEXT,
        verified BOOLEAN DEFAULT 0,
        high_impact BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables created');
    
    // Fetch beamlines first
    console.log('📊 Fetching beamlines list...');
    const beamlinesResponse = await fetch('https://alsusweb.lbl.gov/GetALSPubBeamlineList');
    
    if (!beamlinesResponse.ok) {
      throw new Error(`Failed to fetch beamlines: ${beamlinesResponse.status}`);
    }
    
    const beamlinesData = await beamlinesResponse.json();
    const beamlines = beamlinesData.PubBeamlines.sort((a, b) => a.Order - b.Order);
    
    // Insert beamlines
    const beamlineStmt = db.prepare(`
      INSERT INTO beamlines (pk, beamline, order_num) 
      VALUES (?, ?, ?)
    `);
    
    for (const beamline of beamlines) {
      beamlineStmt.run([beamline.pk, beamline.beamline, beamline.Order]);
    }
    beamlineStmt.free();
    
    console.log(`✅ Stored ${beamlines.length} beamlines`);
    
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
    
    // Insert publications
    const pubStmt = db.prepare(`
      INSERT INTO publications (
        title, authors, journal, volume, issue, page_from, page_to,
        year, online_pub_date, doi, beamlines, verified, high_impact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const pub of publications) {
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
        pub.DOI || '',
        pub.Beamlines || '',
        pub.Verified ? 1 : 0,
        pub.HighImpact ? 1 : 0
      ]);
    }
    pubStmt.free();
    
    console.log(`✅ Stored ${publications.length} publications from beamline 8.3.2`);
    
    // Get statistics
    const totalPubs = db.exec("SELECT COUNT(*) as count FROM publications")[0]?.values[0][0] || 0;
    const totalBeamlines = db.exec("SELECT COUNT(*) as count FROM beamlines")[0]?.values[0][0] || 0;
    const highImpactCount = db.exec("SELECT COUNT(*) as count FROM publications WHERE high_impact = 1")[0]?.values[0][0] || 0;
    
    console.log('\n📈 Final Database Statistics:');
    console.log(`   • Total Publications: ${totalPubs}`);
    console.log(`   • Total Beamlines: ${totalBeamlines}`);
    console.log(`   • High Impact Publications: ${highImpactCount}`);
    
    // Save database to file
    const dbPath = join(__dirname, 'als-publications.db');
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
    
    console.log(`\n💾 Database saved to: ${dbPath}`);
    console.log('🎉 Database population completed successfully!');
    
    // Close database
    db.close();
    
  } catch (error) {
    console.error('❌ Database population failed:', error);
    process.exit(1);
  }
}

// Run the script
populateBeamline832();
