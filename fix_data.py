import re

with open('src/data.ts', 'r') as f:
    content = f.read()

# Replace the preset
new_pattern = """    name: 'Coral Jade Fossil',
    sub: 'Kasiglahan & Katatagan (Sample)',
    size: 8,
    pattern: [""" + ", ".join(["'Coral Jade'"] * 19) + """]
  },"""

# Use regex to replace the preset
content = re.sub(r"    name: 'Coral Jade Fossil',.*?\]\n  \},", new_pattern, content, flags=re.DOTALL)

with open('src/data.ts', 'w') as f:
    f.write(content)
