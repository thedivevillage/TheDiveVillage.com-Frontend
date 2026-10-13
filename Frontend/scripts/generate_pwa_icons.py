import os
from PIL import Image

def generate_icons():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(base_dir, 'src', 'assets', 'footer logo.png')
    public_dir = os.path.join(base_dir, 'public')
    
    if not os.path.exists(logo_path):
        raise FileNotFoundError(f"Logo not found at {logo_path}")
        
    src_logo = Image.open(logo_path).convert('RGBA')
    
    # Create white version preserving alpha (matching footer's brightness-0 invert effect)
    r, g, b, a = src_logo.split()
    white_logo = Image.merge('RGBA', (
        Image.new('L', src_logo.size, 255),
        Image.new('L', src_logo.size, 255),
        Image.new('L', src_logo.size, 255),
        a
    ))
    
    # Brand background: Deep navy #001e3d matching theme_color and background_color
    bg_color = (0, 30, 61, 255)
    
    # Master 512x512 icon with pad=0.13 (strictly within W3C 80% circle safe zone for maskable icons)
    master_size = 512
    pad = 0.13
    max_w = int(master_size * (1 - 2 * pad))
    max_h = int(master_size * (1 - 2 * pad))
    scale = min(max_w / white_logo.width, max_h / white_logo.height)
    new_w = int(white_logo.width * scale)
    new_h = int(white_logo.height * scale)
    
    resized_logo = white_logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    master_canvas = Image.new('RGBA', (master_size, master_size), bg_color)
    x = (master_size - new_w) // 2
    y = (master_size - new_h) // 2
    master_canvas.paste(resized_logo, (x, y), resized_logo)
    
    targets = {
        'pwa-512x512.png': 512,
        'pwa-192x192.png': 192,
        'pwa-maskable-512x512.png': 512,
        'pwa-maskable-192x192.png': 192,
        'apple-touch-icon.png': 180,
    }
    
    for filename, size in targets.items():
        out_path = os.path.join(public_dir, filename)
        if size == master_size:
            icon = master_canvas
        else:
            icon = master_canvas.resize((size, size), Image.Resampling.LANCZOS)
        icon.save(out_path, format='PNG', optimize=True)
        print(f"Generated {filename} ({size}x{size})")

if __name__ == '__main__':
    generate_icons()
