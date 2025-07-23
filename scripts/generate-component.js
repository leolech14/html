#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Component template
const componentTemplate = `/**
 * {{componentName}} Component
 * Category: {{category}}
 * Version: 1.0.0
 * Created: {{date}}
 * Description: {{description}}
 */

class {{className}} {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            ...this.defaultConfig(),
            ...config
        };
        this.init();
    }
    
    defaultConfig() {
        return {
            // Default configuration
        };
    }
    
    init() {
        this.render();
        this.attachEvents();
    }
    
    render() {
        const html = \`
            <div class="component {{category}}-{{name}}">
                <div class="component-header">
                    <h3 class="component-title">\${this.config.title || '{{componentName}}'}</h3>
                    <div class="component-actions">
                        <!-- Component actions -->
                    </div>
                </div>
                <div class="component-body">
                    <!-- Component content -->
                </div>
            </div>
        \`;
        
        this.container.innerHTML = html;
    }
    
    attachEvents() {
        // Event listeners
    }
    
    update(data) {
        // Update component with new data
    }
    
    destroy() {
        // Cleanup
        this.container.innerHTML = '';
    }
}

// Register component
if (typeof window !== 'undefined' && window.AIInterface) {
    window.AIInterface.registerComponent('{{componentId}}', {{className}});
}

export default {{className}};
`;

// CSS template
const cssTemplate = `/* {{componentName}} Component Styles */

.{{category}}-{{name}} {
    /* Component specific styles */
}

.{{category}}-{{name}} .component-body {
    /* Body styles */
}
`;

// Generate component
function generateComponent(category, name, description) {
    const componentName = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const className = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Component';
    const componentId = `${category}-${name}`;
    const date = new Date().toISOString().split('T')[0];
    
    // Create component directory
    const componentDir = path.join(__dirname, '..', 'src', 'components', category);
    if (!fs.existsSync(componentDir)) {
        fs.mkdirSync(componentDir, { recursive: true });
    }
    
    // Generate JS file
    const jsContent = componentTemplate
        .replace(/{{componentName}}/g, componentName)
        .replace(/{{category}}/g, category)
        .replace(/{{name}}/g, name)
        .replace(/{{className}}/g, className)
        .replace(/{{componentId}}/g, componentId)
        .replace(/{{date}}/g, date)
        .replace(/{{description}}/g, description);
    
    fs.writeFileSync(
        path.join(componentDir, `${category}-${name}.js`),
        jsContent
    );
    
    // Generate CSS file
    const cssContent = cssTemplate
        .replace(/{{componentName}}/g, componentName)
        .replace(/{{category}}/g, category)
        .replace(/{{name}}/g, name);
    
    fs.writeFileSync(
        path.join(componentDir, `${category}-${name}.css`),
        cssContent
    );
    
    // Update registry
    updateRegistry(componentId, category, name, description);
    
    console.log(`✅ Component generated: ${componentId}`);
    console.log(`   📁 Location: src/components/${category}/`);
}

function updateRegistry(componentId, category, name, description) {
    const registryPath = path.join(__dirname, '..', 'src', 'components', 'registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    
    registry.components[componentId] = {
        path: `src/components/${category}/${category}-${name}.js`,
        cssPath: `src/components/${category}/${category}-${name}.css`,
        category: category,
        name: name,
        description: description,
        version: "1.0.0",
        created: new Date().toISOString(),
        dependencies: [],
        usedIn: []
    };
    
    registry.meta.totalComponents++;
    registry.meta.lastUpdated = new Date().toISOString().split('T')[0];
    
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

// CLI handling
const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('Usage: npm run generate:component <category> <name> "<description>"');
    console.log('Example: npm run generate:component chart line-graph "Line chart component"');
    process.exit(1);
}

generateComponent(args[0], args[1], args[2] || 'Component description');