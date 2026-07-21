const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/bg-obsidian-900/g, 'bg-[var(--theme-primary)]');
content = content.replace(/border-obsidian-900/g, 'border-[var(--theme-primary)]');
content = content.replace(/text-obsidian-900/g, 'text-[var(--theme-primary)]');

// Hover states
content = content.replace(/hover:bg-obsidian-800/g, 'hover:brightness-110');

fs.writeFileSync('src/App.tsx', content);
