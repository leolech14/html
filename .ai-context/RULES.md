# AI Context Rules for HTML Interface System

## 🎯 System Purpose
This system creates high-quality HTML5 data visualizations with precise component tracking and version control.

## 📁 Directory Structure & Responsibilities

### `/src/` - Source Code
- **components/**: Reusable UI elements (charts, tables, cards, etc.)
- **layouts/**: Page structure templates
- **themes/**: Visual styling systems
- **core/**: Core utilities and frameworks

### `/views/` - Generated Output
- **data/**: Data visualization pages
- **reports/**: Formatted reports
- **dashboards/**: Interactive dashboards
- **sandbox/**: Experimental views

### `/data/` - Data Management
- **raw/**: Original data files
- **processed/**: Transformed data
- **cache/**: Temporary storage
- **archive/**: Historical data

## 🔧 Component Location System

### Component Registry
Every component is tracked in `src/components/registry.json`:
```json
{
  "componentId": {
    "path": "src/components/category/component-name.js",
    "dependencies": ["dep1", "dep2"],
    "usedIn": ["view1.html", "view2.html"],
    "version": "1.0.0"
  }
}
```

### Component Naming
- Format: `category-component-name.js`
- Examples: `chart-line-graph.js`, `table-sortable.js`, `viz-mermaid-diagram.js`

## 📝 File Naming Conventions

### HTML Views
Format: `YYYYMMDD_category_description_v##.html`
- Example: `20250123_data_financial-analysis_v01.html`

### Components
Format: `category-component-name.{js,css}`
- Example: `chart-bar-stacked.js`

### Data Files
Format: `YYYYMMDD_source_type.{json,csv}`
- Example: `20250123_api_transactions.json`

## 🎨 Theme System

### Main Theme Location
`src/themes/main/theme.css`

### Secondary Themes
`src/themes/secondary/{theme-name}/theme.css`

### Theme Variables
Always use CSS custom properties:
```css
:root {
  --primary-color: #6366f1;
  --background: #0f1419;
  --text-color: #e2e8f0;
}
```

## 🔄 Versioning Rules

### Semantic Versioning
- MAJOR.MINOR.PATCH (e.g., 1.2.3)
- Components track their own versions
- Views use v## suffix for iterations

### Git Workflow
1. Feature branches: `feature/component-name`
2. Always commit with descriptive messages
3. Tag releases: `v1.0.0`

## 🚫 Restrictions

1. **Never modify** files in `/views/` directly - always regenerate
2. **Never delete** from `/data/archive/` without confirmation
3. **Always validate** HTML5 compliance before committing
4. **Maximum nesting**: 3 levels from root

## 🔍 Component Discovery

To find a component:
1. Check `src/components/registry.json`
2. Use naming convention to locate file
3. Check `usedIn` array for view references
4. Review `dependencies` for related components

## 📊 Data Visualization Standards

### Charts (Chart.js)
- Location: `src/components/charts/`
- Config: `data/processed/chart-configs/`

### Mermaid Diagrams
- Location: `src/components/viz/`
- Definitions: `data/processed/mermaid-defs/`

### Tables
- Location: `src/components/tables/`
- Styles: Component-specific CSS modules

## 🤖 AI Instructions

When asked to:
- **Create visualization**: Use templates in `src/layouts/`
- **Modify component**: Check registry first, update version
- **Add data**: Process to `data/processed/`, archive raw
- **Find feature**: Search registry by component name/category
- **Update theme**: Modify CSS variables, never hardcode colors