const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// I will just use string replacement on the exact sections.

const split1 = `          <hr className="border-gold-200/30" />

                {/* Sizing & Comfort Console */}`;
const replace1 = `              </>
            )}

            {activeTab === 'fit' && (
              <>
                {/* Sizing & Comfort Console */}`;
content = content.replace(split1, replace1);

const split2 = `          <hr className="border-gold-200/30" />

                {/* 2. Materials & Components */}`;
const replace2 = `              </>
            )}

            {activeTab === 'stones' && (
              <>
                {/* 2. Materials & Components */}`;
content = content.replace(split2, replace2);

const split3 = `          <hr className="border-gold-200/30" />

                {/* Symmetrical Accents and Spacer Selector */}`;
const replace3 = `              </>
            )}

            {activeTab === 'accents' && (
              <>
                {/* Symmetrical Accents and Spacer Selector */}`;
content = content.replace(split3, replace3);

const split4 = `                {/* Micro sequence editor */}`;
const replace4 = `              </>
            )}
            
            {(activeTab === 'stones' || activeTab === 'accents') && (
              <>
                <hr className="border-gold-200/30" />
                {/* Micro sequence editor */}`;
content = content.replace(split4, replace4);

const split5 = `        </section>

        {/* Right Column: Interactive Rendering Tray & Expert Advisor */}`;
const replace5 = `              </>
            )}
          </div>
        </section>

        {/* Right Column: Interactive Rendering Tray & Expert Advisor */}`;
content = content.replace(split5, replace5);

// Let's also fix the first block
const split0 = `          <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
            {activeTab === 'stones' && (
              <>
                {/* Preset Designs Row */}`;
// It's actually correct!

fs.writeFileSync('src/App.tsx', content);
