#!/bin/bash
# HTML-MCP Server Setup Script
# This script sets up the HTML Presentation MCP server for Claude

set -e  # Exit on error

echo "🚀 HTML-MCP Server Setup"
echo "========================"

# Check if we're in the right directory
if [ ! -f "mcp-server/html_presentation_server.py" ]; then
    echo "❌ Error: Please run this script from the html-repo root directory"
    exit 1
fi

# Step 1: Create virtual environment
echo ""
echo "📦 Step 1: Setting up Python virtual environment..."
cd mcp-server

if [ -d "venv" ]; then
    echo "Virtual environment already exists, skipping creation..."
else
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Step 2: Activate and install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install mcp fastmcp

echo "✅ Dependencies installed"

# Step 3: Make server executable
chmod +x html_presentation_server.py
echo "✅ Server marked as executable"

# Step 4: Create test script
echo ""
echo "🧪 Step 3: Creating test script..."
cat > test_server.py << 'EOF'
#!/usr/bin/env python3
"""Test script to verify MCP server works"""
import sys
import json

try:
    from mcp.server.fastmcp import FastMCP
    print("✅ MCP modules imported successfully")
    
    # Test creating a simple server
    mcp = FastMCP("test-server")
    print("✅ FastMCP server instance created")
    
    print("\n🎉 All tests passed! MCP server is ready to use.")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure you've activated the virtual environment")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
EOF

chmod +x test_server.py

# Step 5: Run test
echo ""
echo "🧪 Step 4: Testing MCP server setup..."
python test_server.py

# Step 6: Generate Claude configuration
echo ""
echo "📝 Step 5: Generating Claude configuration..."

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/mcp-server/html_presentation_server.py"
PYTHON_PATH="$(cd "$(dirname "$0")" && pwd)/mcp-server/venv/bin/python"

cat > claude_config.json << EOF
{
  "html-presentation": {
    "command": "$PYTHON_PATH",
    "args": ["$SCRIPT_PATH"],
    "env": {}
  }
}
EOF

echo "✅ Configuration generated in claude_config.json"

# Step 7: Show instructions
echo ""
echo "🎯 Final Step: Add to Claude Configuration"
echo "=========================================="
echo ""
echo "Option 1: Automatic (recommended)"
echo "  Run: ./configure_claude.sh"
echo ""
echo "Option 2: Manual"
echo "  1. Open ~/.claude-code/settings.json"
echo "  2. Add the following to the 'mcpServers' section:"
echo ""
cat claude_config.json | sed 's/^/     /'
echo ""
echo "  3. Restart Claude Code"
echo ""
echo "📌 Note: After configuration, restart Claude to load the MCP server."
echo ""
echo "✅ Setup complete! Next step: ./configure_claude.sh"

# Deactivate virtual environment
deactivate