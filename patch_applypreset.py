import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

replacement = """    const patternItems = preset.pattern.map(name => {
      const exactMatch = catalog.find(i => i.type === 'stone' && i.name === name && i.size === preset.size);
      if (exactMatch) return exactMatch;
      // Fallback: ignore size if the item exists in another size (e.g. specialized shapes)
      const nameMatch = catalog.find(i => i.type === 'stone' && i.name === name);
      return nameMatch || mainItem;
    });"""

content = re.sub(r"    const patternItems = preset\.pattern\.map\(name => \{\n      return catalog\.find\(i => i\.type === 'stone' && i\.name === name && i\.size === preset\.size\) \|\| mainItem;\n    \}\);", replacement, content)

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
