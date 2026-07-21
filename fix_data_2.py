import re

with open('src/data.ts', 'r') as f:
    content = f.read()

# Remove the custom catalog items
content = re.sub(r"  // Add specific shaped beads\n  catalog\.push\(\{[\s\S]*?id: 'stone-coral-jade-cube-8'[\s\S]*?\}\);\n", "", content)
content = re.sub(r"  catalog\.push\(\{[\s\S]*?id: 'stone-coral-jade-heart-12'[\s\S]*?\}\);\n", "", content)

with open('src/data.ts', 'w') as f:
    f.write(content)
