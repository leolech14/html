# Product Roadmap

> Last Updated: 2025-07-25
> Version: 1.1.0
> Status: Planning

## Phase 0: Already Completed

The following features have been implemented:

- [x] Basic project structure with src/, views/, data/ directories
- [x] Component registry system (registry.json)
- [x] Theme system with CSS variables
- [x] Component generator script (generate-component.js)
- [x] View generator script (generate-view.js)
- [x] Base layout template (base.html)
- [x] Data visualization layout (data-viz.html)
- [x] File naming conventions and RULES.md documentation
- [x] html-mcp MCP server integration
- [x] Basic HTML generation from Python

## Phase 1: Universal Data Ingestion (3 weeks)

**Goal:** Build the data ingestion and transformation pipeline
**Success Criteria:** Accept multiple data formats and transform to visualization-ready structure

### Must-Have Features

- [ ] JSON data ingestion - Parse and validate JSON inputs `S`
- [ ] CSV parser - Convert CSV to internal format `M`
- [ ] Markdown processor - Extract data from markdown files `M`
- [ ] Schema validation system - Ensure data quality `M`
- [ ] Data transformation pipeline - Convert to viz-ready format `L`

### Should-Have Features

- [ ] Vector store connectors - Pinecone, Chroma integration `XL`
- [ ] API data fetcher - Pull from REST endpoints `M`

### Dependencies

- Define internal data format
- Error handling strategy

## Phase 2: Core Visualization Components (2 weeks)

**Goal:** Build essential visualization components
**Success Criteria:** Complete component library with Chart.js and Mermaid

### Must-Have Features

- [ ] Line chart component - Time series and trends `S`
- [ ] Bar chart component - Comparisons and categories `S`
- [ ] Pie/Donut charts - Proportional data `S`
- [ ] Data tables - Sortable, filterable, searchable `M`
- [ ] Mermaid diagrams - Flowcharts, sequences, graphs `M`

### Should-Have Features

- [ ] Heatmaps - Density visualizations `M`
- [ ] Network graphs - Relationship visualizations `L`

### Dependencies

- Phase 1 data format defined
- Component registry system

## Phase 3: User Preferences & Theming (2 weeks)

**Goal:** Enable customization through preferences and themes
**Success Criteria:** Users can save and reuse visualization preferences

### Must-Have Features

- [ ] User preference profiles - Save visualization settings `M`
- [ ] Theme marketplace structure - Browse and select themes `L`
- [ ] Theme builder - Create custom themes visually `M`
- [ ] Preference API - Store/retrieve user settings `S`

### Should-Have Features

- [ ] Auto-theme selection - AI picks theme based on content `M`
- [ ] Brand presets - Corporate identity templates `S`

### Dependencies

- Stable component library from Phase 1-2

## Phase 4: MCP Server Enhancement (3 weeks)

**Goal:** Enhance html-mcp for production use
**Success Criteria:** AI agents can reliably generate complex visualizations

### Must-Have Features

- [ ] Enhanced MCP API - Full data ingestion support `L`
- [ ] Batch processing - Generate multiple HTMLs at once `M`
- [ ] Error handling - Graceful failures with clear messages `S`
- [ ] Progress tracking - Real-time generation status `S`
- [ ] Output management - Organize generated files `M`

### Should-Have Features

- [ ] MCP server clustering - Handle multiple agents `L`
- [ ] Cache layer - Reuse common visualizations `M`

### Dependencies

- Stable ingestion pipeline
- Component library complete

## Phase 5: Production & Scale (4 weeks)

**Goal:** Production-ready system with vector store integration
**Success Criteria:** Handle enterprise-scale data visualization needs

### Must-Have Features

- [ ] Vector store connectors - Production Pinecone/Chroma integration `XL`
- [ ] Performance optimization - Handle large datasets efficiently `L`
- [ ] Export formats - PDF, PNG, PowerPoint generation `L`
- [ ] API documentation - Complete developer docs `M`
- [ ] Deployment guide - Production setup instructions `S`

### Should-Have Features

- [ ] Multi-language support - Internationalization `M`
- [ ] Analytics dashboard - Usage and performance metrics `L`
- [ ] Template marketplace - Share visualization templates `XL`

### Dependencies

- All core features stable
- Performance benchmarking complete