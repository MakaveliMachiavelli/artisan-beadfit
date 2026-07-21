with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

# Replace Gemstone Selector
start1 = content.find("            {/* Micro Swatches */}")
start1_h3 = content.rfind("<h3", 0, start1)
end1 = content.find("              </>\n            )}", start1)
if start1_h3 != -1 and end1 != -1:
    gem_replacement = """          <GemstoneSelectorPanel
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
    content = content[:start1_h3] + gem_replacement + content[end1:]

# Replace Letter Bead
start2 = content.find("                {/* Letter Bead Sequencer */}")
end2 = content.find("              </>\n            )}", start2)

if start2 != -1 and end2 != -1:
    letter_replacement = """                <LetterBeadSequencer
                  customWord={customWord}
                  setCustomWord={setCustomWord}
                  letterStyle={letterStyle}
                  setLetterStyle={setLetterStyle}
                />
"""
    content = content[:start2] + letter_replacement + content[end2:]

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
