#!/bin/bash

# Create backup
cp index.html index.html.backup-swap

# Step 1: Delete both sections (delete projects first as it's after news)
# Delete projects (lines 263-554)
sed -i '263,554d' index.html

# Now delete news (lines 220-258, but we need to account for deleted lines)
# After deleting 292 lines (263-554), news is still at 220-258
sed -i '220,258d' index.html

# Step 2: Insert projects where news was (after line 219)
# We need to add blank line before
sed -i '219 a\
' index.html

sed -i '220 r projects_block.txt' index.html

# Step 3: Calculate where to insert news
# After line 219 + 292 lines of projects + 1 blank = line 512
# But sed counts from current state, so we need to insert after projects end
# Let's find the line number after projects

# Insert blank line after projects
LINE_AFTER_PROJECTS=$((220 + 292))
sed -i "${LINE_AFTER_PROJECTS} a\
" index.html

# Insert news after that
LINE_FOR_NEWS=$((LINE_AFTER_PROJECTS + 1))
sed -i "${LINE_FOR_NEWS} r news_block.txt" index.html

echo "Sections swapped successfully"
