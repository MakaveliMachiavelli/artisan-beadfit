import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

# Replace React import
content = content.replace("import React, { useState, useMemo, useEffect } from 'react';", "import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';")

imports_to_lazy = [
    'Background3D',
    'Bracelet3D',
    'Blueprint2D',
    'ExpertAssessment',
    'AdminPanelModal',
    'FitCalibrationPanel',
    'LetterBeadSequencer',
    'SequenceEditorPanel',
    'GemstoneSelectorPanel',
    'CheckoutModal'
]

for component in imports_to_lazy:
    # Find the import
    pattern = rf"import\s+{{\s*{component}\s*}}\s+from\s+'\.\./components/{component}';"
    
    replacement = f"""
const Lazy{component} = lazy(() => import('../components/{component}').then(m => ({{ default: m.{component} }})));
const {component} = (props: any) => <Suspense fallback={{null}}><Lazy{component} {{...props}} /></Suspense>;
"""
    content = re.sub(pattern, replacement, content)

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
