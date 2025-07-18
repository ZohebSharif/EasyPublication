import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';
import initSqlJs from 'sql.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        folder: 'easypublication', // Organize uploads in a folder
        resource_type: 'auto', // Automatically detect file type
        public_id: `publication_${Date.now()}_${Math.round(Math.random() * 1E9)}`, // Unique ID
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('📁 File uploaded to Cloudinary:', result.secure_url);
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
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[format]
      // Example: https://res.cloudinary.com/dv7kssxdi/image/upload/v1752613508/easypublication/publication_1752613508436_90692893.png
      const matches = imageUrl.match(/\/v\d+\/(.+?)\./);
      if (matches && matches[1]) {
        const publicId = matches[1]; // This already includes the folder path
        
        console.log(`🗑️ Deleting image from Cloudinary: ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
          deletedImages.push(publicId);
          console.log(`✅ Successfully deleted: ${publicId}`);
        } else {
          console.warn(`⚠️ Failed to delete: ${publicId} - ${result.result}`);
          errors.push({ publicId, error: result.result });
        }
      } else {
        console.warn(`⚠️ Could not extract public_id from URL: ${imageUrl}`);
        errors.push({ url: imageUrl, error: 'Invalid URL format' });
      }
    } catch (error) {
      console.error(`❌ Error deleting image: ${imageUrl}`, error);
      errors.push({ url: imageUrl, error: error.message });
    }
  }

  return { deleted: deletedImages, errors };
}

// Database helper function
async function updatePublicationInDatabase(publicationId, newCategory, imagePaths = []) {
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Get current images before updating (so we can delete them from Cloudinary)
    const currentResult = db.exec(`
      SELECT images FROM publications WHERE id = ?
    `, [publicationId]);
    
    let currentImages = [];
    if (currentResult && currentResult.length > 0) {
      const [{ values }] = currentResult;
      if (values.length > 0 && values[0][0]) {
        try {
          currentImages = JSON.parse(values[0][0]) || [];
        } catch (e) {
          console.warn('Failed to parse current images:', e);
          currentImages = [];
        }
      }
    }
    
    // If we're clearing images (imagePaths is empty) and there are current images, delete them from Cloudinary
    if (imagePaths.length === 0 && currentImages.length > 0) {
      console.log(`🗑️ Deleting ${currentImages.length} images from Cloudinary for publication ${publicationId}`);
      const deleteResult = await deleteFromCloudinary(currentImages);
      
      if (deleteResult.deleted.length > 0) {
        console.log(`✅ Successfully deleted ${deleteResult.deleted.length} images from Cloudinary`);
      }
      if (deleteResult.errors.length > 0) {
        console.warn(`⚠️ Failed to delete ${deleteResult.errors.length} images:`, deleteResult.errors);
      }
    }
    
    // Update the publication category and images
    let query = 'UPDATE publications SET category = ?, images = ?';
    let params = [newCategory, JSON.stringify(imagePaths)];
    
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
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`📁 Uploading ${req.files.length} files to Cloudinary...`);

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, file.originalname)
    );

    const uploadResults = await Promise.all(uploadPromises);

    const files = uploadResults.map((result, index) => ({
      originalname: req.files[index].originalname,
      filename: result.public_id,
      path: result.secure_url, // Cloudinary URL
      size: req.files[index].size,
      cloudinary_id: result.public_id
    }));

    console.log('✅ All files uploaded successfully to Cloudinary');

    res.json({
      message: 'Files uploaded successfully to Cloudinary',
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

// Publication deletion endpoint (completely removes publication and images)
app.post('/api/delete-publication', async (req, res) => {
  try {
    const { publicationId } = req.body;
    
    if (!publicationId) {
      return res.status(400).json({ error: 'Publication ID is required' });
    }
    
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'als-publications.db');
    const fileBuffer = readFileSync(dbPath);
    const db = new SQL.Database(fileBuffer);
    
    // Get publication details and images before deletion
    const getResult = db.exec(`
      SELECT id, title, images FROM publications WHERE id = ?
    `, [publicationId]);
    
    if (!getResult || getResult.length === 0 || getResult[0].values.length === 0) {
      db.close();
      return res.status(404).json({ error: 'Publication not found' });
    }
    
    const [id, title, images] = getResult[0].values[0];
    let imageUrls = [];
    
    // Parse images if they exist
    if (images) {
      try {
        imageUrls = JSON.parse(images) || [];
      } catch (e) {
        console.warn('Failed to parse images for deletion:', e);
      }
    }
    
    // Delete images from Cloudinary
    if (imageUrls.length > 0) {
      console.log(`🗑️ Deleting ${imageUrls.length} images from Cloudinary for publication ${id}`);
      const deleteResult = await deleteFromCloudinary(imageUrls);
      
      if (deleteResult.deleted.length > 0) {
        console.log(`✅ Successfully deleted ${deleteResult.deleted.length} images from Cloudinary`);
      }
      if (deleteResult.errors.length > 0) {
        console.warn(`⚠️ Failed to delete ${deleteResult.errors.length} images:`, deleteResult.errors);
      }
    }
    
    // Delete publication from database
    db.exec('DELETE FROM publications WHERE id = ?', [publicationId]);
    
    // Save the database back to file
    const data = db.export();
    writeFileSync(dbPath, data);
    db.close();
    
    // Export updated data to JSON
    await exportDatabaseToJson();
    
    console.log(`✅ Publication ${id} ("${title}") completely deleted with all associated images`);
    
    res.json({
      message: 'Publication and associated images deleted successfully',
      deletedPublication: { id, title },
      deletedImages: imageUrls.length
    });
    
  } catch (error) {
    console.error('Publication deletion error:', error);
    res.status(500).json({ error: 'Failed to delete publication' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log('📂 Available endpoints:');
  console.log('  GET  /api/health - Health check');
  console.log('  POST /api/upload - Upload files to Cloudinary');
  console.log('  POST /api/update-publication - Update publication category and images');
  console.log('  GET  /api/search-publications - Search publications');
  console.log('  POST /api/export-database - Export database to JSON');
  console.log('  POST /api/delete-publication - Delete publication and associated images');
});
