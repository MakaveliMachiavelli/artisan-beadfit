import React, { useState, useRef } from 'react';
import { UploadCloud, Sparkles, X, Camera } from 'lucide-react';
import { extractBeadsFromPhoto, ExtractedColor } from '../utils/photoAnalyzer';
import { Bracelet3D } from './Bracelet3D';
import { Button } from './ui';

export function PhotoScannerHero({ onSaveSuccess }: { onSaveSuccess?: () => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for saving
  const [name, setName] = useState('');
  const [price, setPrice] = useState('1500');
  const [shape, setShape] = useState('Round');
  const [isSaving, setIsSaving] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    setIsProcessing(true);
    setExtractedColors(null);

    try {
      // Simulate a bit of processing time so the user can enjoy the laser animation!
      await new Promise(r => setTimeout(r, 1500));
      
      const colors = await extractBeadsFromPhoto(file, 22);
      setExtractedColors(colors);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze photo. Please try another one.");
      setPreviewImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const reset = () => {
    setPreviewImage(null);
    setExtractedColors(null);
    setIsProcessing(false);
    setName('');
    setPrice('1500');
    setShape('Round');
  };

  const saveToDatabase = async () => {
    if (!name.trim()) return alert("Please enter a name for the bracelet");
    
    setIsSaving(true);
    
    // Inject the selected shape into the extracted colors
    const colorsWithShape = extractedColors?.map(c => ({...c, shape}));

    try {
      const res = await fetch('/api/shop/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price,
          stockQty: 10,
          composition: colorsWithShape,
        })
      });

      if (res.ok) {
        alert('Successfully saved to live collection!');
        if (onSaveSuccess) onSaveSuccess();
        reset();
      } else {
        alert('Failed to save to database.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate 3D bead data if extraction is complete
  const beads = extractedColors ? extractedColors.map((color, i) => ({
    id: `photo-bead-${i}`,
    itemId: 'custom-photo-bead',
    type: 'stone' as const,
    name: 'Custom Extracted Bead',
    quality: 'AAA' as const,
    size: 8,
    lengthMm: 8,
    hex: color.hex,
    secondaryHex: color.secondaryHex,
    shape: shape,
  })) : [];

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-line)] relative my-12 transition-all duration-700 ease-in-out">
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-obsidian-50)] to-white opacity-50 pointer-events-none" />

      <div className="relative p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Side: Text and CTA */}
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-obsidian-100)] text-[var(--color-obsidian-700)] text-sm font-semibold mb-6">
            <Sparkles size={16} />
            <span>AI-Powered Photo to 3D</span>
          </div>
          <h2 className="font-serif text-5xl font-semibold tracking-tight text-[var(--color-obsidian-900)] mb-4">
            Digitize your bracelets.
          </h2>
          <p className="text-lg text-[var(--color-obsidian-600)] mb-8">
            Upload a photo of any gemstone bracelet. Our smart scanner will mathematically extract the exact bead colors and generate a 3D replica for your live shop.
          </p>

          {extractedColors && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Save to Collection</h3>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Bracelet Name (e.g. Colorful Tourmaline)" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 w-full"
                />
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    placeholder="Price (₱)" 
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 w-1/2"
                  />
                  <select 
                    value={shape}
                    onChange={e => setShape(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 w-1/2 bg-white"
                  >
                    <option value="Round">Round (Sphere)</option>
                    <option value="Faceted">Faceted</option>
                    <option value="Cube">Cube</option>
                    <option value="Cylinder">Cylinder</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="md" onClick={saveToDatabase} variant="primary" className="flex-1" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Publish to Shop'}
                  </Button>
                  <Button size="md" onClick={reset} variant="secondary">
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Area */}
        <div className="flex-1 w-full max-w-md relative z-10">
          
          {/* State 1: Upload / Drag & Drop */}
          {!previewImage && !extractedColors && (
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300
                ${dragActive ? 'border-[var(--color-obsidian-900)] bg-[var(--color-obsidian-50)]' : 'border-[var(--color-obsidian-200)] hover:border-[var(--color-obsidian-400)] hover:bg-gray-50'}
              `}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleChange}
                className="hidden"
              />
              <UploadCloud className="w-12 h-12 text-[var(--color-obsidian-400)] mb-4" />
              <h3 className="font-semibold text-lg text-[var(--color-obsidian-900)] mb-1">Drag and drop your photo</h3>
              <p className="text-sm text-[var(--color-obsidian-500)]">or click to browse from your device</p>
            </div>
          )}

          {/* State 2: Processing / Scanning Animation */}
          {previewImage && isProcessing && (
            <div className="aspect-square w-full rounded-2xl overflow-hidden relative shadow-inner border border-gray-200 bg-black">
              <img src={previewImage} alt="Scanning" className="w-full h-full object-cover opacity-60" />
              
              {/* Laser Line Animation (Defined in index.css) */}
              <div className="absolute left-0 right-0 h-1 bg-[#00ff88] shadow-[0_0_15px_#00ff88] animate-scan" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/80 text-[#00ff88] px-6 py-3 rounded-full font-mono text-sm tracking-widest font-semibold uppercase flex items-center gap-3 backdrop-blur-md">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-ping" />
                  Extracting Colors...
                </div>
              </div>
            </div>
          )}

          {/* State 3: 3D Result */}
          {extractedColors && !isProcessing && (
            <div className="aspect-square w-full rounded-2xl bg-white shadow-lg border border-[var(--color-line)] relative overflow-hidden animate-[fade-in_0.5s_ease-out]">
              <div className="absolute top-4 left-4 z-20 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles size={12} />
                Match Found
              </div>
              <button 
                onClick={reset}
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-gray-500 hover:text-gray-900"
              >
                <X size={16} />
              </button>
              
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 pointer-events-none z-10" />
              
              <Bracelet3D 
                beads={beads}
                activeCharm={null}
                selectedBeadIndex={null}
                setSelectedBeadIndex={() => {}}
                blueprintRadius={25}
                wristMm={165}
                ease={10}
                presentationMode={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
