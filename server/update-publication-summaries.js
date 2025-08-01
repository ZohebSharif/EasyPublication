#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PublicationSummaryService } from './src/services/PublicationSummaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

const summaryService = new PublicationSummaryService(process.env.OPENAI_API_KEY);

async function updatePublicationSummaries() {
  try {
    console.log('📚 Updating publication summaries...');
    
    // Open database connection
    const dbPath = join(__dirname, 'als-publications.db');
    const db = new sqlite3.Database(dbPath);
    
    // Get all publications that need summary updates
    const publications = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, doi, title 
        FROM publications 
        WHERE doi IS NOT NULL 
          AND (
            ai_abstract IS NULL 
            OR ai_key_points IS NULL 
            OR last_summary_update IS NULL
            OR last_summary_update < datetime('now', '-30 days')
          )
        ORDER BY id
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`📊 Found ${publications.length} publications to update`);
    
    // Process each publication
    for (const pub of publications) {
      try {
        console.log(`\n🔄 Processing: ${pub.title}`);
        
        // Get summary from OpenAI
        const summary = await summaryService.summarizePublication(pub.doi);
        
        // Update database
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE publications 
            SET 
              ai_abstract = ?,
              ai_key_points = ?,
              last_summary_update = datetime('now')
            WHERE id = ?
          `, [
            summary.abstract,
            JSON.stringify(summary.keyPoints),
            pub.id
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        console.log(`✅ Updated summary for: ${pub.title}`);
        
        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing publication ${pub.id}:`, error);
      }
    }
    
    // Close database connection
    db.close();
    
    console.log('\n🎉 Summary updates completed!');
    
  } catch (error) {
    console.error('❌ Error updating summaries:', error);
  }
}

// Run the update
updatePublicationSummaries(); 