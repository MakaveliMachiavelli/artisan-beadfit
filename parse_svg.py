import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

start_tag = '<svg '
end_tag = '</svg>'

start_idx = content.find(start_tag, content.find('1394')) # To ensure we grab the right svg
if start_idx == -1:
    start_idx = content.find(start_tag)

# Find matching </svg>
end_idx = content.find(end_tag, start_idx) + len(end_tag)

svg_str = content[start_idx:end_idx]

with open('svg_extracted.txt', 'w') as f:
    f.write(svg_str)

