import os
import re

TARGET_FILE = "c:/Users/Lenovo/.gemini/antigravity/playground/EventKonnect/frontend/src/utils.css"

REPLACEMENTS = [
    # Backgrounds
    (r"background:\s*white;?", "background: var(--card);"),
    (r"background-color:\s*white;?", "background-color: var(--card);"),
    (r"background:\s*#fff;?", "background: var(--card);"),
    (r"background-color:\s*#fff;?", "background-color: var(--card);"),
    (r"background:\s*#ffffff;?", "background: var(--card);"),

    (r"background:\s*#f8f9fa;?", "background: var(--background);"),
    (r"background-color:\s*#f8f9fa;?", "background-color: var(--background);"),
    (r"background:\s*#f9f9f9;?", "background: var(--background);"),
    (r"background-color:\s*#f9f9f9;?", "background-color: var(--background);"),
    (r"background:\s*#f0f2f5;?", "background: var(--background);"),

    # Borders
    (r"border:\s*1px solid #e2e8f0;?", "border: 1px solid var(--border);"),
    (r"border:\s*1px solid #eee;?", "border: 1px solid var(--border);"),
    (r"border:\s*1px solid #e9ecef;?", "border: 1px solid var(--border);"),
    (r"border:\s*1px dashed #ccc;?", "border: 1px dashed var(--border);"),
    (r"border-bottom:\s*1px solid #eee;?", "border-bottom: 1px solid var(--border);"),
    (r"border-top:\s*1px solid #eee;?", "border-top: 1px solid var(--border);"),

    # Text Colors
    (r"color:\s*#888;?", "color: var(--text);"),
    (r"color:\s*#666;?", "color: var(--text);"),
    (r"color:\s*#555;?", "color: var(--text);"),
    (r"color:\s*#2c3e50;?", "color: var(--dark);"),
]

def process_file():
    with open(TARGET_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    for pattern, replacement in REPLACEMENTS:
        new_content, count = re.subn(pattern, replacement, content)
        if count > 0:
            content = new_content
            modified = True
            print(f"Replaced {count} instances of {pattern}")

    if modified:
        with open(TARGET_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated style.css")

if __name__ == "__main__":
    process_file()
