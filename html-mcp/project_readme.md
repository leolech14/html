# HTML MCP Server - Complete Package

This directory contains all files needed for the html-mcp server configuration.

## Directory Structure

```
html-mcp/
├── html_presentation_server.py    # Main MCP server script
├── requirements.txt               # Python dependencies
├── setup.sh                      # Setup script for easy installation
├── README.md                     # Original documentation
├── MCP_SETUP.md                  # MCP setup instructions
├── test_server.py                # Test script
├── venv/                         # Python virtual environment
├── src/                          # Source files
│   ├── templates/                # HTML templates
│   └── themes/                   # Theme files
├── views/                        # Generated views
│   └── generated/                # Output directory for HTML files
└── assets/                       # Static assets
    ├── css/                      # CSS files
    └── js/                       # JavaScript files
```

## Quick Setup

1. Run the setup script:
   ```bash
   ./setup.sh
   ```

2. Configure Claude Desktop by adding this to `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "html-mcp": {
         "command": "python",
         "args": ["/Users/lech/development_hub/PROJECT_html/html-mcp/html_presentation_server.py"]
       }
     }
   }
   ```

3. Restart Claude Desktop

## Features

- Create HTML presentations programmatically
- Multiple slide types (title, content, code, image, chart, mermaid)
- Three built-in themes (dark, light, pastel)
- Export to standalone HTML files
- User-editable generated HTML
- Live preview server

## Available Tools

- `create_presentation` - Create a new presentation
- `add_slide` - Add slides to a presentation
- `update_slide` - Update existing slides
- `list_presentations` - List all presentations
- `get_presentation` - Get presentation details
- `apply_theme` - Apply a theme
- `export_html` - Export to HTML file
- `preview_presentation` - Start preview server

## Testing

To test the server locally:
```bash
python test_server.py
```

## Generated HTML Location

All exported HTML files are saved to: `views/generated/`
