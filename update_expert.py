import re

with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

import_str = "import { ExpertAssessment } from '../components/ExpertAssessment';\n"
import_idx = content.find("import { CheckoutModal }")
if import_idx != -1:
    content = content[:import_idx] + import_str + content[import_idx:]

start_idx = content.find("{/* Expert Feedback Panel */}")
end_idx = content.find("          {/* Premium checkout dispatch actions */}")

if start_idx != -1 and end_idx != -1:
    replacement = "          <ExpertAssessment expertAnalysis={expertAnalysis} />\n\n"
    content = content[:start_idx] + replacement + content[end_idx:]

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
