import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import initSqlJs from 'sql.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'public', 'data');
mkdirSync(dataDir, { recursive: true });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads (using memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to upload file to Cloudinary
async function uploadToCloudinary(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'easypublication',
        resource_type: 'auto',
        public_id: `publication_${Date.now()}_${Math.round(Math.random() * 1E9)}`,
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

// Helper function to delete images from Cloudinary
async function deleteFromCloudinary(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    return { deleted: [], errors: [] };
  }

  const deletedImages = [];
  const errors = [];

  for (const imageUrl of imageUrls) {
    try {
      const matches = imageUrl.match(/\/v\d+\/(.+?)\./);
      if (matches && matches[1]) {
        const publicId = matches[1];
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
          deletedImages.push(publicId);
        } else {
          errors.push({ publicId, error: result.result });
        }
      } else {
        errors.push({ url: imageUrl, error: 'Invalid URL format' });
      }
    } catch (error) {
      errors.push({ url: imageUrl, error: error.message });
    }
  }

  return { deleted: deletedImages, errors };
}

// Update publication in database
// Function to update a publication in the database
async function updatePublicationInDatabase(publicationId, newCategory, imagePaths, abstract, keyPoints) {
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);

    // Update the publication with new data using proper SQL.js syntax
    const stmt = db.prepare(`
      UPDATE publications 
      SET category = ?, 
          images = ?,
          abstract = ?,
          key_points = ?,
          ai_abstract = ?,
          ai_key_points = ?,
          last_summary_update = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run([
      newCategory,
      JSON.stringify(imagePaths),
      abstract,
      JSON.stringify(keyPoints),
      abstract,  // Also update AI fields
      JSON.stringify(keyPoints),
      publicationId
    ]);
    
    stmt.free();

    // Write the changes back to the file
    const data = db.export();
    writeFileSync(dbPath, Buffer.from(data));
    db.close();
    
    // Export updated data to JSON
    await exportDatabaseToJson();

    return { success: true };
  } catch (error) {
    console.error('Database update error:', error);
    return { success: false, error: error.message };
  }
}

// Export database to JSON function
async function exportDatabaseToJson() {
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    const result = db.exec(`
      SELECT id, title, authors, journal, online_pub_date, doi, beamlines, 
             year, high_impact, category, images, 
             COALESCE(abstract, ai_abstract) as abstract,
             COALESCE(key_points, ai_key_points) as key_points
      FROM publications
    `);
    
    if (result && result.length > 0) {
      const [{ columns, values }] = result;
      const publications = values.map(row => {
        const pub = {};
        columns.forEach((col, index) => {
          let value = row[index];
          if ((col === 'images' || col === 'key_points') && value) {
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = col === 'key_points' ? [] : null;
            }
          }
          pub[col] = value;
        });
        return pub;
      });
      
      const jsonPath = path.join(__dirname, '..', 'public', 'data', 'all-publications.json');
      writeFileSync(jsonPath, JSON.stringify(publications, null, 2));
    }
    
    db.close();
  } catch (error) {
    throw error;
  }
}

// File upload endpoint
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, file.originalname)
    );

    const uploadResults = await Promise.all(uploadPromises);

    const files = uploadResults.map((result, index) => ({
      originalname: req.files[index].originalname,
      filename: result.public_id,
      path: result.secure_url,
      size: req.files[index].size,
      cloudinary_id: result.public_id
    }));

    res.json({
      message: 'Files uploaded successfully to Cloudinary',
      files: files
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Publication update endpoint
app.post('/api/update-publication', async (req, res) => {
  try {
    const { title, authors, category, imagePaths = [], abstract = '', keyPoints = [] } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);

    // Search for publication using proper SQL.js syntax
    const stmt = db.prepare(`
      SELECT id FROM publications 
      WHERE LOWER(title) LIKE LOWER(?) 
      OR LOWER(title) = LOWER(?)
      LIMIT 1
    `);
    
    const result = stmt.get([`%${title}%`, title]);
    stmt.free();
    db.close();

    if (!result || !result.id) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    const publicationId = result.id;
    
    const updateResult = await updatePublicationInDatabase(
      publicationId,
      category,
      imagePaths,
      abstract,
      keyPoints
    );

    if (!updateResult.success) {
      throw new Error(updateResult.error || 'Failed to update publication');
    }

    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add GROQ API key endpoint
app.get('/api/groq-key', (req, res) => {
  if (!GROQ_API_KEY) {
    res.status(500).json({ error: 'GROQ API key not configured' });
    return;
  }
  res.json({ key: GROQ_API_KEY });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Get all publications endpoint for DOI search
app.get('/api/publications', async (req, res) => {
  try {
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const SQL = await initSqlJs();
    const db = new SQL.Database(fileBuffer);
    
    const stmt = db.prepare(`
      SELECT id, title, authors, journal, online_pub_date, doi, beamlines, year, high_impact,
             category, images, 
             COALESCE(abstract, ai_abstract) as abstract,
             COALESCE(key_points, ai_key_points) as key_points
      FROM publications 
      ORDER BY year DESC, title ASC
    `);
    
    const publications = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      
      // Parse JSON fields
      if (row.images) {
        try {
          row.images = JSON.parse(row.images);
        } catch (e) {
          row.images = [];
        }
      } else {
        row.images = [];
      }
      
      if (row.key_points) {
        try {
          row.key_points = JSON.parse(row.key_points);
        } catch (e) {
          row.key_points = [];
        }
      } else {
        row.key_points = [];
      }
      
      publications.push(row);
    }
    stmt.free();
    db.close();
    
    res.json(publications);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
});

// Get publications by category endpoint for carousels and slideshow
app.get('/api/publications/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const SQL = await initSqlJs();
    const db = new SQL.Database(fileBuffer);
    
    const stmt = db.prepare(`
      SELECT id, title, authors, journal, online_pub_date, doi, beamlines, year, high_impact,
             category, images, 
             COALESCE(abstract, ai_abstract) as abstract,
             COALESCE(key_points, ai_key_points) as key_points
      FROM publications 
      WHERE LOWER(category) = LOWER(?)
      ORDER BY year DESC, title ASC
    `);
    
    const publications = [];
    stmt.bind([category]);
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      
      // Parse JSON fields
      if (row.images) {
        try {
          row.images = JSON.parse(row.images);
        } catch (e) {
          row.images = [];
        }
      } else {
        row.images = [];
      }
      
      if (row.key_points) {
        try {
          row.key_points = JSON.parse(row.key_points);
        } catch (e) {
          row.key_points = [];
        }
      } else {
        row.key_points = [];
      }
      
      publications.push(row);
    }
    stmt.free();
    db.close();
    
    res.json(publications);
  } catch (error) {
    console.error('Error fetching publications by category:', error);
    res.status(500).json({ error: 'Failed to fetch publications by category' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
