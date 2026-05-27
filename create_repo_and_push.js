const { execSync } = require('child_process');

const token = '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';
const repoName = 'ayuastro';
const username = 'bunfeastburger';

async function run() {
  console.log('Creating GitHub repository...');
  
  try {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'node.js',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        name: repoName,
        private: true,
        description: 'AyuAstro web and mobile application'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log(`Repository successfully created: ${data.html_url}`);
    } else {
      console.error('Failed to create repository:', data);
      if (data.message && data.message.includes('Repository creation failed') && data.errors && data.errors.some(e => e.message === 'name already exists')) {
        console.log('Repository already exists. Proceeding to configure remote.');
      } else if (data.errors && data.errors.some(e => e.message === 'name already exists')) {
        console.log('Repository already exists. Proceeding to configure remote.');
      } else {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('Error creating repository:', error);
    process.exit(1);
  }

  console.log('Configuring local Git repository...');
  try {
    // Check if git is initialized
    try {
      execSync('git status', { stdio: 'ignore' });
    } catch {
      console.log('Initializing git repository...');
      execSync('git init');
    }

    // Set user config
    execSync(`git config user.name "${username}"`);
    execSync(`git config user.email "${username}@users.noreply.github.com"`);

    // Remove origin if already exists
    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch {}

    // Add origin with credentials embedded
    const remoteUrl = `https://${token}@github.com/${username}/${repoName}.git`;
    execSync(`git remote add origin ${remoteUrl}`);
    console.log('Added git remote origin.');

    // Stage all files
    console.log('Staging files...');
    execSync('git add .');

    // Commit
    console.log('Committing files...');
    try {
      execSync('git commit -m "Initial commit of AyuAstro web and mobile application"');
    } catch (e) {
      console.log('Nothing to commit or commit failed:', e.message);
    }

    // Rename branch to main
    execSync('git branch -M main');

    // Push to main
    console.log('Pushing to GitHub (main)...');
    execSync('git push -u origin main', { stdio: 'inherit' });
    console.log('Successfully pushed to GitHub!');
    
  } catch (error) {
    console.error('Failed during Git operations:', error.message);
    process.exit(1);
  }
}

run();
