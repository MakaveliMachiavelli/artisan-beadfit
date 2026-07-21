import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

new_ui = """      {/* 3D Analysis View Player UI matching the photo */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-10">
        <span className="text-[11px] font-sans text-gray-500 tracking-wide">3D Analysis View</span>
        <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full px-4 py-2.5 shadow-sm border border-gray-200/50 gap-4">
          <button 
             onClick={() => setAutoRotate(!autoRotate)}
             className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer z-50 pointer-events-auto"
          >
            {autoRotate ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-sans tracking-tight">360&deg;</span>
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full bg-gray-400 w-1/3 rounded-full" />
              <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>
"""

# Replace from "      {/* UI Overlay */}" to "      {/* Ambient Depth Vignette Shadow Overlays */}"
# (not including the ambient overlay itself)
pattern = r"      \{\/\* UI Overlay \*\/\}.*?(?=      \{\/\* Ambient Depth Vignette Shadow Overlays \*\/\})"

content = re.sub(pattern, new_ui, content, flags=re.DOTALL)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
