import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="relative w-full aspect-square bg-[#f2f2f4]"', 'className="relative w-full h-full bg-[#f2f2f4]"')

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
