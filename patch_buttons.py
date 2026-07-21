import re
with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r'<div className="flex border-b hairline border-obsidian-200/50 glass-panel">.*?</div>\s*<div className="p-6 md:p-8', re.DOTALL)

new_buttons = '''<div className="flex border-b hairline border-obsidian-200/50 glass-panel">
            <button 
              onClick={() => setActiveTab('minerals')}
              className={`flex-1 py-4 text-xs font-mono tracking-[0.18em] uppercase font-semibold transition-all ${activeTab === 'minerals' ? 'glass-panel text-[var(--theme-primary)] border-b hairline border-obsidian-900' : 'text-obsidian-500 hover:glass-panel'}`}
            >
              MINERALS
            </button>
            <button 
              onClick={() => setActiveTab('customization')}
              className={`flex-1 py-4 text-xs font-mono tracking-[0.18em] uppercase font-semibold transition-all ${activeTab === 'customization' ? 'glass-panel text-[var(--theme-primary)] border-b hairline border-obsidian-900' : 'text-obsidian-500 hover:glass-panel'}`}
            >
              CUSTOMIZATION & FIT
            </button>
          </div>
          <div className="p-6 md:p-8'''

content = re.sub(pattern, new_buttons, content)

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
