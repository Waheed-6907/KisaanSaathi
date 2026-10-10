const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const zipPath = path.resolve('C:/Users/Waheed Mujtaba/.gemini/antigravity/scratch/kisanseva-source/KisanSeva2-master/app/src/main/assets/databases/soil_lab.zip');
const outDir = path.resolve('C:/Users/Waheed Mujtaba/.gemini/antigravity/scratch/kisanseva-web/assets/data');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

try {
  execSync(`tar -xf "${zipPath}" -C "${outDir}"`);
  console.log('Successfully extracted soil_lab:', fs.readdirSync(outDir));
} catch (e) {
  console.error('Extraction error:', e);
}
