// Fix 🏢 and any other emojis with 0x8F byte (undefined in Windows-1252 -> U+008F control char)
const fs = require("fs");
const path = require("path");

// 🏢 = U+1F3E2, UTF-8: F0 9F 8F E2
// 0x8F in Windows-1252 is undefined -> maps to U+008F (C1 control char, invisible)
// So corrupted string = U+00F0 U+0178 U+008F U+00E2
const bad = "\u00f0\u0178\u008f\u00e2";
const good = "\uD83C\uDFE2"; // 🏢

const srcDir = path.join(__dirname, "src");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixed = 0;
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      fixed += walk(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|css|ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes(bad)) {
        fs.writeFileSync(fullPath, content.split(bad).join(good), "utf8");
        console.log("Fixed 🏢 in:", entry.name);
        fixed++;
      }
    }
  }
  return fixed;
}

const n = walk(srcDir);
console.log("Done.", n, "file(s) updated.");
