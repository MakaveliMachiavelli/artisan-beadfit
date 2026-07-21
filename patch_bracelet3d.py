import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

# 1. Update createGemstoneTexture signature
content = content.replace(
    "function createGemstoneTexture(name: string, baseHex: string, secondaryHex?: string): THREE.Texture {",
    "function createGemstoneTexture(name: string, baseHex: string, secondaryHex?: string, index: number = 0): THREE.Texture {"
)

# 2. Update the procedural texture for Coral Jade
coral_jade_texture_logic = """  if (name.includes('Coral Jade')) {
    const coralPalette = [
      '#e5d3b3', // default sandy
      '#c5a5a5', // pinkish
      '#b5c3b5', // greenish
      '#d8c8a0', // yellowish
      '#b8a898', // greyish brown
      '#a0a0a0', // darker grey
      '#c8b8b8', // pale pinkish
      '#d0c8c0', // pale grey
    ];
    const baseColor = name.includes('Heart') ? '#d8c8a0' : coralPalette[index % coralPalette.length];
    
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add cloudy darker patches (brownish/greyish)
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(160, 136, 115, 0.4)' : 'rgba(214, 186, 162, 0.6)';
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 80 + 30, 0, Math.PI * 2);
      ctx.filter = 'blur(20px)';
      ctx.fill();
    }
    ctx.filter = 'none';

    // Add coral fossil cell-like patterns
    ctx.strokeStyle = 'rgba(140, 120, 100, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 512;
      const r = Math.random() * 15 + 5;
      ctx.beginPath();
      for(let a=0; a<Math.PI*2; a+=0.5) {
         const rr = r + (Math.random()*4-2);
         ctx.lineTo(cx + Math.cos(a)*rr, cy + Math.sin(a)*rr);
      }
      ctx.closePath();
      ctx.stroke();
    }
    
    // Some red/orange spots like the heart bead
    if (name.includes('Heart')) {
       for (let i = 0; i < 8; i++) {
          ctx.fillStyle = 'rgba(200, 100, 80, 0.6)'; // red spot
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 80 + 30, 0, Math.PI * 2);
          ctx.filter = 'blur(30px)';
          ctx.fill();
       }
       ctx.filter = 'none';
       for (let i = 0; i < 5; i++) {
          ctx.fillStyle = 'rgba(220, 180, 60, 0.5)'; // yellow spot
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 80 + 30, 0, Math.PI * 2);
          ctx.filter = 'blur(30px)';
          ctx.fill();
       }
       ctx.filter = 'none';
    }
  } else if (name === 'Lapis Lazuli') {"""

content = re.sub(
    r"  if \(name\.includes\('Coral Jade'\)\) \{.*?  \} else if \(name === 'Lapis Lazuli'\) \{",
    coral_jade_texture_logic,
    content,
    flags=re.DOTALL
)

# 3. Pass idx to createGemstoneTexture
content = content.replace(
    "const proceduralTex = createGemstoneTexture(b.name, color1, color2);",
    "const proceduralTex = createGemstoneTexture(b.name, color1, color2, idx);"
)

# 4. Fix Geometry rotations
geometry_logic = """        if (b.name.includes('Cube')) {
          const s = b.size * 0.08; // slightly smaller than sphere diam to look right
          geometry = new RoundedBoxGeometry(s, s, s, 4, s * 0.25);
          
          const tangentAngle = angle + Math.PI / 2;
          geometry.rotateY(-tangentAngle);
          geometry.rotateX(Math.random() * 0.3 - 0.15); // Add jitter to match organic look
          geometry.rotateZ(Math.random() * 0.3 - 0.15);
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

          const extrudeSettings = { depth: 1.5, bevelEnabled: true, bevelSegments: 16, steps: 2, bevelSize: 2.5, bevelThickness: 2.5 };
          geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
          
          // Center and scale
          geometry.center();
          const s = (b.size * 0.05) / 13;
          geometry.scale(s, s, s);
          
          const tangentAngle = angle + Math.PI / 2;
          // Z points UP, Y points INTO circle.
          geometry.rotateX(-Math.PI / 2);
          geometry.rotateY(-tangentAngle + Math.PI); // Adjust orientation so string goes thru and points outwards
        } else if (b.name.includes('Spacer')) {
          geometry = new THREE.SphereGeometry(b.size * 0.05, segments, segments);
        } else {
          // High-fidelity gemstone sphere
          geometry = new THREE.SphereGeometry(b.size * 0.05, segments, segments);
        }
      }"""

content = re.sub(
    r"        if \(b\.name\.includes\('Cube'\)\) \{.*?        \} else \{\n          // High-fidelity gemstone sphere\n          geometry = new THREE\.SphereGeometry\(b\.size \* 0\.05, segments, segments\);\n        \}\n      \}",
    geometry_logic,
    content,
    flags=re.DOTALL
)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
