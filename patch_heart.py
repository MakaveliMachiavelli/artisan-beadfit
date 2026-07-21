import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

replacement = """          const tangentAngle = angle + Math.PI / 2;
          geometry.rotateY(-tangentAngle + Math.PI);
          geometry.rotateZ(Math.PI);"""

# Replace the previous heart rotation logic
pattern = r"          const tangentAngle = angle \+ Math\.PI / 2;\n          geometry\.rotateY\(-tangentAngle\);\n          geometry\.rotateX\(Math\.PI / 2\); // Face outward\n          geometry\.rotateZ\(Math\.PI\);"

content = re.sub(pattern, replacement, content)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
