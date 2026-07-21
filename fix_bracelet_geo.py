import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

# Remove Geometry logic for Cube and Heart
pattern = r"if \(b\.name\.includes\('Cube'\)\) \{[\s\S]*?else if \(b\.name\.includes\('Heart'\)\) \{[\s\S]*?\} else \{"
new_content = re.sub(pattern, "if (false) { } else {", content)
content = new_content

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
