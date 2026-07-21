import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

# 1. Add isExploded state
content = content.replace(
    'const [hoveredBeadName, setHoveredBeadName] = useState<string | null>(null);',
    'const [hoveredBeadName, setHoveredBeadName] = useState<string | null>(null);\n  const [isExploded, setIsExploded] = useState(false);'
)

# 2. Add EXPLODE toggle button to HUD
old_hud_buttons = '''      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-2 rounded-sm text-[9px] uppercase tracking-[0.15em] font-mono border-[0.5px] transition-all flex items-center gap-1.5 cursor-pointer shadow-ambient ${
            autoRotate
              ? 'bg-white/20 backdrop-blur-lg text-white border-white/30'
              : 'bg-white/5 backdrop-blur-md text-obsidian-200 border-white/10 hover:bg-white/10'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          {autoRotate ? "Auto Spin" : "Manual Orbit"}
        </button>
      </div>'''

new_hud_buttons = '''      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        <button
          onClick={() => setIsExploded(!isExploded)}
          className={`px-3 py-2 rounded-sm text-[9px] uppercase tracking-[0.15em] font-mono border-[0.5px] transition-all flex items-center gap-1.5 cursor-pointer shadow-ambient ${
            isExploded
              ? 'bg-white/20 backdrop-blur-lg text-gold-300 border-white/30'
              : 'bg-white/5 backdrop-blur-md text-obsidian-200 border-white/10 hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isExploded ? "SNAP TO FIT" : "EXPLODE / INSPECT"}
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-2 rounded-sm text-[9px] uppercase tracking-[0.15em] font-mono border-[0.5px] transition-all flex items-center gap-1.5 cursor-pointer shadow-ambient ${
            autoRotate
              ? 'bg-white/20 backdrop-blur-lg text-white border-white/30'
              : 'bg-white/5 backdrop-blur-md text-obsidian-200 border-white/10 hover:bg-white/10'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          {autoRotate ? "Auto Spin" : "Manual Orbit"}
        </button>
      </div>'''

content = content.replace(old_hud_buttons, new_hud_buttons)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
