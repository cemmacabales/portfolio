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

// Handle space variants like rgba( 255, 255, 255, 0.05 )
const spaceMap = [
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.05\s*\)/gi, 'var(--card-bg)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.1\s*\)/gi, 'var(--card-border)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.2\s*\)/gi, 'var(--card-border)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.3\s*\)/gi, 'var(--shadow-primary)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.4\s*\)/gi, 'var(--shadow-primary)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.6\s*\)/gi, 'var(--shadow-primary)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.8\s*\)/gi, 'var(--text-primary)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.87\s*\)/gi, 'var(--text-primary)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.9\s*\)/gi, 'var(--text-primary)'],
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  spaceMap.forEach(([r, v]) => { c = c.replace(r, v); });
  fs.writeFileSync(f, c);
  console.log('Done spaceMap:', f);
});

console.log('Space variant replacement done!');
