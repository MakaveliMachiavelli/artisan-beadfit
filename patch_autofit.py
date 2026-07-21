import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

replacement = """  const autoFitBracelet = () => {
    if (!activeMainItem) return;
    
    // Check if it's the exact 19/19 Coral Jade pattern
    const isCoralJadeFossil = beads.length === 38 && beads.filter(b => b.name === 'Jade Spacer').length === 19 && beads.some(b => b.name.includes('Coral Jade'));
    if (isCoralJadeFossil) {
        // Do not auto-fit this strict design
        return;
    }

    let currentBeads = [...beads];"""

content = content.replace("  const autoFitBracelet = () => {\n    if (!activeMainItem) return;\n    \n    let currentBeads = [...beads];", replacement)

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
