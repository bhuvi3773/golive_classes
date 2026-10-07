import fs from 'fs';
import path from 'path';

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (
          (line.includes('bg-slate-900') || 
           line.includes('from-slate-900') || 
           line.includes('bg-[#12141f]') || 
           line.includes('bg-green-600') || 
           line.includes('bg-red-600') || 
           line.includes('bg-red-500') || 
           line.includes('bg-blue-600') ||
           line.includes('bg-emerald-600')) 
           && line.includes('text-slate-900')
        ) {
            // Revert back text-slate-900 to text-white for dark background elements
            lines[i] = line.replace(/text-slate-900/g, 'text-white');
        }
      }
      
      content = lines.join('\n');
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed ${fullPath}`);
      }
    }
  }
}
walkDir('./src');
