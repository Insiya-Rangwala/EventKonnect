from PIL import Image, ImageDraw

def remove_exterior_white(img_path):
    img = Image.open(img_path).convert("RGBA")
    
    rgb_img = img.convert("RGB")
    
    w, h = img.size
    # Floodfill the 4 corners with magenta
    ImageDraw.floodfill(rgb_img, (0, 0), (255, 0, 255), thresh=40)
    ImageDraw.floodfill(rgb_img, (w-1, 0), (255, 0, 255), thresh=40)
    ImageDraw.floodfill(rgb_img, (0, h-1), (255, 0, 255), thresh=40)
    ImageDraw.floodfill(rgb_img, (w-1, h-1), (255, 0, 255), thresh=40)
    
    pixels = img.load()
    rgb_pixels = rgb_img.load()
    
    for x in range(w):
        for y in range(h):
            # If the pixel was reached by the exterior floodfill
            if rgb_pixels[x, y] == (255, 0, 255):
                pixels[x, y] = (0, 0, 0, 0) # Make transparent
            else:
                # Anti-aliasing for the edges where the floodfill met the purple
                # If it's pure white but wasn't floodfilled, it's inside the logo (keep it)
                pass
                
    img.save(img_path)

remove_exterior_white(r"c:\Users\Lenovo\.gemini\antigravity\playground\EventKonnect\frontend\public\logo.png")
print("Proper exterior background removal complete!")
