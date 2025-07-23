# HTML AI-Human Visual Data Interface System

A sophisticated HTML5-based system for creating AI-friendly, versioned data visualizations with smart component organization.

## 🏗️ System Architecture

```
html/
├── .ai-context/          # AI agent configuration & rules
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   ├── layouts/          # Page layouts
│   ├── themes/           # Theme system
│   └── core/             # Core functionality
├── views/                # Generated HTML views
├── data/                 # Data storage
├── assets/               # Static resources
└── config/               # System configuration
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate new view
npm run generate:view
```

## 📋 Features

- **AI-Friendly Structure**: Clear 3-level nesting with semantic organization
- **Smart Versioning**: Git-based version control with semantic versioning
- **Theme System**: Main theme + secondary themes support
- **Component Library**: Reusable, trackable components
- **Data Visualization**: Charts, Mermaid diagrams, tables
- **Living Standard**: HTML5 compliant with modern features

## 🤖 AI Agent Instructions

When working with this system:
1. Check `.ai-context/RULES.md` for conventions
2. Use the component registry at `src/components/registry.json`
3. Follow naming pattern: `YYYYMMDD_category_name_v##.html`
4. All data visualizations go in `views/data/`

## 📚 Documentation

- [Component Guide](docs/components.md)
- [Theme System](docs/themes.md)
- [AI Integration](docs/ai-integration.md)
- [Versioning Strategy](docs/versioning.md)