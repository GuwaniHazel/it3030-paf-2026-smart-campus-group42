const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../node_modules/dompurify/dist');
const files = ['purify.es.mjs', 'purify.js', 'purify.cjs.js'];

for (const file of files) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const filtered = content.filter((line) => !line.startsWith('//# sourceMappingURL='));
  if (filtered.length !== content.length) {
    fs.writeFileSync(filePath, filtered.join('\n'), 'utf8');
    console.log(`Fixed invalid sourceMappingURL in ${file}`);
  }
}
