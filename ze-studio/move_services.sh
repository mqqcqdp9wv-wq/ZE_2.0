#!/bin/bash

# 1. Delete lines 188-214 (services section)
sed -i '188,214d' index.html

# 2. Insert services block after line 133
sed -i '133 r services_block.txt' index.html

echo "Services section moved after 'about' section"
