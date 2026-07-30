import os
import sys
import glob
from pathlib import Path
from PIL import Image, ImageEnhance
import rembg
import argparse

def process_images(input_dir, output_dir):
    # Ensure output directory exists
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Get all jpg/png files in the input directory
    image_paths = glob.glob(os.path.join(input_dir, "*.jpg")) + glob.glob(os.path.join(input_dir, "*.png"))
    
    if not image_paths:
        print(f"No images found in {input_dir}")
        return

    print(f"Found {len(image_paths)} images. Processing...")

    for i, path in enumerate(sorted(image_paths)):
        try:
            print(f"Processing {os.path.basename(path)}...")
            
            # 1. Load image
            img = Image.open(path)
            
            # 2. Remove background using AI (rembg)
            # This returns an image with a transparent background
            subject = rembg.remove(img)
            
            # 3. Create a pure white background
            white_bg = Image.new("RGBA", subject.size, "WHITE")
            
            # 4. Paste the subject onto the white background using the alpha channel as mask
            white_bg.paste(subject, (0, 0), subject)
            
            # Convert to RGB (jpeg doesn't support transparency)
            final_img = white_bg.convert("RGB")
            
            # 5. Optional Enhancement (Boost Contrast slightly for jewelry)
            enhancer = ImageEnhance.Contrast(final_img)
            final_img = enhancer.enhance(1.1) 
            
            # 6. Save with standard naming: frame-01.jpg, frame-02.jpg
            out_name = f"frame-{str(i+1).zfill(2)}.jpg"
            out_path = os.path.join(output_dir, out_name)
            
            final_img.save(out_path, "JPEG", quality=95)
            print(f"  -> Saved {out_name}")
            
        except Exception as e:
            print(f"Error processing {path}: {e}")

    print("All done!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automated Jewelry Background Remover")
    parser.add_argument("--input", default="input_photos", help="Folder containing raw photos")
    parser.add_argument("--output", default="output_photos", help="Folder for edited photos")
    
    args = parser.parse_args()
    process_images(args.input, args.output)
