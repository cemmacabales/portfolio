import fs from 'fs';

const files = [
  'src/App.css',
  'src/components/Certificates.css',
  'src/components/Dock.css',
  'src/components/Loader.css',
  'src/components/ScrambledText.css',
  'src/components/SpotlightCard.css',
  'src/components/TechStack.css'
];

const map = [
  [/#1a1a1a/gi, 'var(--bg-secondary)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.05\)/gi, 'var(--card-bg)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.1\)/gi, 'var(--card-border)'],
  [/rgba\(255,\s*255,\s*255,\s*0\.2\)/gi, 'var(--card-border)'],
  [/rgba\(100,\s*255,\s*218,\s*0\.05\)/gi, 'var(--card-bg)'],
  [/rgba\(100,\s*255,\s*218,\s*0\.1\)/gi, 'var(--accent-hover)'],
  [/rgba\(100,\s*255,\s*218,\s*0\.[2-9]\)/gi, 'var(--shadow-primary)'],
  [/#a0a0a0/gi, 'var(--text-secondary)'],
  [/#64ffda/gi, 'var(--accent-primary)'],
  [/#4ecdc4/gi, 'var(--accent-secondary)'],
  [/#ffffff(?![0-9a-fA-F])/gi, 'var(--text-primary)'],
  [/#fff(?![0-9a-fA-F])/gi, 'var(--text-primary)']
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  map.forEach(([r, v]) => { c = c.replace(r, v); });
  fs.writeFileSync(f, c);
  console.log('Done:', f);
});

console.log('All done!');
