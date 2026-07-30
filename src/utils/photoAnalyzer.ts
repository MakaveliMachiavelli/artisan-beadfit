export interface ExtractedColor {
  hex: string;
  secondaryHex: string;
  shape?: string;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; 
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function toHex(r: number, g: number, b: number): string {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

/**
 * Analyzes an uploaded photo of a bracelet and extracts the dominant colors
 * for a specific number of beads around a circular ring.
 */
export async function extractBeadsFromPhoto(file: File, beadCount: number): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context not supported'));

      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;

      const WORK_SIZE = 512;
      canvas.width = WORK_SIZE;
      canvas.height = WORK_SIZE;
      
      ctx.drawImage(img, startX, startY, size, size, 0, 0, WORK_SIZE, WORK_SIZE);

      const R = WORK_SIZE * 0.38;
      const cx = WORK_SIZE / 2;
      const cy = WORK_SIZE / 2;
      
      const extractedColors: ExtractedColor[] = [];
      const sampleSize = 24; // Larger sample area to capture more of the bead

      const imageData = ctx.getImageData(0, 0, WORK_SIZE, WORK_SIZE).data;

      for (let i = 0; i < beadCount; i++) {
        const angle = (i * (Math.PI * 2) / beadCount) - (Math.PI / 2);
        
        const px = cx + R * Math.cos(angle);
        const py = cy + R * Math.sin(angle);
        
        let validPixels: {h: number, s: number, l: number}[] = [];

        const halfSample = Math.floor(sampleSize / 2);
        for (let dy = -halfSample; dy <= halfSample; dy++) {
          for (let dx = -halfSample; dx <= halfSample; dx++) {
            const sx = Math.floor(px + dx);
            const sy = Math.floor(py + dy);
            
            if (sx >= 0 && sx < WORK_SIZE && sy >= 0 && sy < WORK_SIZE) {
              const idx = (sy * WORK_SIZE + sx) * 4;
              const r = imageData[idx];
              const g = imageData[idx + 1];
              const b = imageData[idx + 2];
              
              const [h, s, l] = rgbToHsl(r, g, b);
              
              // Filter out extremely dark (shadows) and extremely light (glare)
              if (l > 0.15 && l < 0.85 && s > 0.1) {
                validPixels.push({h, s, l});
              }
            }
          }
        }
        
        if (validPixels.length > 0) {
          // Average the valid HSL values
          let hSum = 0, sSum = 0, lSum = 0;
          
          // To average hue properly, we use vector addition
          let x = 0, y = 0;
          validPixels.forEach(p => {
            x += Math.cos(p.h * Math.PI * 2);
            y += Math.sin(p.h * Math.PI * 2);
            sSum += p.s;
            lSum += p.l;
          });
          
          let avgH = Math.atan2(y, x) / (Math.PI * 2);
          if (avgH < 0) avgH += 1;
          
          let avgS = sSum / validPixels.length;
          let avgL = lSum / validPixels.length;
          
          // Boost saturation and adjust lightness for a richer "gemstone" look
          const boostedS = Math.min(1.0, avgS * 1.3); // 30% saturation boost
          const optimizedL = Math.max(0.3, Math.min(0.6, avgL)); // keep it deep and rich
          
          // Secondary color is slightly darker and even more saturated for depth
          const depthL = Math.max(0.1, optimizedL - 0.2);
          const depthS = Math.min(1.0, boostedS * 1.1);

          const [r1, g1, b1] = hslToRgb(avgH, boostedS, optimizedL);
          const [r2, g2, b2] = hslToRgb(avgH, depthS, depthL);
          
          extractedColors.push({
            hex: toHex(r1, g1, b1),
            secondaryHex: toHex(r2, g2, b2)
          });
        } else {
          // Fallback if the whole box was somehow pure white or black
          extractedColors.push({hex: "#cccccc", secondaryHex: "#888888"});
        }
      }

      resolve(extractedColors);
    };

    img.onerror = (err) => reject(err);
    img.src = url;
  });
}
