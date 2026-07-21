import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

replacement = """    const theoreticalCount = calculateBeadCountForCircumference(targetMm, preset.size);
    let totalCount = Math.round(theoreticalCount);
    
    // If the preset defines a full-length exact pattern (like our 19/19 Coral Jade design), use it exactly
    if (preset.name === 'Coral Jade Fossil') {
       totalCount = preset.pattern.length;
    }

    const newBeads: BeadInstance[] = [];"""

pattern = r"    const theoreticalCount = calculateBeadCountForCircumference\(targetMm, preset\.size\);\n    const totalCount = Math\.round\(theoreticalCount\);\n\n    const newBeads: BeadInstance\[\] = \[\];"

content = re.sub(pattern, replacement, content)

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
