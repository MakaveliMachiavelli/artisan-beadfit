import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

# Replace imports
import_idx = content.find("import { Blueprint2D } from '../components/Blueprint2D';")
if import_idx != -1:
    content = content[:import_idx] + "import { Blueprint2D } from '../components/Blueprint2D';\nimport { CheckoutModal } from '../components/CheckoutModal';\n" + content[import_idx + len("import { Blueprint2D } from '../components/Blueprint2D';"):]

# Remove unused states
states_to_remove = [
    "  const [orderName, setOrderName] = useState<string>('');\n",
    "  const [orderContact, setOrderContact] = useState<string>('');\n",
    "  const [orderAddress, setOrderAddress] = useState<string>('');\n",
    "  const [orderRegion, setOrderRegion] = useState<string>('Metro Manila');\n",
    "  const [orderQty, setOrderQty] = useState<number>(1);\n",
    "  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);\n",
    "  const [voucherCode, setVoucherCode] = useState<string>('');\n",
    "  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);\n",
    "  const [voucherError, setVoucherError] = useState<string>('');\n",
    "  const [orderNotes, setOrderNotes] = useState<string>('');\n",
    "  const [orderView, setOrderView] = useState<'customer' | 'bench'>('customer');\n"
]

for state in states_to_remove:
    content = content.replace(state, "")

# Remove unused logic (handleCopyToClipboard, handleApplyVoucher, orderCalculations, customerOrderSheetText, benchSheetText, toggleAddon)
# We can just look for the block boundaries.
# handleCopyToClipboard
start = content.find("  const handleCopyToClipboard = (text: string) => {")
end = content.find("  };\n\n  // --- VOUCHER ---", start) + 5
if start != -1:
    content = content[:start] + content[end:]

# VOUCHER logic
start = content.find("  // --- VOUCHER ---\n  const handleApplyVoucher = () => {")
end = content.find("    }\n  };\n\n  // --- ORDER DISPATCH WRITER ---", start) + 6
if start != -1:
    content = content[:start] + content[end:]

# ORDER DISPATCH WRITER (addonsPrice, orderCalculations, customerOrderSheetText, benchSheetText)
start = content.find("  // --- ORDER DISPATCH WRITER ---\n  const addonsPrice")
end = content.find("  }, [beads, activeCharm, designStats, orderName, orderRegion, packaging]);\n\n  const toggleAddon = (id: string) => {", start)
end = content.find("    }\n  };\n\n", end) + 7
if start != -1:
    content = content[:start] + content[end:]

# Replace checkout UI
start = content.find("      {/* --- DIRECT CHECKOUT / ORDER MODAL SHEET --- */}")
end = content.find("      {/* --- STUDIO CONFIGURATION / ADMIN SETTINGS OVERLAY --- */}", start)

if start != -1 and end != -1:
    replacement = """      <CheckoutModal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        beads={beads}
        activeCharm={activeCharm}
        designStats={designStats}
        mainStone={mainStone}
        mainSize={mainSize}
        mainQuality={mainQuality}
        wristMm={wristMm}
        ease={ease}
        packaging={packaging}
        packingCost={packingCost}
        showToast={showToast}
      />

"""
    content = content[:start] + replacement + content[end:]

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)

