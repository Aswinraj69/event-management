const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const folders = ['frontend/src', 'admin-frontend/src'];

folders.forEach(folder => {
  const absoluteFolder = path.join('C:\\Users\\Administrator\\Desktop\\evento', folder);
  if (!fs.existsSync(absoluteFolder)) return;
  
  const files = walk(absoluteFolder);
  files.forEach(file => {
    let original = fs.readFileSync(file, 'utf8');
    let content = original;
    
    // Convert hardcoded bg to transparent so Hero3D shows through
    content = content.replace(/bg-\[#09090b\]/g, 'bg-transparent');
    
    // Upgrade glass-panel everywhere
    content = content.replace(/className="glass-panel/g, 'className="bg-black/30 backdrop-blur-3xl border border-white/10 shadow-2xl');
    
    // Upgrade Dashboard layout sidebars and headers
    content = content.replace(/border-white\/\[0.05\]/g, 'border-white/10');
    content = content.replace(/bg-white\/\[0.02\]/g, 'bg-black/20 backdrop-blur-xl');
    content = content.replace(/bg-white\/\[0.01\]/g, 'bg-black/10 backdrop-blur-md');
    
    if (original !== content) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Upgraded aesthetic in:', file);
    }
  });
});
