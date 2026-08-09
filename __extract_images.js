const fs = require('fs');

const raw = fs.readFileSync('projects.html', 'utf8');
const lines = raw.split('\n');

// find every line containing a data:image/jpeg;base64 URI inside an <img src="...">
const re = /src="data:image\/jpeg;base64,([A-Za-z0-9+/=]+)"/;
const results = [];

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(re);
  if (m) {
    // find nearest alt="" on this line or the next line
    let altMatch = lines[i].match(/alt="([^"]*)"/);
    if (!altMatch && lines[i + 1]) altMatch = lines[i + 1].match(/alt="([^"]*)"/);
    // find the figcaption within the next few lines
    let caption = '';
    for (let j = i; j < Math.min(i + 5, lines.length); j++) {
      const capMatch = lines[j].match(/<figcaption>(?:<b>)?([^<]*)(?:<\/b>)?\s*—?\s*([^<]*)<\/figcaption>/);
      if (capMatch) { caption = (capMatch[1] + ' ' + capMatch[2]).trim(); break; }
    }
    results.push({
      line: i + 1,
      alt: altMatch ? altMatch[1] : '',
      caption,
      base64: m[1],
      bytes: Math.floor(m[1].length * 0.75)
    });
  }
}

console.log('Found', results.length, 'embedded images\n');

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

const usedNames = new Set();
const manifest = [];

for (const r of results) {
  let base = slugify(r.caption || r.alt || ('image-line-' + r.line));
  if (!base) base = 'image-line-' + r.line;
  let name = base;
  let n = 2;
  while (usedNames.has(name)) { name = base + '-' + n; n++; }
  usedNames.add(name);
  const filename = 'images/proj-' + name + '.jpg';
  fs.writeFileSync(filename, Buffer.from(r.base64, 'base64'));
  manifest.push({ line: r.line, alt: r.alt, caption: r.caption, bytes: r.bytes, filename });
  console.log(r.line, '->', filename, `(${(r.bytes / 1024).toFixed(0)}KB)`, '| alt:', r.alt, '| caption:', r.caption);
}

fs.writeFileSync('__image_manifest.json', JSON.stringify(manifest, null, 2));
