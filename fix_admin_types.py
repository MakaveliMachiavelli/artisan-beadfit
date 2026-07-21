import re
with open('src/components/AdminPanelModal.tsx', 'r') as f:
    text = f.read()

text = text.replace("import { REGIONS } from '../utils';", "import { REGIONS } from '../data';")

with open('src/components/AdminPanelModal.tsx', 'w') as f:
    f.write(text)
