import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

start_tag = '<svg '
end_tag = '</svg>'

start_idx = content.find(start_tag, content.find('1394'))
end_idx = content.find(end_tag, start_idx) + len(end_tag)

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

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(new_content)

