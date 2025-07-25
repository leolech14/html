#!/bin/bash

# Setup Git for PROJECT_html

echo "Initializing Git repository for PROJECT_html..."

# Initialize git
git init

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
cat > .gitignore << 'EOF'
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python (for html-mcp)
__pycache__/
*.py[cod]
*$py.class
venv/
*.egg-info/

# macOS
.DS_Store

# Project specific
views/generated/*.html
data/processed/
html-mcp/views/generated/

# IDE
.vscode/
.idea/

# Environment
.env
EOF
fi

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Universal HTML generation framework

- Component-based HTML generation system
- Theme engine with CSS variables
- MCP server integration (html-mcp)
- Universal data ingestion pipeline (planned)
- Chart.js and Mermaid.js visualizations
- Agent OS integration for structured development
- Designed for AI agents to create beautiful presentations"

echo "Git repository initialized!"
echo ""
echo "To push to GitHub:"
echo "1. Create a new repo on GitHub (suggested name: 'html-generator' or 'universal-html')"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"