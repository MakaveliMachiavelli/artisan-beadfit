import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

pattern = r"function createGemstoneTexture.*?return texture;\n}"
new_func = """function createGemstoneTexture(name: string, baseHex: string, secondaryHex?: string, index: number = 0): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Draw background gradient
  const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
  grad.addColorStop(0, secondaryHex || '#ffffff');
  grad.addColorStop(0.7, baseHex);
  grad.addColorStop(1, '#000000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}"""

content = re.sub(pattern, new_func, content, flags=re.DOTALL)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
