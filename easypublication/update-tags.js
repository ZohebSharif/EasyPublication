#!/usr/bin/env node

// Script to update publications with category tags
// Run with: node update-tags.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateTags() {
  try {
    console.log('🏷️ Updating publications with category tags...');
    
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Load existing database
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Define category assignments based on journal names and topics
    const categoryMappings = {
      'chemistry and energy': [
      'chemistry and energy'
      ],
      'physics and condensed matter': [
      'physics and condensed matter'
      ],
      'bioscience': [
        'bioscience'
      ],
      'geoscience and environment': [
       'geoscience and environment'
      ]
    };

    // Get all publications
    const result = db.exec(`
      SELECT id, title, journal, tags 
      FROM publications 
      ORDER BY id
    `);

    if (!result || result.length === 0) {
      console.log('No publications found');
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

    console.log(`📋 Processing ${publications.length} publications...`);

    // Update tags for each publication
    let updatedCount = 0;
    for (const pub of publications) {
      let assignedCategory = null;
      
      // Check journal name against category mappings
      for (const [category, journals] of Object.entries(categoryMappings)) {
        if (journals.some(journal => pub.journal.toLowerCase().includes(journal.toLowerCase()))) {
          assignedCategory = category;
          break;
        }
      }
      
      // If no journal match, use keyword matching on title
      if (!assignedCategory) {
        const title = pub.title.toLowerCase();
        
        if (title.includes('energy') || title.includes('battery') || title.includes('electrochemical') || 
            title.includes('electrode') || title.includes('lithium') || title.includes('solar')) {
          assignedCategory = 'chemistry and energy';
        } else if (title.includes('material') || title.includes('crystal') || title.includes('mechanical') || 
                  title.includes('structure') || title.includes('composite')) {
          assignedCategory = 'physics and condensed matter';
        } else if (title.includes('bone') || title.includes('plant') || title.includes('leaf') || 
                  title.includes('wood') || title.includes('biological') || title.includes('bio')) {
          assignedCategory = 'bioscience';
        } else if (title.includes('rock') || title.includes('mineral') || title.includes('earth') || 
                  title.includes('geological') || title.includes('environment')) {
          assignedCategory = 'geoscience and environment';
        }
      }
      
      // Update the publication with the assigned category
      if (assignedCategory && (!pub.tags || pub.tags !== assignedCategory)) {
        db.run(`UPDATE publications SET tags = ? WHERE id = ?`, [assignedCategory, pub.id]);
        updatedCount++;
        console.log(`✅ Updated publication ${pub.id}: "${pub.title.substring(0, 50)}..." → ${assignedCategory}`);
      }
    }

    console.log(`\n📊 Updated ${updatedCount} publications with category tags`);

    // Show summary by category
    const tagSummary = db.exec(`
      SELECT tags, COUNT(*) as count 
      FROM publications 
      WHERE tags IS NOT NULL AND tags != ''
      GROUP BY tags 
      ORDER BY count DESC
    `);

    if (tagSummary.length > 0) {
      console.log('\n📈 Publications by category:');
      tagSummary[0].values.forEach(([tag, count]) => {
        console.log(`   • ${tag}: ${count} publications`);
      });
    }

    // Save the modified database
    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
    
    console.log('\n✅ Database updated successfully!');
    
    // Close database
    db.close();
    
  } catch (error) {
    console.error('❌ Error updating tags:', error);
  }
}

// Run the function
updateTags();
