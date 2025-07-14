import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Database helper function
async function updatePublicationInDatabase(publicationId, newCategory, imagePaths = []) {
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Update the publication category and images
    let query = 'UPDATE publications SET category = ?';
    let params = [newCategory];
    
    // Add images if provided
    if (imagePaths.length > 0) {
      query += ', images = ?';
      params.push(JSON.stringify(imagePaths));
    }
    
    query += ' WHERE id = ?';
    params.push(publicationId);
    
    db.exec(query, params);
    
    // Verify the update
    const verifyResult = db.exec(`
      SELECT id, title, category, images 
      FROM publications 
      WHERE id = ?
    `, [publicationId]);
    
    let updatedPublication = null;
    if (verifyResult && verifyResult.length > 0) {
      const [{ values }] = verifyResult;
      if (values.length > 0) {
        const [id, title, category, images] = values[0];
        updatedPublication = { id, title, category, images };
      }
    }
    
    // Save the database back to file
    const data = db.export();
    writeFileSync(dbPath, data);
    db.close();
    
    // Export updated data to JSON
    await exportDatabaseToJson();
    
    return updatedPublication;
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}

// Export database to JSON function
async function exportDatabaseToJson() {
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Get all publications
    const result = db.exec(`
      SELECT id, title, authors, journal, online_pub_date, doi, beamlines, 
             year, high_impact, category, tags, images
      FROM publications
    `);
    
    if (result && result.length > 0) {
      const [{ columns, values }] = result;
      const publications = values.map(row => {
        const pub = {};
        columns.forEach((col, index) => {
          let value = row[index];
          // Parse JSON fields
          if ((col === 'tags' || col === 'images') && value) {
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = [];
            }
          }
          pub[col] = value;
        });
        return pub;
      });
      
      // Write to JSON file
      const jsonPath = path.join(__dirname, 'public', 'data', 'all-publications.json');
      writeFileSync(jsonPath, JSON.stringify(publications, null, 2));
      console.log('📄 Database exported to JSON successfully');
    }
    
    db.close();
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

// File upload endpoint
app.post('/api/upload', upload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      originalname: file.originalname,
      filename: file.filename,
      path: `/images/${file.filename}`,
      size: file.size
    }));

    console.log('📁 Files uploaded successfully:', files.map(f => f.filename));

    res.json({
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Publication update endpoint
app.post('/api/update-publication', async (req, res) => {
  try {
    const { title, authors, category, imagePaths = [] } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    // Find matching publication in database
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Search for publication by title (case-insensitive partial match)
    const searchResult = db.exec(`
      SELECT id, title, authors 
      FROM publications 
      WHERE LOWER(title) LIKE LOWER(?) OR LOWER(?) LIKE LOWER(title)
    `, [`%${title}%`, `%${title}%`]);
    
    let matchingPub = null;
    if (searchResult && searchResult.length > 0) {
      const [{ values }] = searchResult;
      if (values.length > 0) {
        const [id, pubTitle, pubAuthors] = values[0];
        matchingPub = { id, title: pubTitle, authors: pubAuthors };
      }
    }
    
    db.close();
    
    if (!matchingPub) {
      return res.status(404).json({ 
        error: `No matching publication found for "${title}". Please check the title and try again.` 
      });
    }
    
    // Update the publication
    const updatedPublication = await updatePublicationInDatabase(
      matchingPub.id, 
      category, 
      imagePaths
    );
    
    console.log(`✅ Publication ${matchingPub.id} updated to category: ${category}`);
    
    res.json({
      message: 'Publication updated successfully',
      publication: updatedPublication
    });
    
  } catch (error) {
    console.error('Publication update error:', error);
    res.status(500).json({ error: 'Failed to update publication' });
  }
});

// Search publications endpoint
app.get('/api/search-publications', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Search publications by title or authors
    const searchResult = db.exec(`
      SELECT id, title, authors, journal, year, doi, category 
      FROM publications 
      WHERE LOWER(title) LIKE LOWER(?) 
         OR LOWER(authors) LIKE LOWER(?)
         OR LOWER(doi) LIKE LOWER(?)
      LIMIT 20
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    
    let publications = [];
    if (searchResult && searchResult.length > 0) {
      const [{ columns, values }] = searchResult;
      publications = values.map(row => {
        const pub = {};
        columns.forEach((col, index) => {
          pub[col] = row[index];
        });
        return pub;
      });
    }
    
    db.close();
    
    res.json({ publications });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Export database endpoint
app.post('/api/export-database', async (req, res) => {
  try {
    await exportDatabaseToJson();
    res.json({ message: 'Database exported to JSON successfully' });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 File uploads will be saved to: ${path.join(__dirname, 'public', 'images')}`);
});
