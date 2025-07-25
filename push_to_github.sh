#!/bin/bash

echo "Pushing PROJECT_html to GitHub..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Check git status
echo "Current git status:"
git status

# Add all changes
git add -A

# Commit with detailed message
git commit -m "Update with universal HTML generation vision

- Updated Agent OS documentation for new architecture
- Transformed mission to universal data-to-HTML system
- Added html-mcp MCP server integration
- Updated roadmap with data ingestion phases
- Added decision for universal ingestion architecture
- Integrated vector store support planning
- Maintained compatibility with existing RULES.md"

# Set remote if needed
git remote set-url origin https://github.com/lech/html.git 2>/dev/null || \
git remote add origin https://github.com/lech/html.git

# Push to main
git branch -M main
git push -u origin main

echo ""
echo "✅ PROJECT_html pushed to https://github.com/lech/html"