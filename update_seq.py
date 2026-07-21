import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

import_str = "import { SequenceEditorPanel } from '../components/SequenceEditorPanel';\n"
import_idx = content.find("import { CheckoutModal }")
if import_idx != -1:
    content = content[:import_idx] + import_str + content[import_idx:]

start = content.find("                {/* Symmetrical Accents and Spacer Selector */}")
end = content.find("          </div>\n        </section>\n\n        {/* Right Column: Interactive Rendering Tray & Expert Advisor */}", start)

if start != -1 and end != -1:
    replacement = """                <SequenceEditorPanel
                  availableSpacers={availableSpacers}
                  activeSpacerId={activeSpacerId}
                  setActiveSpacerId={setActiveSpacerId}
                  availableCharms={availableCharms}
                  selectedCharmId={selectedCharmId}
                  setSelectedCharmId={setSelectedCharmId}
                  markup={markup}
                  applyGoldenRatioAutoStyle={applyGoldenRatioAutoStyle}
                  autoFitBracelet={autoFitBracelet}
                  beadsCount={beads.length}
                  designLength={designStats.length}
                  handleAddBead={handleAddBead}
                  handleRemoveBead={handleRemoveBead}
                />
"""
    content = content[:start] + replacement + content[end:]

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
