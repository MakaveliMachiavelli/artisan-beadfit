import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

new_return = """  return (
    <>
      <div className="min-h-screen pb-16 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[var(--theme-primary)] text-gold-100 border border-gold-300 px-6 py-3 rounded-full text-sm font-mono shadow-xl transition-all duration-300">
          ✨ {toastMsg}
        </div>
      )}

      {/* Header section */}
      <header className="py-8 text-center md:text-left border-b hairline border-obsidian-200/50 mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-gold-500 font-semibold">Est. 2024 • Bespoke Jewelry Studio</span>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tighter italic text-[var(--theme-primary)] mt-2">
            Artisan Beadfit
          </h1>
          <p className="font-sans text-sm text-obsidian-500 mt-2 max-w-xl leading-relaxed">
            Crafting tactile gemstone connections. Calibrate mineral geometries to your precise wrist proportions, visualize physical clearance, and dispatch direct orders.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOrderOpen(true)} className="px-6 py-3 bg-[var(--theme-primary)] text-white hover:opacity-90 font-mono text-xs uppercase tracking-widest rounded-sm transition-all shadow-md">
            Review Design
          </button>
          <button onClick={() => setIsAdminOpen(true)} className="p-2 border hairline border-obsidian-200/50 text-obsidian-600 hover:text-[var(--theme-primary)] rounded-sm glass-panel transition-all" title="Studio Terminal">
            <Sparkles className="w-5 h-5" />
          </button>
          {user ? (
            <button onClick={logout} className="p-2 border hairline border-obsidian-200/50 text-obsidian-600 hover:text-red-500 rounded-sm glass-panel transition-all" title="Log Out">
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="p-2 border hairline border-obsidian-200/50 text-obsidian-600 hover:text-[var(--theme-primary)] rounded-sm glass-panel transition-all" title="Log In">
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Column: Gemstone & Styling Controls */}
        <div className="lg:col-span-4 space-y-6">
          <GemstoneSelectorPanel 
            gemstoneNames={gemstoneNames}
            mainStone={mainStone}
            setMainStone={setMainStone}
            catalog={catalog}
            mainSize={mainSize}
            setMainSize={setMainSize}
            showToast={showToast}
            sizesForActiveStone={sizesForActiveStone}
            qualitiesForActiveStoneSize={qualitiesForActiveStoneSize}
            mainQuality={mainQuality}
            setMainQuality={setMainQuality}
            markup={markup}
          />
          <FitCalibrationPanel 
            unit={unit}
            setUnit={setUnit}
            wristMm={wristMm}
            setWristMm={setWristMm}
            ease={ease}
            setEase={setEase}
            showToast={showToast}
          />
          <LetterBeadSequencer 
            customWord={customWord}
            setCustomWord={setCustomWord}
            letterStyle={letterStyle}
            setLetterStyle={setLetterStyle}
          />
          <SequenceEditorPanel 
            availableSpacers={availableSpacers}
            activeSpacerId={activeSpacerId}
            setActiveSpacerId={setActiveSpacerId}
            availableCharms={availableCharms}
            selectedCharmId={selectedCharmId}
            setSelectedCharmId={setSelectedCharmId}
            markup={markup}
            applyGoldenRatioAutoStyle={applyGoldenRatioAutoStyle}
            autoFitBracelet={autoFitBracelet}
            beadsCount={beads.length}
            designLength={designStats.length}
            handleAddBead={handleAddBead}
            handleRemoveBead={handleRemoveBead}
          />
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main 3D Stage */}
          <div className="h-[60vh] lg:h-[70vh] rounded-xl overflow-hidden shadow-2xl border hairline border-obsidian-200/50 bg-[#f2f2f4]">
            <Bracelet3D
              beads={beads}
              activeCharm={activeCharm}
              selectedBeadIndex={selectedBeadIndex}
              setSelectedBeadIndex={setSelectedBeadIndex}
              blueprintRadius={(wristMm + ease) / (2 * Math.PI) / 10}
              wristMm={wristMm}
              ease={ease}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Blueprint2D 
               beads={beads}
               gemstoneNames={gemstoneNames}
               xrayMode={true}
               designStats={designStats}
               isSpinning={false}
            />
            <ExpertAssessment 
               expertAnalysis={expertAnalysis}
            />
          </div>
          
          {/* Presets Gallery (from original UI) */}
          <div className="mt-8 border hairline border-obsidian-200/50 p-6 rounded-sm glass-panel bg-white/40">
            <h3 className="font-serif text-lg text-obsidian-900 mb-4">Masterpiece Archives</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {DESIGN_PRESETS.map((p) => {
                const firstStone = catalog.find(i => i.name === p.pattern[0]);
                const secStone = catalog.find(i => i.name === p.pattern[1]);
                if (!firstStone || !secStone) return null;
                return (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="group text-left p-3.5 border hairline border-obsidian-200/50 rounded-sm glass-panel hover:glass-panel hover:border-gold-400 transition-all duration-300"
                  >
                    <div className="flex gap-1.5 mb-2.5">
                      <span className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: firstStone.hex }} />
                      <span className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: secStone.hex }} />
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-[var(--theme-primary)] leading-tight group-hover:text-gold-600 transition-colors">
                      {p.name}
                    </h4>
                    <span className="font-mono text-[10px] text-obsidian-400 block mt-0.5">{p.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Modals */}
      {isOrderOpen && <CheckoutModal onClose={() => setIsOrderOpen(false)} />}
      {isAdminOpen && <AdminPanelModal onClose={() => setIsAdminOpen(false)} />}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </>
  );
};
"""

# Extract everything before "  return (\n    <div className=\"w-screen h-screen overflow-hidden\">"
pattern = r"(.*?)(  return \(\n    <div className=\"w-screen h-screen overflow-hidden\">.*)"
match = re.search(pattern, content, flags=re.DOTALL)
if match:
    content = match.group(1) + new_return
else:
    print("Failed to find return statement")

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
