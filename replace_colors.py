import os
import re

color_map = {
    re.compile(r'#000000(?![\w])', re.IGNORECASE): 'var(--bg-primary)',
    re.compile(r'#000(?![\w])', re.IGNORECASE): 'var(--bg-primary)',
    re.compile(r'#ffffff(?![\w])', re.IGNORECASE): 'var(--text-primary)',
    re.compile(r'#fff(?![\w])', re.IGNORECASE): 'var(--text-primary)',
    re.compile(r'#64ffda(?![\w])', re.IGNORECASE): 'var(--accent-primary)',
    re.compile(r'#4ecdc4(?![\w])', re.IGNORECASE): 'var(--accent-secondary)',
    re.compile(r'#a0a0a0(?![\w])', re.IGNORECASE): 'var(--text-secondary)',
    re.compile(r'#808080(?![\w])', re.IGNORECASE): 'var(--text-secondary)'
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
            # Avoid modifying index.css definitions directly if it messes up variables
            if file == 'index.css':
                continue
            process_file(os.path.join(root, file))
print("Done")
