#!/usr/bin/env node

// Script to add a new column to the existing database
// Run with: node add-column.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function addColumn() {
  try {
    console.log('🔧 Adding new column to database...');
    
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Load existing database
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Add new column(s) - modify these as needed
    console.log('📋 Adding new column...');
    
    // Add a 'images' column for storing array of PNG file paths as JSON
    db.run(`ALTER TABLE publications ADD COLUMN images TEXT DEFAULT '[]'`);
    
    // Example: You could also add other image-related columns
    // db.run(`ALTER TABLE publications ADD COLUMN thumbnail TEXT`);
    // db.run(`ALTER TABLE publications ADD COLUMN featured_image TEXT`);
    
    // Verify the change
    const schema = db.exec("PRAGMA table_info(publications)");
    console.log('\n📊 Updated table schema:');
    schema[0].values.forEach(([cid, name, type, notnull, dflt_value, pk]) => {
      console.log(`   • ${name}: ${type}${dflt_value ? ` (default: ${dflt_value})` : ''}`);
    });
    
    // Save the modified database
    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
    
    console.log('\n✅ Database updated successfully!');
    
    // Close database
    db.close();
    
  } catch (error) {
    console.error('❌ Error adding column:', error);
  }
}

// Run the function
addColumn();
