#!/usr/bin/env node

// Script to update publications with PNG image arrays
// Run with: node update-images.js

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateImages() {
  try {
    console.log('🖼️ Updating publications with image arrays...');
    
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Load existing database
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Example: Update specific publications with image arrays
    console.log('📋 Adding image arrays to publications...');
    
    // Example 1: Add images to publication ID 1
    const images1 = [
      '/images/publication1_chart.png',
      '/images/publication1_graph.png',
      '/images/publication1_diagram.png'
    ];
    
    db.run(`UPDATE publications SET images = ? WHERE id = 1`, [JSON.stringify(images1)]);
    console.log(`✅ Updated publication 1 with ${images1.length} images`);
    
    // Example 2: Add images to publication ID 2
    const images2 = [
      '/images/publication2_data.png',
      '/images/publication2_results.png'
    ];
    
    db.run(`UPDATE publications SET images = ? WHERE id = 2`, [JSON.stringify(images2)]);
    console.log(`✅ Updated publication 2 with ${images2.length} images`);
    
    // Example 3: Add a single image to publication ID 3
    const images3 = ['/images/publication3_main.png'];
    
    db.run(`UPDATE publications SET images = ? WHERE id = 3`, [JSON.stringify(images3)]);
    console.log(`✅ Updated publication 3 with ${images3.length} images`);
    
    // Verify the changes
    const result = db.exec(`
      SELECT id, title, images 
      FROM publications 
      WHERE images != '[]' 
      LIMIT 5
    `);
    
    console.log('\n📊 Publications with images:');
    if (result.length > 0) {
      result[0].values.forEach(([id, title, images]) => {
        const imageArray = JSON.parse(images);
        console.log(`\n   • Publication ${id}: ${title}`);
        console.log(`     Images (${imageArray.length}):`);
        imageArray.forEach((img, index) => {
          console.log(`       ${index + 1}. ${img}`);
        });
      });
    } else {
      console.log('   No publications with images found.');
    }
    
    // Save the modified database
    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
    
    console.log('\n✅ Database updated successfully!');
    
    // Close database
    db.close();
    
  } catch (error) {
    console.error('❌ Error updating images:', error);
  }
}

// Helper function to add images to a specific publication
function addImagesToPublication(db, publicationId, imagePaths) {
  const imagesJson = JSON.stringify(imagePaths);
  db.run(`UPDATE publications SET images = ? WHERE id = ?`, [imagesJson, publicationId]);
}

// Helper function to get images from a publication
function getImagesFromPublication(db, publicationId) {
  const result = db.exec(`SELECT images FROM publications WHERE id = ?`, [publicationId]);
  if (result.length > 0 && result[0].values.length > 0) {
    const imagesJson = result[0].values[0][0];
    return JSON.parse(imagesJson || '[]');
  }
  return [];
}

// Run the function
updateImages();
