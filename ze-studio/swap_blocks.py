#!/usr/bin/env python3

# Read file
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract blocks (line numbers are 1-based, but list is 0-based)
# News: lines 220-258 (indices 219-257, inclusive)
news_block = lines[219:258]  # 258 is exclusive, so gets lines 219-257

# Projects: lines 263-554 (indices 262-553, inclusive)  
# But we need to account for the gap between blocks (lines 259-262)
gap_lines = lines[258:262]  # lines 259-262

projects_block = lines[262:554]  # Gets lines 262-553

# Lines before news (0-218)
before_news = lines[0:219]

# Lines after projects (554+)
after_projects = lines[554:]

# Reconstruct: before + projects + gap + news + after
new_content = before_news + projects_block + ['\n'] + news_block + ['\n'] + after_projects

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print("SUCCESS: Swapped news and projects sections")
print(f"News block: {len(news_block)} lines")
print(f"Projects block: {len(projects_block)} lines")
