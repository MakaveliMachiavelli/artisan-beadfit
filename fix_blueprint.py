import re

with open('src/components/Blueprint2D.tsx', 'r') as f:
    content = f.read()

# Replace info with info || {}
content = content.replace("const info = GEMSTONE_DB[name];", "const info = GEMSTONE_DB[name];\n                      if (!info) return null;")

with open('src/components/Blueprint2D.tsx', 'w') as f:
    f.write(content)
