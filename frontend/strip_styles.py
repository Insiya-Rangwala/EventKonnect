import os
import re

TARGET_DIR = "c:/Users/Lenovo/.gemini/antigravity/playground/EventKonnect/frontend/src"

REPLACEMENTS = [
    # Backgrounds
    (r"background:\s*['\"]white['\"]", "background: 'var(--card)'"),
    (r"background:\s*['\"]#fff['\"]", "background: 'var(--card)'"),
    (r"background:\s*['\"]#ffffff['\"]", "background: 'var(--card)'"),
    (r"backgroundColor:\s*['\"]white['\"]", "backgroundColor: 'var(--card)'"),
    
    (r"background:\s*['\"]#f8f9fa['\"]", "background: 'var(--background)'"),
    (r"background:\s*['\"]#f9f9f9['\"]", "background: 'var(--background)'"),
    (r"background:\s*['\"]#f0f2f5['\"]", "background: 'var(--background)'"),
    (r"backgroundColor:\s*['\"]#f8f9fa['\"]", "backgroundColor: 'var(--background)'"),
    
    # Borders
    (r"border:\s*['\"]1px solid #e2e8f0['\"]", "border: '1px solid var(--border)'"),
    (r"border:\s*['\"]1px solid #eee['\"]", "border: '1px solid var(--border)'"),
    (r"border:\s*['\"]1px solid #e9ecef['\"]", "border: '1px solid var(--border)'"),
    (r"border:\s*['\"]1px dashed #ccc['\"]", "border: '1px dashed var(--border)'"),
    (r"borderBottom:\s*['\"]1px solid #eee['\"]", "borderBottom: '1px solid var(--border)'"),
    (r"borderTop:\s*['\"]1px solid #eee['\"]", "borderTop: '1px solid var(--border)'"),
    
    # Text Colors
    (r"color:\s*['\"]#888['\"]", "color: 'var(--text)'"),
    (r"color:\s*['\"]#666['\"]", "color: 'var(--text)'"),
    (r"color:\s*['\"]#555['\"]", "color: 'var(--text)'"),
    (r"color:\s*['\"]#2c3e50['\"]", "color: 'var(--dark)'"),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    modified = False
    
    for pattern, replacement in REPLACEMENTS:
        new_content, count = re.subn(pattern, replacement, content)
        if count > 0:
            content = new_content
            modified = True
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {os.path.basename(filepath)}")

def main():
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith(('.jsx', '.js')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
