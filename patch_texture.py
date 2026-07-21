import re

with open('src/components/Bracelet3D.tsx', 'r') as f:
    content = f.read()

coral_texture_logic = """  if (name.includes('Coral Jade')) {
    ctx.fillStyle = '#e5d3b3'; // light sandy base
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
          ctx.fillStyle = 'rgba(200, 100, 80, 0.5)';
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 60 + 20, 0, Math.PI * 2);
          ctx.filter = 'blur(25px)';
          ctx.fill();
       }
       ctx.filter = 'none';
       for (let i = 0; i < 5; i++) {
          ctx.fillStyle = 'rgba(220, 180, 60, 0.5)';
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 60 + 20, 0, Math.PI * 2);
          ctx.filter = 'blur(25px)';
          ctx.fill();
       }
       ctx.filter = 'none';
    }
  } else if (name === 'Lapis Lazuli') {"""

content = content.replace("  if (name === 'Lapis Lazuli') {", coral_texture_logic)

with open('src/components/Bracelet3D.tsx', 'w') as f:
    f.write(content)
