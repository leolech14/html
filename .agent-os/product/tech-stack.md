# Technical Stack

> Last Updated: 2025-07-24
> Version: 1.0.0

## Core Technologies

### Application Framework
- **Framework:** Vanilla JavaScript (No framework)
- **Version:** ES6+
- **Language:** JavaScript, HTML5, CSS3

### Database
- **Primary:** File-based (JSON)
- **Version:** n/a
- **ORM:** n/a

## Frontend Stack

### JavaScript Framework
- **Framework:** None (Vanilla JS)
- **Version:** ES6+ modules
- **Build Tool:** Node.js scripts

### Import Strategy
- **Strategy:** ES6 modules
- **Package Manager:** npm
- **Node Version:** 18.x or higher

### CSS Framework
- **Framework:** Custom CSS with CSS Variables
- **Version:** CSS3
- **PostCSS:** No

### UI Components
- **Library:** Custom component system
- **Version:** Self-versioned per component
- **Installation:** Component registry (registry.json)

## Assets & Media

### Fonts
- **Provider:** System fonts
- **Loading Strategy:** Native font stack

### Icons
- **Library:** Custom SVG icons
- **Implementation:** Inline SVG

## Data Visualization

### Charting Library
- **Library:** Chart.js
- **Version:** Latest stable
- **Configuration:** data/processed/chart-configs/

### Diagramming
- **Library:** Mermaid
- **Version:** Latest stable
- **Configuration:** data/processed/mermaid-defs/

## Infrastructure

### Application Hosting
- **Platform:** Static hosting
- **Service:** Any static file server
- **Region:** n/a

### Database Hosting
- **Provider:** n/a (file-based)
- **Service:** n/a
- **Backups:** Git version control

### Asset Storage
- **Provider:** Local filesystem
- **CDN:** Optional
- **Access:** Direct file access

## Development Tools

### Component Generation
- **Tool:** Custom Node.js scripts
- **Location:** scripts/generate-component.js

### View Generation
- **Tool:** Custom Node.js scripts
- **Location:** scripts/generate-view.js

## Deployment

### CI/CD Pipeline
- **Platform:** GitHub Actions (recommended)
- **Trigger:** Push to main branch
- **Tests:** HTML5 validation

### Environments
- **Production:** Static file deployment
- **Staging:** Local development
- **Review Apps:** n/a

### Version Control
- **System:** Git
- **Workflow:** Feature branches
- **Tagging:** Semantic versioning (v1.0.0)

## Code Standards

### HTML
- **Version:** HTML5
- **Validation:** W3C Validator compliance required

### CSS
- **Methodology:** BEM-inspired with CSS Variables
- **Preprocessor:** None (vanilla CSS)

### JavaScript
- **Standard:** ES6+ modules
- **Linting:** ESLint (recommended)

## Project-Specific Conventions

### File Naming
- **Views:** YYYYMMDD_category_description_v##.html
- **Components:** category-component-name.js
- **Data:** YYYYMMDD_source_type.{json,csv}

### Directory Structure
- **Source:** /src/
- **Generated:** /views/ (never edit directly)
- **Data:** /data/ with raw/processed/archive subdirs

### Component Registry
- **Location:** src/components/registry.json
- **Format:** JSON with path, dependencies, usedIn, version