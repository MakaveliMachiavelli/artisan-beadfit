import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    lines = f.readlines()

start_idx = 0
end_idx = 0
for i, line in enumerate(lines):
    if '{/* --- DIRECT CHECKOUT / ORDER MODAL SHEET --- */}' in line:
        start_idx = i
    if '{/* --- STUDIO CONFIGURATION / ADMIN SETTINGS OVERLAY --- */}' in line:
        end_idx = i
        break

modal_lines = lines[start_idx:end_idx]
modal_str = "".join(modal_lines)

# Find all uppercase component tags and variables
import ast
class Visitor(ast.NodeVisitor):
    def __init__(self):
        self.names = set()
    def visit_Name(self, node):
        self.names.add(node.id)
        self.generic_visit(node)

print("Props needed possibly:")
# Just use regex for simplicity
props = set(re.findall(r'\b([a-zA-Z_]\w*)\b', modal_str))
for p in sorted(list(props)):
    print(p)

