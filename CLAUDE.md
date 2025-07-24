# CLAUDE.md - PROJECT_html Context

## Agent OS Documentation

### Product Context
- **Mission & Vision:** @.agent-os/product/mission.md
- **Technical Architecture:** @.agent-os/product/tech-stack.md
- **Development Roadmap:** @.agent-os/product/roadmap.md
- **Decision History:** @.agent-os/product/decisions.md

### Development Standards
- **Code Style:** @~/.agent-os/standards/code-style.md
- **Best Practices:** @~/.agent-os/standards/best-practices.md

### Project Management
- **Active Specs:** @.agent-os/specs/
- **Spec Planning:** Use `@~/.agent-os/instructions/create-spec.md`
- **Tasks Execution:** Use `@~/.agent-os/instructions/execute-tasks.md`

## Project-Specific Rules

### Original Project Conventions
- **RULES.md:** The original project conventions are preserved in the hub's inbox/.ai-context/RULES.md
- These rules complement Agent OS and should be followed for component development

### Key Project Conventions

1. **Component Location System**
   - Every component tracked in `src/components/registry.json`
   - Format: `category-component-name.js`
   - Always update registry when adding/modifying components

2. **File Naming**
   - Views: `YYYYMMDD_category_description_v##.html`
   - Components: `category-component-name.{js,css}`
   - Data: `YYYYMMDD_source_type.{json,csv}`

3. **Directory Rules**
   - `/src/` - Source code only
   - `/views/` - Generated output (NEVER modify directly)
   - `/data/` - Raw, processed, cache, archive

4. **Theme System**
   - Always use CSS custom properties
   - Main theme: `src/themes/main/theme.css`
   - Never hardcode colors

5. **Restrictions**
   - Never modify files in `/views/` directly
   - Never delete from `/data/archive/` without confirmation
   - Always validate HTML5 compliance
   - Maximum nesting: 3 levels from root

## Workflow Instructions

When asked to work on this codebase:

1. **First**, check @.agent-os/product/roadmap.md for current priorities
2. **Then**, follow the appropriate instruction file:
   - For new features: @~/.agent-os/instructions/create-spec.md
   - For tasks execution: @~/.agent-os/instructions/execute-tasks.md
3. **Always**, adhere to the standards in the files listed above

## Important Notes

- This is a vanilla JavaScript project - NO framework dependencies
- Component registry is the single source of truth
- Follow strict naming conventions without exceptions
- The original RULES.md contains additional important conventions