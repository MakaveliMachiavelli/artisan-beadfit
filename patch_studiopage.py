import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("<Background3D />", "")

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
