with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("legacyHeaders: false,\n,\n  validate", "legacyHeaders: false,\n  validate")

with open('server.ts', 'w') as f:
    f.write(content)
