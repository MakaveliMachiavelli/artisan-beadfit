import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

import_str = "import { FitCalibrationPanel } from '../components/FitCalibrationPanel';\n"
import_idx = content.find("import { CheckoutModal }")
if import_idx != -1:
    content = content[:import_idx] + import_str + content[import_idx:]

# Remove formattedWristVal and handleWristInputChange
start = content.find("  const formattedWristVal = () => {")
end = content.find("  // --- ADMIN PASSCODE UNLOCK ---")
# Actually, the handleAdminUnlock was removed. Let's find end by looking for handleExport
end = content.find("  // --- EXPORT / SHARE LOGIC ---")

if start != -1 and end != -1:
    content = content[:start] + content[end:]

# Replace Fit Calibration Panel UI
start = content.find("                {/* Sizing & Comfort Console */}")
end = content.find("          <hr className=\"hairline border-obsidian-200/50/30\" />", start)

if start != -1 and end != -1:
    replacement = """                <FitCalibrationPanel
                  unit={unit}
                  setUnit={setUnit}
                  wristMm={wristMm}
                  setWristMm={setWristMm}
                  ease={ease}
                  setEase={setEase}
                  showToast={showToast}
                />
"""
    content = content[:start] + replacement + content[end:]

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
