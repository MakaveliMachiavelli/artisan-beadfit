import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('bg-obsidian-50', 'glass-panel')
content = content.replace('bg-obsidian-100', 'glass-panel')
content = content.replace('bg-white', 'glass-panel')

with open('src/App.tsx', 'w') as f:
    f.write(content)
