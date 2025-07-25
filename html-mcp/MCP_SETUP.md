# HTML-MCP Server Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install the MCP Server
```bash
./setup_mcp_server.sh
```

This script will:
- Create a Python virtual environment
- Install MCP dependencies
- Test the installation
- Generate Claude configuration

### Step 2: Configure Claude
```bash
./configure_claude.sh
```

This will:
- Add HTML-MCP to your Claude configuration
- Backup existing settings
- Show you the next steps

### Step 3: Restart Claude
Restart Claude Code to load the new MCP server.

### Step 4: Test It!
In Claude, try:
```
Create a presentation about machine learning with 3 slides
```

## 🧪 Testing Without Claude

Test the MCP server locally:
```bash
cd mcp-server
source venv/bin/activate
cd ..
python test_mcp_locally.py
```

This creates a test presentation and exports it to `test_presentation.html`.

## 📋 Available MCP Tools

Once configured, you'll have access to these tools in Claude:

- `mcp__html_presentation__create_presentation` - Create new presentation
- `mcp__html_presentation__add_slide` - Add slides
- `mcp__html_presentation__update_slide` - Edit existing slides
- `mcp__html_presentation__list_presentations` - See all presentations
- `mcp__html_presentation__get_presentation` - Get presentation details
- `mcp__html_presentation__apply_theme` - Change themes
- `mcp__html_presentation__export_html` - Export to HTML file
- `mcp__html_presentation__preview_presentation` - Start preview server

## 🎨 Themes

- **dark** (default) - High contrast dark theme
- **light** - Clean bright theme
- **pastel** - Soft colors theme

## 🛠️ Troubleshooting

### MCP tools not showing in Claude?
1. Check configuration: `cat ~/.claude-code/settings.json`
2. Restart Claude Code completely
3. Check logs: `cat mcp-server/mcp_server.log`

### Python errors?
```bash
cd mcp-server
source venv/bin/activate
pip install --upgrade mcp fastmcp
```

### Test server directly:
```bash
cd mcp-server
source venv/bin/activate
python html_presentation_server.py --help
```

## 📁 File Structure

```
html-repo/
├── mcp-server/
│   ├── html_presentation_server.py  # The MCP server
│   ├── requirements.txt             # Python dependencies
│   ├── venv/                        # Virtual environment
│   └── claude_config.json           # Generated config
├── setup_mcp_server.sh              # Setup script
├── configure_claude.sh              # Configuration helper
├── test_mcp_locally.py              # Local test script
└── MCP_SETUP.md                     # This file
```

## 🔧 Manual Configuration

If automatic configuration doesn't work, manually edit `~/.claude-code/settings.json`:

```json
{
  "mcpServers": {
    "html-presentation": {
      "command": "/path/to/html-repo/mcp-server/venv/bin/python",
      "args": ["/path/to/html-repo/mcp-server/html_presentation_server.py"],
      "env": {}
    }
  }
}
```

## 🎯 Example Usage in Claude

```
User: Create a presentation about Python

Claude: I'll create a presentation about Python for you.

[Uses mcp__html_presentation__create_presentation]
[Uses mcp__html_presentation__add_slide multiple times]
[Uses mcp__html_presentation__export_html]

Your presentation has been created and exported to python_presentation.html!
```

## 📝 Notes

- Presentations are stored in memory (restart = data loss)
- Each Claude session has its own presentations
- Exported HTML files are self-contained
- Dark theme is the default

Ready to create amazing presentations with AI! 🎉