import re

with open('src/index.css', 'r') as f:
    content = f.read()

content = content.replace('    background-color: #faf9f6;\n    background-image: radial-gradient(rgba(176, 141, 87, 0.04) 1px, transparent 1px);\n    background-size: 24px 24px;\n', '    background: transparent;\n')

with open('src/index.css', 'w') as f:
    f.write(content)
