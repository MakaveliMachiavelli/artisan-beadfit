import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '}, [beads, activeCharm, selectedBeadIndex]);',
    '}, [beads, activeCharm, selectedBeadIndex, isExploded]);'
)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
