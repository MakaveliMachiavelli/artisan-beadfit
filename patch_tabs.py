import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace state
content = content.replace("const [activeTab, setActiveTab] = useState<'stones' | 'accents' | 'words' | 'fit'>('stones');", "const [activeTab, setActiveTab] = useState<'minerals' | 'customization'>('minerals');")

# Replace tab buttons
old_buttons = '''          <div className="flex border-b hairline border-obsidian-200/50">
            <button 
              onClick={() => setActiveTab('stones')}
              className={`flex-1 py-4 text-xs font-mono tracking-[0.18em] uppercase font-semibold transition-all ${activeTab === 'stones' ? 'glass-panel text-[var(--theme-primary)] border-b hairline border-obsidian-900' : 'text-obsidian-500 hover:glass-panel'}`}
            >
              1. Stones
            </button>
            <button 
              onClick={() => setActiveTab('accents')}
              className={`flex-1 py-4 text-xs font-mono tracking-[0.18em] uppercase font-semibold transition-all ${activeTab === 'accents' ? 'glass-panel text-[var(--theme-primary)] border-b hairline border-obsidian-900' : 'text-obsidian-500 hover:glass-panel'}`}
            >
              2. Accents
            </button>
            <button 
              onClick={() => setActiveTab('words')}
              className={`flex-1 py-4 text-xs font-mono tracking-[0.18em] uppercase font-semibold transition-all ${activeTab === 'words' ? 'glass-panel text-[var(--theme-primary)] border-b hairline border-obsidian-900' : 'text-obsidian-500 hover:glass-panel'}`}
            >
              3. Words
            </button>
            <button 
              onClick={() => setActiveTab('fit')}
              className={`flex-1 py-4 text-xs font-mono tracking-[0.18em] uppercase font-semibold transition-all ${activeTab === 'fit' ? 'glass-panel text-[var(--theme-primary)] border-b hairline border-obsidian-900' : 'text-obsidian-500 hover:glass-panel'}`}
            >
              4. Fit
            </button>
          </div>'''

new_buttons = '''          <div className="flex border-b hairline border-obsidian-200/50">
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
          </div>'''

content = content.replace(old_buttons, new_buttons)

# Replace activeTab conditionals
content = content.replace("activeTab === 'stones'", "activeTab === 'minerals'")
content = content.replace("activeTab === 'accents'", "activeTab === 'customization'")
content = content.replace("activeTab === 'words'", "activeTab === 'customization'")
content = content.replace("activeTab === 'fit'", "activeTab === 'customization'")
content = content.replace("(activeTab === 'minerals' || activeTab === 'customization')", "true") # Just show sequence editor everywhere or under minerals. Let's make it minerals.
# Actually, wait. The condition was `(activeTab === 'stones' || activeTab === 'accents')`. 
# If it becomes `(activeTab === 'minerals' || activeTab === 'customization')`, it means it shows everywhere.
# Let's fix that specific one first so it doesn't get messed up.

with open('src/App.tsx', 'w') as f:
    f.write(content)
