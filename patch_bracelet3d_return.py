import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

new_return = """  return (
    <div className="relative w-full aspect-square bg-[#f2f2f4]">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* 3D Analysis View Player UI matching the photo */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-10 pointer-events-none">
        <span className="text-[11px] font-sans text-gray-500 tracking-wide">3D Analysis View</span>
        <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full px-4 py-2.5 shadow-sm border border-gray-200/50 gap-4 pointer-events-auto">
          <button 
             onClick={() => setAutoRotate(!autoRotate)}
             className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center w-5 h-5"
          >
            {autoRotate ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            <span className="text-[10px] text-gray-400 font-sans tracking-tight">360&deg;</span>
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden relative ml-1">
              <div className="absolute left-0 top-0 h-full bg-gray-400 w-1/3 rounded-full" />
              <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

# Extract everything before "  return (\n    <div className=\"relative w-full aspect-square"
pattern = r"(.*?)(  return \(\n    <div className=\"relative w-full aspect-square.*)"
match = re.search(pattern, content, flags=re.DOTALL)
if match:
    content = match.group(1) + new_return
else:
    print("Failed to find return statement")

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
