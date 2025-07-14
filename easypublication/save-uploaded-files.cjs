#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to save uploaded files from localStorage to the file system
function saveUploadedFiles() {
  console.log('🔄 Processing uploaded files from localStorage...');

  // Read localStorage data (this would normally come from a web app)
  // For now, we'll create a simple mechanism to transfer files
  
  // Check if there's a temporary uploads file
  const uploadsFile = path.join(__dirname, 'temp-uploads.json');
  
  if (!fs.existsSync(uploadsFile)) {
    console.log('❌ No temp-uploads.json file found. Create this file with uploaded image data.');
    console.log('📝 Format: [{"name": "filename.jpg", "data": "data:image/jpeg;base64,..."}]');
    return;
  }

  let uploadsData;
  try {
    uploadsData = JSON.parse(fs.readFileSync(uploadsFile, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading temp-uploads.json:', error.message);
    return;
  }

  // Create public/images directory if it doesn't exist
  const imagesDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('📁 Created public/images directory');
  }

  let savedCount = 0;

  // Process each uploaded file
  uploadsData.forEach((fileData, index) => {
    try {
      const { name, data } = fileData;
      
      if (!name || !data) {
        console.log(`⚠️  Skipping invalid file data at index ${index}`);
        return;
      }

      // Extract base64 data from data URL
      const base64Data = data.split(',')[1];
      if (!base64Data) {
        console.log(`⚠️  Invalid base64 data for file: ${name}`);
        return;
      }

      // Write file to public/images
      const filePath = path.join(imagesDir, name);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      
      console.log(`✅ Saved: ${name}`);
      savedCount++;
      
    } catch (error) {
      console.error(`❌ Error saving file ${fileData.name}:`, error.message);
    }
  });

  console.log(`\n🎉 Successfully saved ${savedCount} files to public/images/`);
  
  // Clean up temp file
  fs.unlinkSync(uploadsFile);
  console.log('🧹 Cleaned up temp-uploads.json');
}

// Run the function
if (require.main === module) {
  saveUploadedFiles();
}

module.exports = { saveUploadedFiles };
