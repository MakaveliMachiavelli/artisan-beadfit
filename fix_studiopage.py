import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("activeCharm={activeCharmItem}", "activeCharm={activeCharm}")
content = content.replace("blueprintRadius={radiusMm / 10}", "blueprintRadius={(wristMm + ease) / (2 * Math.PI) / 10}")

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
