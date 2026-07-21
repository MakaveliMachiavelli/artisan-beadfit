with open('src/data.ts', 'r') as f:
    content = f.read()

# Replace the Jade Spacer type
old_spacer = """  catalog.push({
    id: 'stone-jade-spacer-6',
    type: 'stone',
    name: 'Jade Spacer',"""
new_spacer = """  catalog.push({
    id: 'stone-jade-spacer-6',
    type: 'spacer',
    name: 'Jade Spacer',"""

content = content.replace(old_spacer, new_spacer)

with open('src/data.ts', 'w') as f:
    f.write(content)
