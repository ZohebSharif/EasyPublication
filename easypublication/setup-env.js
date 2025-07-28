import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = join(__dirname, '.env');

// Check if .env already exists
if (existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Please edit it manually to update values.');
  process.exit(0);
}

console.log('🔑 Setting up environment variables...\n');

rl.question('Enter your GROQ API key: ', (groqKey) => {
  if (!groqKey.trim()) {
    console.error('❌ GROQ API key is required');
    process.exit(1);
  }

  const envContent = `# GROQ API Key
GROQ_API_KEY=${groqKey.trim()}

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
`;

  try {
    writeFileSync(envPath, envContent);
    console.log('\n✅ Created .env file successfully!');
    console.log('📝 You can edit the file directly to update values later.');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error);
    process.exit(1);
  }

  rl.close();
}); 