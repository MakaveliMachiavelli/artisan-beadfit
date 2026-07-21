import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

import_str = "import { AdminPanelModal } from '../components/AdminPanelModal';\n"
import_idx = content.find("import { CheckoutModal }")
if import_idx != -1:
    content = content[:import_idx] + import_str + content[import_idx:]

# Remove unused states
states_to_remove = [
    "  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(false);\n",
    "  const [adminPass, setAdminPass] = useState<string>('');\n",
    "  const [adminTab, setAdminTab] = useState<'Catalog' | 'Pricing' | 'Shipping'>('Catalog');\n"
]

for state in states_to_remove:
    content = content.replace(state, "")

# Remove handleAdminUnlock
start = content.find("  // --- ADMIN PASSCODE UNLOCK ---")
end = content.find("  };\n\n", start) + 5
if start != -1:
    content = content[:start] + content[end:]

# Replace admin UI
start = content.find("      {/* --- STUDIO CONFIGURATION / ADMIN SETTINGS OVERLAY --- */}")
end = content.find("    </div>\n    </>\n  );\n}")

if start != -1 and end != -1:
    replacement = """      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        markup={markup}
        setMarkup={setMarkup}
        laborCost={laborCost}
        setLaborCost={setLaborCost}
        packingCost={packingCost}
        setPackingCost={setPackingCost}
        catalog={catalog}
        showToast={showToast}
      />
"""
    content = content[:start] + replacement + content[end:]

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
