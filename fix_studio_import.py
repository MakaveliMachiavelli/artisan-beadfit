import re
with open('src/pages/StudioPage.tsx', 'r') as f:
    text = f.read()

text = text.replace("  REGIONS, \n", "")

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(text)
