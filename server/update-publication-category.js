#!/usr/bin/env node

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updatePublicationCategory(publicationId, newCategory) {
  console.log(`🔄 Updating publication ${publicationId} to category: ${newCategory}`);
  
  try {
    const SQL = await initSqlJs();
    const dbPath = join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Update the publication category
    const updateResult = db.exec(`
      UPDATE publications 
      SET category = ? 
      WHERE id = ?
    `, [newCategory, publicationId]);
    
    // Verify the update
    const verifyResult = db.exec(`
      SELECT id, title, category 
      FROM publications 
      WHERE id = ?
    `, [publicationId]);
    
    if (verifyResult && verifyResult.length > 0) {
      const [{ values }] = verifyResult;
      if (values.length > 0) {
        const [id, title, category] = values[0];
        console.log(`✅ Successfully updated publication:`, {
          id,
          title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
          category
        });
      }
    }
    
    // Save the database back to file
    const data = db.export();
    writeFileSync(dbPath, data);
    db.close();
    
    console.log(`💾 Database updated successfully`);
    return true;
    
  } catch (error) {
    console.error('❌ Error updating publication category:', error.message);
    return false;
  }
}

// Export the function for use in other scripts
export { updatePublicationCategory };

// If run directly, use command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, publicationId, newCategory] = process.argv;
  
  if (!publicationId || !newCategory) {
    console.log('Usage: node update-publication-category.js <publicationId> <newCategory>');
    console.log('Example: node update-publication-category.js 123 "chemistry and energy"');
    process.exit(1);
  }
  
  await updatePublicationCategory(parseInt(publicationId), newCategory);
}
