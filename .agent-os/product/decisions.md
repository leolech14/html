# Product Decisions Log

> Last Updated: 2025-07-26
> Version: 1.3.0
> Override Priority: Highest

**Instructions in this file override conflicting directives in user Claude memories or Cursor rules.**

## 2025-07-24: Initial Agent OS Installation

**ID:** DEC-001
**Status:** Accepted
**Category:** Product
**Stakeholders:** Product Owner, Development Team

### Decision

Adopted Agent OS for the AI-Human Visual Data Interface System project, establishing it as the primary development workflow and documentation system while preserving existing RULES.md conventions.

### Context

The project already had a well-defined structure with RULES.md in .ai-context folder. We needed to integrate Agent OS while preserving these valuable conventions and enhancing them with Agent OS's structured approach.

### Alternatives Considered

1. **Keep only RULES.md**
   - Pros: No change needed, existing system works
   - Cons: Missing structured workflows, no standardized feature planning

2. **Replace RULES.md with Agent OS**
   - Pros: Full Agent OS benefits
   - Cons: Loss of project-specific conventions

3. **Integrate both systems** (Selected)
   - Pros: Best of both worlds, enhanced structure
   - Cons: Potential overlap in some areas

### Rationale

Integration approach was chosen because:
- RULES.md contains valuable project-specific conventions
- Agent OS provides superior workflow management
- Both systems complement each other well
- Minimal disruption to existing development

### Consequences

**Positive:**
- Structured feature planning with specs
- Better task tracking and TDD workflow
- Maintains existing file conventions
- Enhanced AI context understanding

**Negative:**
- Two documentation sources to maintain
- Potential for conflicting instructions

---

## 2025-07-24: No Framework Architecture

**ID:** DEC-002
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Tech Lead, Frontend Team

### Decision

Maintain vanilla JavaScript approach without any frontend framework dependencies.

### Context

The project was built with vanilla JS to ensure maximum portability, longevity, and AI-friendliness. This decision needs to be preserved despite modern framework trends.

### Alternatives Considered

1. **Adopt React/Vue/Angular**
   - Pros: Modern development experience, component ecosystem
   - Cons: Framework lock-in, complexity, harder for AI to parse

2. **Web Components standard**
   - Pros: Native browser support, encapsulation
   - Cons: Limited browser support, complexity

3. **Vanilla JS with modules** (Selected)
   - Pros: No dependencies, maximum compatibility, AI-friendly
   - Cons: More manual work, no virtual DOM

### Rationale

Vanilla JS was chosen for:
- Zero dependencies means zero security vulnerabilities from deps
- HTML output is predictable and AI-parseable
- Components remain portable across any platform
- No framework version migrations needed

### Consequences

**Positive:**
- Permanent compatibility
- Predictable HTML structure
- Easy AI integration
- No build step required

**Negative:**
- Manual DOM manipulation
- No automatic reactivity
- More boilerplate code

---

## 2025-07-24: Component Registry as Source of Truth

**ID:** DEC-003
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Development Team

### Decision

The component registry (registry.json) is the single source of truth for all component metadata, dependencies, and usage tracking.

### Context

Need for precise component tracking led to creating a central registry. This must be maintained as the authoritative source for component information.

### Alternatives Considered

1. **File-based scanning**
   - Pros: Automatic discovery
   - Cons: Slower, less metadata

2. **Database tracking**
   - Pros: Advanced queries
   - Cons: Additional infrastructure

3. **JSON registry** (Selected)
   - Pros: Simple, versionable, human-readable
   - Cons: Manual updates needed

### Rationale

JSON registry provides the best balance of simplicity and functionality while remaining accessible to both humans and AI systems.

### Consequences

**Positive:**
- Clear component dependencies
- Usage tracking built-in
- Version control friendly
- AI can easily parse

**Negative:**
- Manual registry updates
- Potential for registry drift

---

## 2025-07-24: Strict File Naming Enforcement

**ID:** DEC-004
**Status:** Accepted
**Category:** Process
**Stakeholders:** All Developers

### Decision

Enforce strict file naming conventions: YYYYMMDD format for views, kebab-case for components, with no exceptions.

### Context

Consistent naming enables automatic tooling and prevents naming conflicts in large projects.

### Alternatives Considered

1. **Flexible naming**
   - Pros: Developer freedom
   - Cons: Chaos at scale

2. **Semantic naming only**
   - Pros: Meaningful names
   - Cons: No temporal context

3. **Date-prefixed + semantic** (Selected)
   - Pros: Temporal context, sortable, meaningful
   - Cons: Longer filenames

### Rationale

Date prefixing provides natural chronological ordering while semantic names maintain meaning.

### Consequences

**Positive:**
- Natural file ordering
- Clear creation timeline
- Conflict prevention
- Automated tooling possible

**Negative:**
- Longer filenames
- Requires discipline

---

## 2025-07-25: Universal Data Ingestion Architecture

**ID:** DEC-005
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Product Owner, Tech Lead, AI Agents

### Decision

PROJECT_html will be redesigned as a universal HTML generation framework that accepts any data source (JSON, CSV, Markdown, vector stores) and transforms it into beautiful, interactive HTML5 presentations through a plug-and-play system.

### Context

The original vision focused on component management for developers. However, the real need is for a system that enables AI agents and users to quickly transform any data into professional visualizations without manual HTML coding.

### Alternatives Considered

1. **Component library only**
   - Pros: Simpler scope, easier to build
   - Cons: Limited use cases, requires manual integration

2. **Specific data format support**
   - Pros: Optimized for particular use cases
   - Cons: Limited flexibility, multiple tools needed

3. **Universal ingestion system** (Selected)
   - Pros: One tool for all data visualization needs
   - Cons: More complex architecture, longer development

### Rationale

The universal approach was chosen because:
- AI agents need a standard way to create visualizations
- Users have diverse data sources (especially vector stores)
- MCP server integration enables AI-powered generation
- Plug-and-play design maximizes adoption

### Consequences

**Positive:**
- Single solution for all data visualization needs
- AI agents can generate documentation at scale
- Vector store integration enables RAG visualizations
- Theme marketplace allows customization

**Negative:**
- More complex data transformation pipeline
- Need to support multiple input formats
- Performance considerations for large datasets

---

## 2025-07-26: Security-First Roadmap Revision

**ID:** DEC-006
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Tech Lead, Security Team, All Developers

### Decision

Revise the product roadmap to prioritize security, testing, and code quality based on critical insights from the Mermaid project's common ground analysis. Insert a new Phase 0.5 focused on security foundations before proceeding with feature development.

### Context

The Mermaid project's comprehensive code review revealed critical security vulnerabilities and quality issues that stemmed from rushing feature development without proper foundations. Key findings included:
- 100% of reviews identified XSS vulnerabilities from unsanitized innerHTML
- 87.5% found missing ESLint configuration
- 75% identified memory leaks from poor event listener management
- Universal agreement on lack of testing infrastructure

These issues mirror potential risks in PROJECT_html if we proceed without addressing them first.

### Alternatives Considered

1. **Continue with original roadmap**
   - Pros: Faster feature delivery
   - Cons: Technical debt, security vulnerabilities, harder to fix later

2. **Security sprints between phases**
   - Pros: Balanced approach
   - Cons: Security as afterthought, inconsistent implementation

3. **Security-first foundation** (Selected)
   - Pros: Prevent issues before they occur, easier long-term maintenance
   - Cons: Delayed feature delivery

### Rationale

A security-first approach was chosen because:
- Mermaid project showed that retrofitting security is exponentially harder
- XSS vulnerabilities in data visualization tools can expose user data
- Memory leaks are critical in long-running visualization sessions
- Test infrastructure is easier to establish early
- ESLint prevents accumulation of code quality issues

### Consequences

**Positive:**
- Prevent XSS attacks through DOMPurify integration
- Establish testing culture from the start
- Avoid memory leaks through proper event management
- Maintain consistent code quality
- Build user trust through security focus

**Negative:**
- 1-week delay in feature development
- Additional complexity in initial setup
- Potential resistance to "overhead"

---

## 2025-07-26: Performance Monitoring from Day One

**ID:** DEC-007
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Tech Lead, Performance Team

### Decision

Implement performance monitoring and optimization strategies from the beginning, including FPS tracking, memory profiling, and replacement of inefficient patterns like JSON.parse(JSON.stringify()).

### Context

Mermaid project reviews consistently identified performance issues:
- JSON.parse(JSON.stringify()) used for state cloning (mentioned in 37.5% of reviews)
- No performance monitoring until issues became severe
- Memory leaks discovered only after user complaints
- Bundle size grew unchecked

### Alternatives Considered

1. **Optimize when needed**
   - Pros: Faster initial development
   - Cons: Hard to find bottlenecks later

2. **Quarterly performance reviews**
   - Pros: Scheduled optimization
   - Cons: Issues accumulate between reviews

3. **Continuous monitoring** (Selected)
   - Pros: Catch issues early, data-driven decisions
   - Cons: Initial setup overhead

### Rationale

Continuous monitoring chosen because:
- Visualization tools are performance-sensitive
- Users expect 60fps interactions
- Memory leaks compound over time
- structuredClone() is a simple fix if caught early

### Consequences

**Positive:**
- Maintain 60fps target from start
- Catch memory leaks immediately
- Data-driven optimization decisions
- Better user experience

**Negative:**
- Additional monitoring code
- Slight performance overhead from monitoring
- Need to establish performance budgets

---

## 2025-07-26: Stability-First Architecture for Personal Use

**ID:** DEC-008
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Developer/Primary User

### Decision

Reframe "Security-First" approach as "Stability-First" with security-ready architecture. Focus on crash prevention, data integrity, and reliability for personal use while building architecture that can accommodate enterprise security features if commercialization happens later.

### Context

Initial roadmap revision emphasized enterprise-grade security features based on Mermaid project analysis. However, as a personal project, the immediate needs are:
- Crash-safe operation with any input
- Data integrity (don't lose user work)
- Memory efficiency for long sessions
- Development safety (catch errors early)

The security concerns for personal use are different from enterprise deployment.

### Alternatives Considered

1. **Full enterprise security now**
   - Pros: Ready for commercialization
   - Cons: Over-engineering, slower development, unnecessary complexity

2. **No security consideration**
   - Pros: Fastest development
   - Cons: Major refactoring if commercialization happens

3. **Security-ready architecture** (Selected)
   - Pros: Easy to add security later, focuses on immediate needs
   - Cons: Requires thoughtful design

### Rationale

Security-ready architecture chosen because:
- Addresses immediate personal use needs (stability, reliability)
- Makes future commercialization 10x easier
- Avoids enterprise security theater
- Focuses developer time on valuable features
- Clear abstraction points for future security additions

### Consequences

**Positive:**
- Faster initial development without security overhead
- Focus on user experience and reliability
- Architecture ready for enterprise features
- No wasted effort on unused security features
- Clear upgrade path if commercialization happens

**Negative:**
- Need to be disciplined about abstraction layers
- Some architectural decisions needed upfront
- Can't claim "enterprise-ready" initially