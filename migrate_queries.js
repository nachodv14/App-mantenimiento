const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const apiDir = path.join(__dirname, 'src', 'app', 'api');

walkDir(apiDir, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace TO_CHAR dates
    content = content.replace(/TO_CHAR\(([^,]+),\s*'DD\/MM\/YYYY'\)/g, "FORMAT($1, 'dd/MM/yyyy')");
    content = content.replace(/TO_CHAR\(([^,]+),\s*'HH24:MI'\)/g, "FORMAT($1, 'HH:mm')");
    content = content.replace(/TO_CHAR\(([^,]+),\s*'DD\/MM\/YYYY HH24:MI'\)/g, "FORMAT($1, 'dd/MM/yyyy HH:mm')");
    
    // Replace AT TIME ZONE
    content = content.replace(/AT TIME ZONE 'America\/Argentina\/Buenos_Aires'/g, "AT TIME ZONE 'Argentina Standard Time'");
    
    // Replace RETURNING
    // Example: INSERT INTO table (cols) VALUES (vals) RETURNING id
    content = content.replace(/\)\s*RETURNING\s+id\b/gi, ") /* RETURNING removed, needs OUTPUT */");
    content = content.replace(/RETURNING\s+\*/gi, "/* RETURNING * removed, needs OUTPUT */");
    
    // Replace ANY($1)
    content = content.replace(/=\s*ANY\s*\(\s*(\$\d+)\s*\)/g, "IN (SELECT value FROM string_split($1, ','))");
    
    // Replace NOW() and timezone()
    content = content.replace(/timezone\('utc'::text,\s*now\(\)\)/g, "GETUTCDATE()");
    content = content.replace(/timezone\('utc',\s*now\(\)\)/g, "GETUTCDATE()");
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
