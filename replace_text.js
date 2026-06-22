const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  if (file.includes('ThemeText.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if file uses Text
  if (content.includes('<Text') || content.includes(' Text,') || content.includes(' Text }')) {
    
    // Check if it imports Text from react-native
    const rnImportRegex = /import\s+{([^}]*)}\s+from\s+["']react-native["']/g;
    let match;
    let hasRNText = false;
    
    content = content.replace(rnImportRegex, (fullMatch, group1) => {
      const parts = group1.split(',').map(s => s.trim()).filter(s => s);
      if (parts.includes('Text')) {
        hasRNText = true;
        const newParts = parts.filter(p => p !== 'Text');
        if (newParts.length === 0) return '';
        return `import { ${newParts.join(', ')} } from "react-native"`;
      }
      return fullMatch;
    });

    if (hasRNText) {
      // Add the custom text import after the last import
      const importCustom = `import { ThemeText as Text } from "@/components/ui/ThemeText";\n`;
      
      // Find the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + importCustom + content.slice(nextLineIndex + 1);
      } else {
        content = importCustom + content;
      }
      
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  }
});
