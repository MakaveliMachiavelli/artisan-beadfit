import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

import_str = "import { LetterBeadSequencer } from '../components/LetterBeadSequencer';\n"
import_idx = content.find("import { CheckoutModal }")
if import_idx != -1:
    content = content[:import_idx] + import_str + content[import_idx:]

start = content.find("                {/* Letter Bead Sequencer */}")
end = content.find("              </>\n            )}\n            {activeTab === 'customization' && (", start)

if start != -1 and end != -1:
    replacement = """                <LetterBeadSequencer
                  customWord={customWord}
                  setCustomWord={setCustomWord}
                  letterStyle={letterStyle}
                  setLetterStyle={setLetterStyle}
                />
"""
    content = content[:start] + replacement + content[end:]

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
