import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

content = content.replace("scene.background = new THREE.Color('#0a0d14');", "// scene.background = new THREE.Color('#0a0d14'); // Removed to let Background3D shine through")

# Enhance shadow resolution
content = content.replace("keyLight.shadow.mapSize.width = 1024;\n    keyLight.shadow.mapSize.height = 1024;", "keyLight.shadow.mapSize.width = 2048;\n    keyLight.shadow.mapSize.height = 2048;")

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
