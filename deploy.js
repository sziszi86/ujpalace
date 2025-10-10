const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
// Load FTP credentials from .env.deploy if present
try { require('dotenv').config({ path: '.env.deploy' }); } catch (_) {}

async function deployToFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = false; // Reduce verbosity for faster deployment

  try {
    // Connect to FTP server
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: parseInt(process.env.FTP_PORT || '21'),
      secure: false
    });

    console.log('✅ Connected to FTP server');

    // Navigate to the correct directory (configurable)
    const remoteDir = process.env.FTP_REMOTE_DIR || '.';
    await client.ensureDir(remoteDir);
    console.log(`✅ Navigated to deployment directory: ${remoteDir}`);

    // Upload server.js
    console.log('📤 Uploading server.js...');
    await client.uploadFrom('./server.js', 'server.js');

    // Upload app.js (Passenger entry for Tarhely.eu)
    console.log('📤 Uploading app.js...');
    await client.uploadFrom('./app.js', 'app.js');

    // Upload package.json
    console.log('📤 Uploading package.json...');
    await client.uploadFrom('./package.json', 'package.json');

    // Upload next.config.js
    console.log('📤 Uploading next.config.js...');
    await client.uploadFrom('./next.config.js', 'next.config.js');

    // Upload .next directory
    console.log('📤 Uploading .next directory...');
    await client.uploadFromDir('./.next', '.next');

    // Upload public directory
    console.log('📤 Uploading public directory...');
    await client.uploadFromDir('./public', 'public');

    console.log('🎉 Deployment completed successfully!');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run deployment
deployToFTP();