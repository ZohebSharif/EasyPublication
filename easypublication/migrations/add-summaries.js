import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function addSummaryColumns() {
  try {
    const SQL = await initSqlJs();
    const dbPath = join(__dirname, '..', 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);

    // Add new columns if they don't exist
    db.exec(`
      BEGIN TRANSACTION;

      -- Check if abstract column exists
      SELECT COUNT(*) FROM pragma_table_info('publications') WHERE name='abstract';
      
      -- Add abstract column if it doesn't exist
      ALTER TABLE publications ADD COLUMN abstract TEXT;
      
      -- Check if key_points column exists
      SELECT COUNT(*) FROM pragma_table_info('publications') WHERE name='key_points';
      
      -- Add key_points column if it doesn't exist
      ALTER TABLE publications ADD COLUMN key_points TEXT;

      COMMIT;
    `);

    // Save the changes
    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
    console.log('✅ Successfully added summary columns to database');

  } catch (error) {
    console.error('Error adding summary columns:', error);
    process.exit(1);
  }
}

addSummaryColumns(); 