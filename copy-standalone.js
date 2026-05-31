const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  try {
    fs.mkdirSync(to, { recursive: true });
    fs.cpSync(from, to, { recursive: true, force: true });
    console.log(`Successfully copied ${from} to ${to}`);
  } catch (err) {
    console.error(`Error copying ${from} to ${to}:`, err.message);
    process.exit(1);
  }
}

// Copy .next/static to .next/standalone/.next/static
copyFolderSync(
  path.join(__dirname, '.next', 'static'),
  path.join(__dirname, '.next', 'standalone', '.next', 'static')
);

// Copy public to .next/standalone/public
copyFolderSync(
  path.join(__dirname, 'public'),
  path.join(__dirname, '.next', 'standalone', 'public')
);
