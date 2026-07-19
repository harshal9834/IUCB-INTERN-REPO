const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
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

const frontendSrc = path.join(__dirname, 'frontend', 'src');
const files = walk(frontendSrc);
let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Safe Section Padding Reductions (keep spacing balanced but tighter)
  content = content.replace(/py-20 md:py-24/g, 'py-16 md:py-20');
  content = content.replace(/py-24 md:py-32/g, 'py-20 md:py-24');
  content = content.replace(/py-16 md:py-20/g, 'py-12 md:py-16');
  
  // Margin Reductions
  content = content.replace(/mt-12/g, 'mt-10');
  content = content.replace(/mt-16/g, 'mt-12');
  content = content.replace(/mt-20/g, 'mt-16');
  content = content.replace(/mb-12/g, 'mb-10');
  content = content.replace(/mb-16/g, 'mb-12');
  
  // Gap Reductions for grids and flex
  content = content.replace(/gap-12 lg:gap-20/g, 'gap-10 lg:gap-12');
  content = content.replace(/gap-12/g, 'gap-8');
  content = content.replace(/gap-8/g, 'gap-6');
  content = content.replace(/gap-10/g, 'gap-8');
  
  // Padding inside cards
  content = content.replace(/p-8/g, 'p-6');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    totalChanges++;
    console.log('Updated spacing in:', file);
  }
});

console.log('Total files updated:', totalChanges);
