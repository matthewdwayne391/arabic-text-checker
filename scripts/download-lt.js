import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const LANGUAGETOOL_DIR = './languagetool';
const LANGUAGETOOL_JAR = path.join(LANGUAGETOOL_DIR, 'languagetool-server.jar');

async function downloadLanguageTool() {
  try {
    // Create languagetool directory if it doesn't exist
    if (!fs.existsSync(LANGUAGETOOL_DIR)) {
      fs.mkdirSync(LANGUAGETOOL_DIR, { recursive: true });
      console.log('Created languagetool directory');
    }

    // Check if jar already exists
    if (fs.existsSync(LANGUAGETOOL_JAR)) {
      console.log('LanguageTool already present');
      return;
    }

    console.log('Downloading LanguageTool...');
    
    // Use official LanguageTool download URL
    console.log('Using LanguageTool version 6.6 from official source');
    const downloadUrl = 'https://languagetool.org/download/LanguageTool-6.6.zip';

    // Download the zip file
    const zipFile = path.join(LANGUAGETOOL_DIR, 'languagetool.zip');
    console.log(`Downloading from: ${downloadUrl}`);
    
    // Remove any existing partial download
    if (fs.existsSync(zipFile)) {
      fs.unlinkSync(zipFile);
    }
    
    await execAsync(`curl -L --fail --retry 3 --retry-delay 2 -o "${zipFile}" "${downloadUrl}"`);
    
    // Verify download was successful
    const stats = fs.statSync(zipFile);
    if (stats.size < 1000000) { // Less than 1MB is suspicious for LanguageTool
      throw new Error(`Downloaded file is too small (${stats.size} bytes). Download may have failed.`);
    }
    
    console.log(`Download completed (${stats.size} bytes)`);

    // Extract the zip file
    console.log('Extracting files...');
    await execAsync(`cd "${LANGUAGETOOL_DIR}" && unzip -q languagetool.zip`);

    // Find the extracted directory (it will be something like LanguageTool-6.6)
    const files = fs.readdirSync(LANGUAGETOOL_DIR);
    const extractedDir = files.find(file => 
      (file.startsWith('LanguageTool-') || file.startsWith('LanguageTool_')) && 
      fs.statSync(path.join(LANGUAGETOOL_DIR, file)).isDirectory()
    );

    if (!extractedDir) {
      throw new Error('Could not find extracted LanguageTool directory');
    }

    // Keep the entire extracted directory structure (contains all dependencies)
    const extractedPath = path.join(LANGUAGETOOL_DIR, extractedDir);
    const serverJar = fs.readdirSync(extractedPath).find(file => 
      file.includes('server') && file.endsWith('.jar')
    );

    if (!serverJar) {
      throw new Error('Could not find languagetool-server.jar in extracted files');
    }

    // Create a wrapper script that includes all dependencies in classpath
    const startScript = `#!/bin/bash
cd "${path.resolve(extractedPath)}"
java -cp "${serverJar}:libs/*" org.languagetool.server.HTTPServer "$@"
`;

    fs.writeFileSync(path.join(LANGUAGETOOL_DIR, 'start-server.sh'), startScript);
    fs.chmodSync(path.join(LANGUAGETOOL_DIR, 'start-server.sh'), '755');

    // Also copy the main jar for compatibility
    const sourceJar = path.join(extractedPath, serverJar);
    fs.copyFileSync(sourceJar, LANGUAGETOOL_JAR);
    console.log(`Set up LanguageTool with all dependencies in ${extractedDir}`);

    // Clean up zip file only
    fs.rmSync(zipFile);
    console.log('Cleanup completed');

    console.log('LanguageTool setup completed successfully!');

  } catch (error) {
    console.error('Error setting up LanguageTool:', error.message);
    process.exit(1);
  }
}

downloadLanguageTool();
