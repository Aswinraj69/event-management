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

const files = walk('C:\\Users\\Administrator\\Desktop\\evento\\frontend\\src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('\\${process.env.NEXT_PUBLIC_API_URL')) {
    content = content.replace(/\\\$\{process\.env\.NEXT_PUBLIC_API_URL/g, '${process.env.NEXT_PUBLIC_API_URL');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
