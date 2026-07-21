import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

# Make sure we add RoundedBoxGeometry import if needed
if 'RoundedBoxGeometry' not in content:
    content = content.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';")

geometry_logic = """      } else if (b.type === 'stone') {
        if (b.name.includes('Cube')) {
          const s = b.size * 0.08; // slightly smaller than sphere diam to look right
          geometry = new RoundedBoxGeometry(s, s, s, 4, s * 0.2);
          
          const tangentAngle = angle + Math.PI / 2;
          geometry.rotateY(-tangentAngle);
          geometry.rotateZ(Math.random() * 0.1 - 0.05);
        } else if (b.name.includes('Heart')) {
          const x = 0, y = 0;
          const heartShape = new THREE.Shape();
          heartShape.moveTo( x + 5, y + 5 );
          heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
          heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
          heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
          heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
          heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
          heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

          const extrudeSettings = { depth: 4, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 1, bevelThickness: 1 };
          geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
          
          // Center and scale
          geometry.center();
          const s = (b.size * 0.05) / 10;
          geometry.scale(s, s, s);
          
          const tangentAngle = angle + Math.PI / 2;
          geometry.rotateY(-tangentAngle);
          geometry.rotateX(Math.PI / 2); // Face outward
          geometry.rotateZ(Math.PI);
        } else {
          // High-fidelity gemstone sphere
          geometry = new THREE.SphereGeometry(b.size * 0.05, segments, segments);
        }
      }"""

content = re.sub(r"      \} else if \(b\.type === 'stone'\) \{\n        // High-fidelity gemstone sphere\n        geometry = new THREE\.SphereGeometry\(b\.size \* 0\.05, segments, segments\);\n      \}", geometry_logic, content)

thickness_logic = """      let thickness = b.type === 'stone' ? b.size * 0.1 : b.size * 0.03;
      if (b.type === 'stone' && b.name.includes('Heart')) {
          thickness = b.size * 0.11;
      } else if (b.type === 'stone' && b.name.includes('Cube')) {
          thickness = b.size * 0.085;
      }"""
content = re.sub(r"      let thickness = b\.type === 'stone' \? b\.size \* 0\.1 : b\.size \* 0\.03;", thickness_logic, content)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
