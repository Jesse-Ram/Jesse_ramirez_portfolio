const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync('__image_manifest.json', 'utf8'));
let raw = fs.readFileSync('projects.html', 'utf8');
const lines = raw.split('\n');

const re = /src="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/;
let replaced = 0;

// manifest is in file order, matching the order data URIs appear top-to-bottom
let mi = 0;
for (let i = 0; i < lines.length; i++) {
  if (re.test(lines[i])) {
    const entry = manifest[mi];
    if (!entry) throw new Error('Manifest ran out at line ' + (i + 1));
    if (entry.line !== i + 1) throw new Error(`Line mismatch: manifest says ${entry.line}, found data URI at ${i + 1}`);
    lines[i] = lines[i].replace(re, `src="${entry.filename}"`);
    replaced++;
    mi++;
  }
}

if (mi !== manifest.length) throw new Error(`Only matched ${mi} of ${manifest.length} manifest entries`);

fs.writeFileSync('projects.html', lines.join('\n'));
console.log('Replaced', replaced, 'inline base64 images with file references in projects.html');
