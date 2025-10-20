#!/usr/bin/env python3
import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the RAYNO films section (line 260-551)
# Pattern to match from "<!-- БЛОК Витрина плёнок RAYNO -->" to its closing </section>
films_pattern = r'(    <!-- БЛОК Витрина плёнок RAYNO -->.*?    </section>)\n'
films_match = re.search(films_pattern, content, re.DOTALL)

if not films_match:
    print("ERROR: Could not find RAYNO films section")
    exit(1)

films_section = films_match.group(1) + '\n'
print(f"Found films section, length: {len(films_section)} chars")

# Remove the films section from its current position
content_without_films = content[:films_match.start()] + content[films_match.end():]

# Find where to insert it (after RAYNO MONOCARBON section closing, before Services)
# Look for the closing of rayno section followed by Services
insert_pattern = r'(    </section>\n      </div>\n    </section>\n\n)(    <!-- Services / Specialization -->)'
insert_match = re.search(insert_pattern, content_without_films)

if not insert_match:
    print("ERROR: Could not find insertion point")
    exit(1)

# Insert the films section
new_content = (content_without_films[:insert_match.end(1)] + 
               '\n' + films_section + '\n' +
               content_without_films[insert_match.start(2):])

# Write the result
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("SUCCESS: Reordered sections")
print("Films section moved after RAYNO MONOCARBON, before Services")
