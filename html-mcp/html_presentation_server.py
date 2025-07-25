#!/usr/bin/env python3
"""
HTML Presentation MCP Server
An MCP server that allows AI agents to create, edit, and manage HTML presentations
with consistent styling and user-editable content.
"""

import os
import sys
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
import asyncio
from dataclasses import dataclass, asdict

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("Error: MCP modules not found. Please install with: pip install mcp fastmcp", file=sys.stderr)
    sys.exit(1)

# Initialize FastMCP server
mcp = FastMCP("html-presentation-server")

# Configuration
BASE_DIR = Path(__file__).parent
TEMPLATES_DIR = BASE_DIR / "src" / "templates"
VIEWS_DIR = BASE_DIR / "views" / "generated"
ASSETS_DIR = BASE_DIR / "assets"
THEMES_DIR = BASE_DIR / "src" / "themes"

# Ensure directories exist
for dir_path in [TEMPLATES_DIR, VIEWS_DIR, ASSETS_DIR, THEMES_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

@dataclass
class Slide:
    """Represents a single slide in a presentation"""
    id: str
    type: str  # 'title', 'content', 'image', 'code', 'chart', 'mermaid'
    title: Optional[str] = None
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class Presentation:
    """Represents an entire presentation"""
    id: str
    title: str
    description: str
    theme: str = "dark"
    slides: List[Slide] = None
    created_at: str = None
    updated_at: str = None
    
    def __post_init__(self):
        if self.slides is None:
            self.slides = []
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        self.updated_at = datetime.now().isoformat()

# In-memory storage for presentations (in production, use a database)
presentations: Dict[str, Presentation] = {}

# Available themes
THEMES = {
    "dark": {
        "name": "Dark Mode (Default)",
        "description": "Dark theme with high contrast and optimal readability",
        "primary_color": "#E2E8F0",
        "accent_color": "#63B3ED"
    },
    "light": {
        "name": "Light Mode",
        "description": "Clean and bright theme for daytime viewing",
        "primary_color": "#2D3748",
        "accent_color": "#4299E1"
    },
    "pastel": {
        "name": "Pastel",
        "description": "Soft pastel colors with gentle contrast",
        "primary_color": "#FED7E2",
        "accent_color": "#B794F4"
    }
}

# Content block templates
CONTENT_BLOCKS = {
    "text": """<div class="content-block text-block">
    <h2>{title}</h2>
    <div class="text-content">{content}</div>
</div>""",
    
    "code": """<div class="content-block code-block">
    <h3>{title}</h3>
    <pre><code class="language-{language}">{content}</code></pre>
</div>""",
    
    "image": """<div class="content-block image-block">
    <h3>{title}</h3>
    <img src="{src}" alt="{alt}" />
    <p class="caption">{caption}</p>
</div>""",
    
    "chart": """<div class="content-block chart-block">
    <h3>{title}</h3>
    <canvas id="chart-{id}"></canvas>
    <script>
        const ctx{id} = document.getElementById('chart-{id}').getContext('2d');
        new Chart(ctx{id}, {chart_config});
    </script>
</div>""",
    
    "mermaid": """<div class="content-block mermaid-block">
    <h3>{title}</h3>
    <div class="mermaid">
{content}
    </div>
</div>"""
}

@mcp.tool()
async def create_presentation(
    title: str,
    description: str,
    theme: str = "dark"
) -> Dict[str, Any]:
    """Create a new HTML presentation with the specified title, description, and theme."""
    presentation_id = f"pres_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    presentation = Presentation(
        id=presentation_id,
        title=title,
        description=description,
        theme=theme if theme in THEMES else "dark"
    )
    
    presentations[presentation_id] = presentation
    
    return {
        "success": True,
        "presentation_id": presentation_id,
        "message": f"Created presentation '{title}' with ID {presentation_id}"
    }

@mcp.tool()
async def add_slide(
    presentation_id: str,
    slide_type: str,
    title: Optional[str] = None,
    content: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Add a new slide to an existing presentation."""
    if presentation_id not in presentations:
        return {"success": False, "error": "Presentation not found"}
    
    presentation = presentations[presentation_id]
    slide_id = f"slide_{len(presentation.slides) + 1}"
    
    slide = Slide(
        id=slide_id,
        type=slide_type,
        title=title,
        content=content,
        metadata=metadata or {}
    )
    
    presentation.slides.append(slide)
    presentation.updated_at = datetime.now().isoformat()
    
    return {
        "success": True,
        "slide_id": slide_id,
        "message": f"Added {slide_type} slide to presentation"
    }

@mcp.tool()
async def update_slide(
    presentation_id: str,
    slide_id: str,
    title: Optional[str] = None,
    content: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Update an existing slide in a presentation."""
    if presentation_id not in presentations:
        return {"success": False, "error": "Presentation not found"}
    
    presentation = presentations[presentation_id]
    
    for slide in presentation.slides:
        if slide.id == slide_id:
            if title is not None:
                slide.title = title
            if content is not None:
                slide.content = content
            if metadata is not None:
                slide.metadata.update(metadata)
            
            presentation.updated_at = datetime.now().isoformat()
            return {
                "success": True,
                "message": f"Updated slide {slide_id}"
            }
    
    return {"success": False, "error": "Slide not found"}

@mcp.tool()
async def list_presentations() -> Dict[str, Any]:
    """List all available presentations."""
    pres_list = []
    for pres_id, pres in presentations.items():
        pres_list.append({
            "id": pres.id,
            "title": pres.title,
            "description": pres.description,
            "theme": pres.theme,
            "slide_count": len(pres.slides),
            "created_at": pres.created_at,
            "updated_at": pres.updated_at
        })
    
    return {
        "success": True,
        "presentations": pres_list,
        "count": len(pres_list)
    }

@mcp.tool()
async def get_presentation(presentation_id: str) -> Dict[str, Any]:
    """Get details of a specific presentation including all slides."""
    if presentation_id not in presentations:
        return {"success": False, "error": "Presentation not found"}
    
    presentation = presentations[presentation_id]
    
    return {
        "success": True,
        "presentation": asdict(presentation)
    }

@mcp.tool()
async def apply_theme(presentation_id: str, theme_name: str) -> Dict[str, Any]:
    """Apply a theme to a presentation."""
    if presentation_id not in presentations:
        return {"success": False, "error": "Presentation not found"}
    
    if theme_name not in THEMES:
        return {"success": False, "error": f"Theme '{theme_name}' not found"}
    
    presentation = presentations[presentation_id]
    presentation.theme = theme_name
    presentation.updated_at = datetime.now().isoformat()
    
    return {
        "success": True,
        "message": f"Applied theme '{theme_name}' to presentation"
    }

@mcp.tool()
async def export_html(presentation_id: str, output_path: Optional[str] = None) -> Dict[str, Any]:
    """Export a presentation as a standalone HTML file."""
    if presentation_id not in presentations:
        return {"success": False, "error": "Presentation not found"}
    
    presentation = presentations[presentation_id]
    theme = THEMES.get(presentation.theme, THEMES["dark"])
    
    # Generate HTML
    html_content = generate_html(presentation, theme)
    
    # Determine output path
    if output_path is None:
        filename = f"{presentation.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        output_path = str(VIEWS_DIR / filename)
    
    # Write HTML file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return {
        "success": True,
        "output_path": output_path,
        "message": f"Exported presentation to {output_path}"
    }

@mcp.tool()
async def preview_presentation(presentation_id: str, port: int = 8000) -> Dict[str, Any]:
    """Start a preview server for a presentation."""
    if presentation_id not in presentations:
        return {"success": False, "error": "Presentation not found"}
    
    # Export to temporary file
    temp_path = VIEWS_DIR / f"preview_{presentation_id}.html"
    await export_html(presentation_id, str(temp_path))
    
    return {
        "success": True,
        "preview_url": f"http://localhost:{port}/preview_{presentation_id}.html",
        "message": f"Preview available at http://localhost:{port}/preview_{presentation_id}.html"
    }

# Resource providers
@mcp.resource("theme://list")
async def list_themes() -> str:
    """List all available themes."""
    return json.dumps(THEMES, indent=2)

@mcp.resource("blocks://list")
async def list_content_blocks() -> str:
    """List all available content block templates."""
    return json.dumps(list(CONTENT_BLOCKS.keys()), indent=2)

@mcp.resource("template://base")
async def get_base_template() -> str:
    """Get the base HTML template."""
    return BASE_HTML_TEMPLATE

# Helper functions
def generate_html(presentation: Presentation, theme: Dict[str, Any]) -> str:
    """Generate complete HTML from a presentation."""
    slides_html = []
    
    for slide in presentation.slides:
        slide_html = generate_slide_html(slide)
        slides_html.append(slide_html)
    
    # Use dark theme colors by default
    if presentation.theme == "dark":
        bg_color = "#1A202C"
        text_color = "#F7FAFC"
        surface_color = "#2D3748"
        border_color = "#4A5568"
        shadow_opacity = "0.3"
    else:
        bg_color = "#FFFFFF"
        text_color = "#2D3748"
        surface_color = "#F7FAFC"
        border_color = "#E2E8F0"
        shadow_opacity = "0.1"
    
    html = BASE_HTML_TEMPLATE.format(
        title=presentation.title,
        description=presentation.description,
        theme_name=theme["name"],
        primary_color=theme["primary_color"],
        accent_color=theme["accent_color"],
        bg_color=bg_color,
        text_color=text_color,
        surface_color=surface_color,
        border_color=border_color,
        shadow_opacity=shadow_opacity,
        slides_content="\n".join(slides_html),
        generated_at=datetime.now().isoformat()
    )
    
    return html

def generate_slide_html(slide: Slide) -> str:
    """Generate HTML for a single slide."""
    if slide.type in CONTENT_BLOCKS:
        template = CONTENT_BLOCKS[slide.type]
        
        # Prepare template variables
        vars = {
            "id": slide.id,
            "title": slide.title or "",
            "content": slide.content or ""
        }
        
        # Add metadata variables
        if slide.metadata:
            vars.update(slide.metadata)
        
        # Format template
        try:
            return template.format(**vars)
        except KeyError as e:
            return f"<div class='error'>Error rendering slide: missing {e}</div>"
    
    return f"<div class='error'>Unknown slide type: {slide.type}</div>"

# Base HTML template
BASE_HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{description}">
    <meta name="generator" content="HTML Presentation MCP Server">
    
    <title>{title}</title>
    
    <!-- External Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    
    <style>
        :root {{
            --primary-color: {primary_color};
            --accent-color: {accent_color};
            --text-color: {text_color};
            --bg-color: {bg_color};
            --surface-color: {surface_color};
            --border-color: {border_color};
            --shadow: 0 4px 6px rgba(0, 0, 0, {shadow_opacity});
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
            padding: 2rem;
        }}
        
        .presentation-header {{
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: var(--surface-color);
            border-radius: 12px;
            box-shadow: var(--shadow);
        }}
        
        .presentation-header h1 {{
            color: var(--primary-color);
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }}
        
        .presentation-header p {{
            color: #718096;
            font-size: 1.1rem;
        }}
        
        .slides-container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        
        .content-block {{
            background: white;
            padding: 2rem;
            margin-bottom: 2rem;
            border-radius: 8px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
        }}
        
        .content-block h2, .content-block h3 {{
            color: var(--primary-color);
            margin-bottom: 1rem;
        }}
        
        .text-content {{
            font-size: 1.1rem;
            line-height: 1.8;
        }}
        
        .code-block pre {{
            border-radius: 6px;
            padding: 1rem;
            overflow-x: auto;
        }}
        
        .image-block img {{
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 1rem 0;
        }}
        
        .caption {{
            text-align: center;
            color: #718096;
            font-style: italic;
            margin-top: 0.5rem;
        }}
        
        .chart-block canvas {{
            max-height: 400px;
            margin: 1rem 0;
        }}
        
        .mermaid {{
            text-align: center;
            margin: 1rem 0;
        }}
        
        .meta-info {{
            text-align: center;
            margin-top: 3rem;
            padding: 1rem;
            color: #A0AEC0;
            font-size: 0.9rem;
        }}
        
        /* Edit mode styles */
        .editable {{
            position: relative;
            transition: all 0.3s ease;
        }}
        
        .editable:hover {{
            outline: 2px dashed var(--accent-color);
            outline-offset: 4px;
        }}
        
        .edit-button {{
            position: absolute;
            top: -10px;
            right: -10px;
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }}
        
        .editable:hover .edit-button {{
            display: flex;
        }}
        
        @media (max-width: 768px) {{
            body {{
                padding: 1rem;
            }}
            
            .presentation-header h1 {{
                font-size: 2rem;
            }}
            
            .content-block {{
                padding: 1.5rem;
            }}
        }}
    </style>
</head>
<body>
    <div class="presentation-header">
        <h1>{title}</h1>
        <p>{description}</p>
    </div>
    
    <div class="slides-container">
        {slides_content}
    </div>
    
    <div class="meta-info">
        <p>Generated with HTML Presentation Server | Theme: {theme_name}</p>
        <p>Created: {generated_at}</p>
    </div>
    
    <script>
        // Initialize Mermaid
        mermaid.initialize({{ 
            startOnLoad: true,
            theme: 'default'
        }});
        
        // Enable edit mode
        document.addEventListener('DOMContentLoaded', function() {{
            // Add edit buttons to editable elements
            document.querySelectorAll('.editable').forEach(elem => {{
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-button';
                editBtn.innerHTML = '✏️';
                editBtn.onclick = () => enableInlineEdit(elem);
                elem.appendChild(editBtn);
            }});
        }});
        
        function enableInlineEdit(element) {{
            element.contentEditable = true;
            element.focus();
            
            element.addEventListener('blur', function() {{
                element.contentEditable = false;
                // Here you could send the updated content to a server
                console.log('Updated content:', element.innerHTML);
            }});
        }}
    </script>
</body>
</html>"""

if __name__ == "__main__":
    # Run the server
    try:
        import sys
        import logging
        
        # Set up logging for debugging
        log_file = Path(__file__).parent / 'mcp_server.log'
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[logging.FileHandler(str(log_file)), logging.StreamHandler()]
        )
        
        # Run the MCP server
        mcp.run(transport="stdio")
        
    except KeyboardInterrupt:
        print("\nServer stopped by user", file=sys.stderr)
        sys.exit(0)
    except Exception as e:
        print(f"Error running MCP server: {e}", file=sys.stderr)
        sys.exit(1)