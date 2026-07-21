import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

new_return = """  return (
    <div className="w-screen h-screen overflow-hidden">
      <Bracelet3D
        beads={beads}
        activeCharm={activeCharmItem}
        selectedBeadIndex={selectedBeadIndex}
        setSelectedBeadIndex={setSelectedBeadIndex}
        blueprintRadius={radiusMm / 10}
        wristMm={wristMm}
        ease={ease}
      />
    </div>
  );
};
"""

# Extract everything before "  return (\n    <>\n      \n      <div className=\"min-h-screen"
pattern = r"(.*?)(  return \(\n    <>\n      \n      <div className=\"min-h-screen.*)"
match = re.search(pattern, content, flags=re.DOTALL)
if match:
    content = match.group(1) + new_return
else:
    print("Failed to find return statement")

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
