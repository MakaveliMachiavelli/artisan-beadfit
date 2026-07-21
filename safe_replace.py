with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

start_tag = '<svg \n                  viewBox="0 0 380 380"'
idx = content.find('viewBox="0 0 380 380"')
start_idx = content.rfind('<svg', 0, idx)

# find the closing tag for this svg
end_idx = content.find('</svg>', start_idx) + 6

replacement = """<Blueprint2D
                  beads={beads}
                  gemstoneNames={gemstoneNames}
                  xrayMode={xrayMode}
                  designStats={designStats}
                  isSpinning={isSpinning}
                  manualAngle={manualAngle}
                  activeCharm={activeCharm}
                  selectedBeadIndex={selectedBeadIndex}
                  setSelectedBeadIndex={setSelectedBeadIndex}
                  blueprintMetrics={blueprintMetrics}
                  wristMm={wristMm}
                  spinSpeed={spinSpeed}
                />"""

new_content = content[:start_idx] + replacement + content[end_idx:]

# Also add the import at the top
import_str = "import { Blueprint2D } from '../components/Blueprint2D';\n"
new_content = new_content.replace("import { Bracelet3D } from '../components/Bracelet3D';", "import { Bracelet3D } from '../components/Bracelet3D';\n" + import_str)

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(new_content)

