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
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
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
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes("'http://localhost:5000'")) {
      content = content.replace(/'http:\/\/localhost:5000'/g, "'https://event-management-production-b372.up.railway.app'");
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed', file);
    }
  });
});
