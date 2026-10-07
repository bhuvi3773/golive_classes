import fs from 'fs';
import path from 'path';

const directory = './src';

// Map of dark theme classes to light theme classes
const replacements = {
  // Backgrounds
  'bg-[#0a0c16]': 'bg-slate-50',
  'bg-[#0d101d]': 'bg-slate-100',
  'bg-[#1e2130]': 'bg-white',
  'bg-[#151828]': 'bg-white',
  'bg-[#1a1d2d]': 'bg-slate-900', // Exception: Keep Hero image area dark or change to white? Let's make it bg-slate-100
  
  // Text
  'text-white': 'text-slate-900',
  'text-gray-300': 'text-slate-600',
  'text-gray-400': 'text-slate-500',
  'text-gray-500': 'text-slate-400',
  'text-blue-400': 'text-emerald-600',
  'text-cyan-400': 'text-teal-600',
  'text-blue-200': 'text-emerald-800',
  
  // Borders
  'border-white/10': 'border-slate-200',
  'border-white/5': 'border-slate-200',
  'border-blue-500/20': 'border-emerald-200',
  'border-blue-500/30': 'border-emerald-300',
  
  // Background transparencies
  'bg-white/5': 'bg-slate-100',
  'bg-white/10': 'bg-slate-200',
  'bg-white/[0.02]': 'bg-white',
  'bg-blue-600/20': 'bg-emerald-100',
  'bg-blue-500/10': 'bg-emerald-50',
  'bg-blue-500/20': 'bg-emerald-100',
  
  // Hover states
  'hover:text-white': 'hover:text-slate-900',
  'hover:bg-white/5': 'hover:bg-slate-100',
  'hover:bg-white/10': 'hover:bg-slate-200',
  'hover:border-blue-500/30': 'hover:border-emerald-300',
  'hover:shadow-white/20': 'hover:shadow-slate-300',
  
  // Gradients
  'from-blue-400 to-cyan-400': 'from-emerald-500 to-teal-500',
  'from-blue-600 to-violet-600': 'from-slate-900 to-slate-800',
  'hover:from-blue-500 hover:to-violet-500': 'hover:from-slate-800 hover:to-slate-700',
  'from-blue-900/40 to-cyan-900/40': 'from-emerald-50 to-teal-50',
  'from-[#1e2130] to-[#12141f]': 'from-slate-100 to-slate-200',
  'from-blue-900/40 to-violet-900/40': 'from-rose-50 to-orange-50',
  
  // Primary Buttons (Navy)
  'bg-blue-600': 'bg-slate-900',
  'hover:bg-blue-500': 'hover:bg-slate-800',
  'shadow-blue-500/25': 'shadow-slate-900/20',
  'shadow-blue-500/30': 'shadow-slate-900/20',
  
  // Specific tweaks
  'shadow-white/10': 'shadow-slate-200',
  'glass-card': 'glass-card-light',
};

// Exception for text-white inside primary buttons
// A simple replace might break text-white inside bg-slate-900.
// We will manually fix `glass-card-light` in globals.css

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const [key, value] of Object.entries(replacements)) {
        // Regex to replace exact class names, guarding boundaries
        const regex = new RegExp(`(?<=[\\s"'\\\`])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\s"'\\\`])`, 'g');
        content = content.replace(regex, value);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(directory);
console.log("Migration complete.");
