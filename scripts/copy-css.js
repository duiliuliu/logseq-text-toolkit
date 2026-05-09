const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/components/SettingsModal/settingsModal.css',
  'src/components/Modal/modal.css',
  'src/components/Toolbar/toolbar.css',
  'src/components/Comment/inlineComment.css',
  'src/lib/cssRegistry/customsToolbarItems.css',
  'src/components/TaskProgress/taskProgress.css'
];

const distDir = 'dist';

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

cssFiles.forEach(file => {
  const dest = path.join(distDir, path.basename(file));
  fs.copyFileSync(file, dest);
  console.log(`Copied: ${file} -> ${dest}`);
});
