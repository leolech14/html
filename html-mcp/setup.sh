#!/bin/bash

# Setup script for html-mcp server

echo "Setting up html-mcp server..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if virtual environment exists
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$SCRIPT_DIR/venv"
fi

# Activate virtual environment
source "$SCRIPT_DIR/venv/bin/activate"

# Install requirements
echo "Installing requirements..."
pip install -r "$SCRIPT_DIR/requirements.txt"

# Create necessary directories if they don't exist
echo "Creating necessary directories..."
mkdir -p "$SCRIPT_DIR/src/templates"
mkdir -p "$SCRIPT_DIR/src/themes"
mkdir -p "$SCRIPT_DIR/views/generated"
mkdir -p "$SCRIPT_DIR/assets"

echo ""
echo "Setup complete!"
echo ""
echo "To configure Claude Desktop to use this MCP server:"
echo "1. Open Claude Desktop configuration file:"
echo "   ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "2. Add the following to the mcpServers section:"
echo '
{
  "mcpServers": {
    "html-mcp": {
      "command": "python",
      "args": ["'$SCRIPT_DIR'/html_presentation_server.py"]
    }
  }
}
'
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "To test the server locally:"
echo "   python $SCRIPT_DIR/test_server.py"
