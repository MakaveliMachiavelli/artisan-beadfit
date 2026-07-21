import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

new_effect = """
  // Initial load of default preset
  useEffect(() => {
    if (beads.length === 0) {
      const defaultPreset = DESIGN_PRESETS.find(p => p.name === 'Coral Jade Fossil');
      if (defaultPreset) applyPreset(defaultPreset);
    }
  }, []);

  useEffect(() => {
"""

content = content.replace("  useEffect(() => {\n    checkSession();", new_effect + "    checkSession();")

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
