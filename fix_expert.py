import re
with open('src/components/ExpertAssessment.tsx', 'r') as f:
    text = f.read()

text = text.replace('hardnessWarning: string | null;', 'hardnessWarning?: string | null;')

with open('src/components/ExpertAssessment.tsx', 'w') as f:
    f.write(text)
