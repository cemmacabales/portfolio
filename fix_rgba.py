import os
import re

color_map = {
    re.compile(r'rgba\(255,\s*255,\s*255,\s*0\.05\)', re.IGNORECASE): 'var(--bg-tertiary)',
    re.compile(r'rgba\(255,\s*255,\s*255,\s*0\.1\)', re.IGNORECASE): 'var(--border-color)',
    re.compile(r'rgba\(100,\s*255,\s*218,\s*0\.1\)', re.IGNORECASE): 'var(--accent-hover)',
    re.compile(r'rgba\(100,\s*255,\s*218,\s*0\.3\)', re.IGNORECASE): 'var(--shadow-color)'
}

def process_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        original = content
        for pattern, replacement in color_map.items():
            content = pattern.sub(replacement, content)
            
        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

src_dir = 'src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.css') or file.endswith('.jsx'):
            if file == 'index.css': continue
            process_file(os.path.join(root, file))
print("Done")
