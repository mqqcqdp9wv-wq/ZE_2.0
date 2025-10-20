#!/usr/bin/env python3
import re

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the Services section (lines 482-508)
services_pattern = r'(    <!-- Services / Specialization -->.*?    </section>\n)'
services_match = re.search(services_pattern, content, re.DOTALL)

if not services_match:
    print("ERROR: Could not find Services section")
    exit(1)

services_section = services_match.group(1)
print(f"Found services section, length: {len(services_section)} chars")

# Remove the services section from its current position
content_without_services = content[:services_match.start()] + content[services_match.end():]

# Find where to insert it (after "about" section, before RAYNO)
# Look for the closing of about section followed by RAYNO
insert_pattern = r'(        </section>\n     <!-- RAYNO -->)'
insert_match = re.search(insert_pattern, content_without_services)

if not insert_match:
    print("ERROR: Could not find insertion point")
    exit(1)

# Insert the services section
new_content = (content_without_services[:insert_match.start()] + 
               '        </section>\n' +
               '\n' + services_section + '\n' +
               '     <!-- RAYNO -->')

# Write the result
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("SUCCESS: Reordered sections")
print("Services section moved after 'Просто доверьтесь мне', before RAYNO")
