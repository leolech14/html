# HTML Presentation MCP Server

An MCP (Model Context Protocol) server that enables AI agents to create, edit, and manage HTML presentations with consistent styling and user-editable content.

## Features

- **Create Presentations**: Generate new presentations with titles, descriptions, and themes
- **Slide Management**: Add, update, and organize slides with different content types
- **Theme System**: Apply pre-built themes (default, dark, pastel) to presentations
- **Content Blocks**: Support for text, code, images, charts, and Mermaid diagrams
- **Export to HTML**: Generate standalone HTML files with embedded styling
- **Live Preview**: Preview presentations in a browser
- **User-Editable**: Generated HTML includes inline editing capabilities

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Add to Claude configuration:

For Claude Code (`~/.claude-code/settings.json`):
```json
{
  "mcpServers": {
    "html-presentation": {
      "command": "python",
      "args": ["/path/to/html_presentation_server.py"],
      "env": {}
    }
  }
}
```

For Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "html-presentation": {
      "command": "python",
      "args": ["/path/to/html_presentation_server.py"]
    }
  }
}
```

3. Restart Claude to load the MCP server

## Available Tools

### `create_presentation`
Create a new presentation with title, description, and theme.
```
Parameters:
- title: string (required)
- description: string (required) 
- theme: string (optional, default: "default")
```

### `add_slide`
Add a new slide to a presentation.
```
Parameters:
- presentation_id: string (required)
- slide_type: string (required) - Options: 'title', 'content', 'image', 'code', 'chart', 'mermaid'
- title: string (optional)
- content: string (optional)
- metadata: object (optional)
```

### `update_slide`
Update an existing slide.
```
Parameters:
- presentation_id: string (required)
- slide_id: string (required)
- title: string (optional)
- content: string (optional)
- metadata: object (optional)
```

### `list_presentations`
List all available presentations.

### `get_presentation`
Get details of a specific presentation including all slides.
```
Parameters:
- presentation_id: string (required)
```

### `apply_theme`
Apply a theme to a presentation.
```
Parameters:
- presentation_id: string (required)
- theme_name: string (required) - Options: 'default', 'dark', 'pastel'
```

### `export_html`
Export a presentation as a standalone HTML file.
```
Parameters:
- presentation_id: string (required)
- output_path: string (optional)
```

### `preview_presentation`
Start a preview server for a presentation.
```
Parameters:
- presentation_id: string (required)
- port: integer (optional, default: 8000)
```

## Available Resources

- `theme://list` - List all available themes
- `blocks://list` - List all content block types
- `template://base` - Get the base HTML template

## Usage Examples

### Creating a Simple Presentation

```
User: Create a presentation about "Introduction to Python" with 3 slides

AI Assistant: I'll create a presentation about Python for you.

1. First, I'll create the presentation:
   create_presentation(title="Introduction to Python", description="A beginner's guide to Python programming", theme="default")

2. Add a title slide:
   add_slide(presentation_id="pres_xxx", slide_type="title", title="Introduction to Python", content="A beginner's guide to Python programming")

3. Add a content slide about Python basics:
   add_slide(presentation_id="pres_xxx", slide_type="content", title="What is Python?", content="Python is a high-level, interpreted programming language...")

4. Add a code example slide:
   add_slide(presentation_id="pres_xxx", slide_type="code", title="Hello World Example", content="print('Hello, World!')", metadata={"language": "python"})

5. Export the presentation:
   export_html(presentation_id="pres_xxx")
```

### Creating a Data Visualization Presentation

```
User: Create a presentation with a Mermaid diagram and a chart

AI Assistant: I'll create a presentation with data visualizations.

1. Create presentation:
   create_presentation(title="Data Visualization Demo", description="Examples of charts and diagrams", theme="dark")

2. Add Mermaid diagram:
   add_slide(presentation_id="pres_xxx", slide_type="mermaid", title="System Architecture", content="graph TD\n    A[Client] --> B[Server]\n    B --> C[Database]")

3. Add chart slide:
   add_slide(presentation_id="pres_xxx", slide_type="chart", title="Monthly Sales", metadata={
     "chart_config": {
       "type": "bar",
       "data": {
         "labels": ["Jan", "Feb", "Mar"],
         "datasets": [{
           "label": "Sales",
           "data": [12, 19, 15]
         }]
       }
     }
   })
```

## Slide Types

1. **title**: Title slides with large headings
2. **content**: Regular content with text
3. **code**: Code blocks with syntax highlighting
4. **image**: Images with captions
5. **chart**: Chart.js powered charts
6. **mermaid**: Mermaid diagrams

## Themes

- **default**: Clean and modern theme
- **dark**: Dark mode with high contrast
- **pastel**: Soft pastel colors

## User Editing

Generated HTML files include inline editing capabilities:
- Hover over content blocks to see edit buttons
- Click edit button to make content editable
- Changes are saved locally (implement server persistence as needed)

## Architecture

```
┌─────────────────────┐
│  Claude Desktop/Code │
└──────────┬──────────┘
           │ MCP Protocol
┌──────────▼──────────┐
│ HTML Presentation   │
│    MCP Server       │
├─────────────────────┤
│ • Create slides     │
│ • Apply themes      │
│ • Export HTML       │
│ • Preview server    │
└─────────────────────┘
           │
┌──────────▼──────────┐
│  Generated HTML     │
│   (User-editable)   │
└─────────────────────┘
```

## Extending the Server

To add new features:

1. **New Slide Types**: Add to `CONTENT_BLOCKS` dictionary
2. **New Themes**: Add to `THEMES` dictionary
3. **New Tools**: Add new `@mcp.tool()` decorated functions
4. **Persistence**: Replace in-memory storage with database

## Future Enhancements

- [ ] Database persistence
- [ ] Collaborative editing
- [ ] More themes and transitions
- [ ] PDF export
- [ ] Presentation templates
- [ ] Asset management
- [ ] Version control integration