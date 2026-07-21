import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

import_str = "import { GemstoneSelectorPanel } from '../components/GemstoneSelectorPanel';\n"
import_idx = content.find("import { CheckoutModal }")
if import_idx != -1:
    content = content[:import_idx] + import_str + content[import_idx:]

start = content.find("          {/* Primary Gemstone Selector */}")
end = content.find("              </>\n            )}\n            {activeTab === 'customization' && (\n              <>\n                <LetterBeadSequencer", start)

if start != -1 and end != -1:
    replacement = """          <GemstoneSelectorPanel
            gemstoneNames={gemstoneNames}
            mainStone={mainStone}
            setMainStone={setMainStone}
            catalog={catalog}
            mainSize={mainSize}
            setMainSize={setMainSize}
            showToast={showToast}
            sizesForActiveStone={sizesForActiveStone}
            qualitiesForActiveStoneSize={qualitiesForActiveStoneSize}
            mainQuality={mainQuality}
            setMainQuality={setMainQuality}
            markup={markup}
          />
"""
    content = content[:start] + replacement + content[end:]

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
