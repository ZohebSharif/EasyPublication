#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to create temp-uploads.json from browser localStorage
function createTempUploadsFile() {
  console.log('📝 Instructions to save uploaded images:');
  console.log('');
  console.log('1. Open the browser console (F12)');
  console.log('2. Run this command to extract uploaded files:');
  console.log('   JSON.stringify(JSON.parse(localStorage.getItem("tempUploads") || "[]"))');
  console.log('');
  console.log('3. Copy the output and save it to temp-uploads.json in this directory');
  console.log('4. Run: node save-uploaded-files.js');
  console.log('');
  console.log('Alternatively, if you have the data, paste it below and run:');
  console.log('node extract-uploads.js');
}

// Function to extract uploads from localStorage data
function extractUploadsFromData(localStorageData) {
  try {
    const uploadsData = JSON.parse(localStorageData);
    const tempUploadsFile = path.join(__dirname, 'temp-uploads.json');
    
    fs.writeFileSync(tempUploadsFile, JSON.stringify(uploadsData, null, 2));
    console.log(`✅ Created temp-uploads.json with ${uploadsData.length} files`);
    console.log('📁 Now run: node save-uploaded-files.js');
    
  } catch (error) {
    console.error('❌ Error processing localStorage data:', error.message);
    console.log('📝 Make sure the data is valid JSON from localStorage.getItem("tempUploads")');
  }
}

// Check if data was provided as command line argument
const args = process.argv.slice(2);
if (args.length > 0) {
  extractUploadsFromData(args[0]);
} else {
  createTempUploadsFile();
}

module.exports = { extractUploadsFromData };
