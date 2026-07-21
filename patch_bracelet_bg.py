import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="relative w-full aspect-square bg-[#111110] rounded-sm p-1 border-[0.5px] border-obsidian-200 shadow-ambient group">',
    '<div className="relative w-full aspect-square glass-panel rounded-sm p-1 border hairline border-obsidian-200/50 shadow-ambient group">'
)

content = content.replace(
    '<div className="w-full h-full relative rounded-sm overflow-hidden border-[0.5px] border-obsidian-200/50 bg-[#151413]">',
    '<div className="w-full h-full relative rounded-sm overflow-hidden border hairline border-obsidian-200/50 glass-panel">'
)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
