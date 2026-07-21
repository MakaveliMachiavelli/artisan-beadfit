with open('src/components/Blueprint2D.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { BeadInstance, CatalogItem } from '../types';", "import { BeadInstance, CatalogItem } from '../types';\nimport { GEMSTONE_DB } from '../data';")

content = content.replace(
    "discrepancy: number;",
    "discrepancy: number;\n    status: 'perfect' | 'loose' | 'tight';"
)

content = content.replace(
    "blueprintMetrics: {",
    "wristMm: number;\n  spinSpeed: number;\n  blueprintMetrics: {"
)

content = content.replace(
    "blueprintMetrics,",
    "blueprintMetrics,\n  wristMm,\n  spinSpeed,"
)

with open('src/components/Blueprint2D.tsx', 'w') as f:
    f.write(content)

