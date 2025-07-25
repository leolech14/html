# Product Mission

> Last Updated: 2025-07-25
> Version: 1.1.0

## Pitch

PROJECT_html is a universal HTML generation framework that enables AI agents and developers to transform any data source (including vector stores) into beautiful, interactive HTML5 presentations by providing a comprehensive component system, theme engine, and MCP server interface for easy, plug-and-play visualization creation.

## Users

### Primary Customers

- **AI Agents**: Need to create documentation and visualizations from various data sources
- **Developers**: Want to quickly visualize data without building from scratch
- **Knowledge Workers**: Creating presentations and reports from complex data
- **Data Scientists**: Transforming analysis results into shareable visualizations

### User Personas

**AI Documentation Agent** (N/A)
- **Role:** Automated Documentation Generator
- **Context:** Processing knowledge bases, vector stores, and raw data
- **Pain Points:** No standard way to create beautiful HTML, manual template selection
- **Goals:** Universal data ingestion, automatic theme selection, consistent output

**Developer Dan** (25-40 years old)
- **Role:** Full-Stack Developer
- **Context:** Building applications that need data visualization
- **Pain Points:** Time spent on custom HTML/CSS, inconsistent designs
- **Goals:** Plug-and-play visualization, customizable themes, quick integration

**Knowledge Worker Kate** (30-45 years old)
- **Role:** Technical Writer / Analyst
- **Context:** Creating documentation and presentations from various sources
- **Pain Points:** Manual HTML editing, limited design skills, time-consuming formatting
- **Goals:** Transform data to presentation quickly, professional appearance, easy updates

**Data Scientist Sarah** (28-50 years old)
- **Role:** ML Engineer / Data Scientist
- **Context:** Sharing analysis results and model outputs
- **Pain Points:** Jupyter notebooks aren't shareable, matplotlib isn't interactive
- **Goals:** Interactive visualizations, vector store integration, beautiful reports

## The Problem

### Data to Presentation Gap

Converting raw data, knowledge bases, or vector store outputs into beautiful presentations requires manual coding and design work. Each project starts from scratch.

**Our Solution:** Universal ingestion system that accepts any data format and automatically generates interactive HTML.

### AI Agent Limitations

AI agents can process data but struggle to create visually appealing outputs. They need a standardized way to generate professional presentations.

**Our Solution:** MCP server interface (html-mcp) that gives AI agents direct access to the HTML generation framework.

### Configuration Complexity

Every visualization project requires different layouts, themes, and preferences. Managing these variations becomes a nightmare.

**Our Solution:** User preference profiles and theme marketplace for easy customization and reuse.

## Differentiators

### Universal Data Ingestion

Unlike single-purpose visualization tools, we accept any data source - JSON, CSV, Markdown, vector stores, APIs. This results in one tool for all visualization needs.

### MCP Server Integration

Unlike traditional libraries, our MCP server (html-mcp) gives AI agents direct access to generate HTML. This results in AI-powered documentation and visualization at scale.

### Theme Marketplace Approach

Unlike hardcoded styling, we provide swappable themes and user preferences. This results in consistent branding across all generated content.

## Key Features

### Core Features

- **Universal Data Ingestion:** Accept JSON, CSV, Markdown, vector stores, and APIs
- **MCP Server Interface:** AI agents can generate HTML through html-mcp
- **Theme Engine:** Swappable themes with CSS custom properties
- **Component Registry:** Central tracking of all UI components

### Data Transformation Features

- **Smart Data Detection:** Automatically identify data types and suggest visualizations
- **Vector Store Integration:** Connect to Pinecone, Chroma, and other vector databases
- **Schema Validation:** Ensure data quality before visualization
- **Transform Pipeline:** Process raw data into visualization-ready formats

### Visualization Features

- **Chart.js Components:** Pre-built charts with automatic data binding
- **Mermaid Diagrams:** Generate flowcharts, sequences, and graphs
- **Interactive Tables:** Sortable, searchable, and filterable
- **Custom Layouts:** Choose from multiple layout templates

### AI & Automation Features

- **Preference Profiles:** Save and reuse visualization preferences
- **Auto-theming:** AI selects appropriate theme based on content
- **Batch Generation:** Create multiple visualizations from data sets
- **Export Options:** Generate static HTML or dynamic presentations