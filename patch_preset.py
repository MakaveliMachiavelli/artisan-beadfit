import re

with open('src/data.ts', 'r') as f:
    content = f.read()

preset_addition = """export const DESIGN_PRESETS: DesignPreset[] = [
  {
    name: 'Coral Jade Fossil',
    sub: 'Kasiglahan & Katatagan (Sample)',
    size: 8,
    pattern: [
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Heart', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer'
    ]
  },"""

# We'll use a regex to replace the specific preset
pattern = r"export const DESIGN_PRESETS: DesignPreset\[\] = \[\n  \{\n    name: 'Coral Jade Fossil',[^\]]*\]\n  \},"
content = re.sub(pattern, preset_addition, content)

with open('src/data.ts', 'w') as f:
    f.write(content)
