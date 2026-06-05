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

const replacements = [
  { search: /bg-\[#09090b\]/g, replace: 'bg-gray-50' },
  { search: /text-white/g, replace: 'text-gray-900' },
  { search: /text-\[#fafafa\]/g, replace: 'text-gray-900' },
  { search: /text-gray-400/g, replace: 'text-gray-500' },
  { search: /text-gray-300/g, replace: 'text-gray-600' },
  { search: /text-gray-500 hover:text-white/g, replace: 'text-gray-500 hover:text-gray-900' },
  { search: /bg-black\/40/g, replace: 'bg-white/80' },
  { search: /bg-black\/60/g, replace: 'bg-white/95' },
  { search: /border-white\/10/g, replace: 'border-gray-200' },
  { search: /border-white\/\[0\.05\]/g, replace: 'border-gray-200' },
  { search: /border-white\/\[0\.03\]/g, replace: 'border-gray-100' },
  { search: /border-white\/\[0\.04\]/g, replace: 'border-gray-200' },
  { search: /border-white\/\[0\.08\]/g, replace: 'border-gray-300' },
  { search: /bg-white\/5/g, replace: 'bg-gray-100' },
  { search: /bg-white\/10/g, replace: 'bg-gray-200' },
  { search: /bg-white\/20/g, replace: 'bg-gray-300' },
  { search: /bg-white\/\[0\.01\]/g, replace: 'bg-white' },
  { search: /bg-white\/\[0\.02\]/g, replace: 'bg-gray-50' },
  { search: /bg-white\/\[0\.03\]/g, replace: 'bg-gray-100' },
  { search: /bg-white\/\[0\.04\]/g, replace: 'bg-gray-100' },
  { search: /bg-white\/\[0\.05\]/g, replace: 'bg-gray-100' },
  { search: /bg-white\/\[0\.08\]/g, replace: 'bg-gray-200' },
  { search: /bg-white\/\[0\.1\]/g, replace: 'bg-gray-200' },
  { search: /hover:bg-white\/\[0\.01\]/g, replace: 'hover:bg-gray-50' },
  { search: /hover:bg-white\/\[0\.05\]/g, replace: 'hover:bg-gray-100' },
  { search: /hover:bg-white\/\[0\.08\]/g, replace: 'hover:bg-gray-200' },
  { search: /hover:text-white/g, replace: 'hover:text-gray-900' },
  { search: /from-white via-white to-gray-400/g, replace: 'from-gray-900 via-gray-800 to-gray-600' },
];

folders.forEach(folder => {
  const absoluteFolder = path.join('C:\\Users\\Administrator\\Desktop\\evento', folder);
  if (!fs.existsSync(absoluteFolder)) return;
  
  const files = walk(absoluteFolder);
  files.forEach(file => {
    let original = fs.readFileSync(file, 'utf8');
    let content = original;
    
    replacements.forEach(rep => {
      content = content.replace(rep.search, rep.replace);
    });
    
    if (original !== content) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Converted to light mode:', file);
    }
  });
});
