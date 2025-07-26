# JSON Validation System

Part of PROJECT_html's Universal Data Ingestion Pipeline

## Overview

The JSON Validation System provides comprehensive validation for data entering the PROJECT_html visualization pipeline. It supports:

- **Schema-based validation** using JSON Schema
- **Automatic format detection** for visualization types
- **Custom validation rules** for business logic
- **Detailed error reporting** with hints and suggestions
- **Performance optimization** for large datasets

## Quick Start

```javascript
import { validateData, validateJSON } from './validators/index.js';

// Basic JSON validation
const result = validateJSON('{"name": "Test", "value": 123}');
console.log(result.valid); // true

// Validate with automatic format detection
const chartData = {
  title: "Sales Data",
  data: [
    { category: "Q1", value: 10000 },
    { category: "Q2", value: 15000 }
  ]
};

const validation = await validateData(chartData);
console.log(validation.formatted.summary);
```

## Core Components

### 1. JSONValidator

The foundation of the validation system, handling:
- JSON parsing with error recovery
- Structure validation (depth, circular references)
- Schema validation
- Data normalization

```javascript
import { JSONValidator } from './validators/json-validator.js';

const validator = new JSONValidator({
  strictMode: true,
  maxDepth: 50,
  maxSize: 10 * 1024 * 1024 // 10MB
});

const result = validator.validate(data, schema);
```

### 2. Schema Library

Pre-built schemas for common visualization types:

#### Chart Schemas
- `timeSeries` - Line, area charts with temporal data
- `bar` - Vertical/horizontal bar charts
- `pie` - Pie and donut charts
- `scatter` - Scatter plots and bubble charts
- `heatmap` - Heat map visualizations
- `multiSeries` - Multi-series composite charts

#### Hierarchy Schemas
- `tree` - Tree structures
- `mindMap` - Mind mapping data
- `network` - Network graphs
- `sankey` - Sankey diagrams

#### Table Schemas
- `basic` - Simple tabular data
- `pivot` - Pivot table structures
- `dataGrid` - Interactive data grids
- `matrix` - Matrix visualizations

### 3. DataValidator

High-level validation interface with automatic format detection:

```javascript
import { DataValidator } from './validators/index.js';

const validator = new DataValidator();

// Automatic format detection
const result = await validator.validate(data);

// Explicit format specification
const result = await validator.validate(data, {
  format: { type: 'chart', subtype: 'timeSeries' }
});
```

### 4. Error Formatter

User-friendly error messages and reporting:

```javascript
import { ErrorFormatter } from './validators/error-formatter.js';

const formatter = new ErrorFormatter({
  includeContext: true,
  includeHints: true
});

// Generate reports
const textReport = formatter.generateReport(result, 'text');
const htmlReport = formatter.generateReport(result, 'html');
```

## Usage Examples

### Basic Validation

```javascript
import { validateJSON } from './validators/index.js';

const jsonString = '{"name": "Product", "price": 29.99}';
const result = validateJSON(jsonString);

if (result.valid) {
  console.log('Valid JSON:', result.data);
} else {
  console.log('Errors:', result.errors);
}
```

### Schema Validation

```javascript
const productSchema = {
  type: 'object',
  required: ['id', 'name', 'price'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string', minLength: 3 },
    price: { type: 'number', minimum: 0 }
  }
};

const result = validateJSON(productData, productSchema);
```

### Time Series Validation

```javascript
import { validateData } from './validators/index.js';

const timeSeriesData = {
  title: "Temperature Readings",
  data: [
    { timestamp: "2025-01-01T00:00:00Z", value: 22.5 },
    { timestamp: "2025-01-01T01:00:00Z", value: 23.1 }
  ]
};

const result = await validateData(timeSeriesData);
console.log('Detected format:', result.data.visualizationHints.dataFormat);
```

### Custom Validation Rules

```javascript
import { registerCustomRule, validateData } from './validators/index.js';

// Register custom rule
registerCustomRule({
  name: 'priceRange',
  message: 'Price must be between $10 and $1000',
  validate: (data) => {
    return data.price >= 10 && data.price <= 1000;
  }
});

// Use custom rule
const result = await validateData(productData, {
  rules: ['priceRange']
});
```

### Error Reporting

```javascript
const result = validateJSON(malformedJSON);

if (!result.valid) {
  // Get formatted error report
  console.log(result.report());
  
  // Get HTML report for display
  const htmlReport = result.htmlReport();
  
  // Access formatted results
  console.log('Summary:', result.formatted.summary);
  console.log('Errors:', result.formatted.errors);
  console.log('Hints:', result.formatted.hints);
}
```

## Advanced Features

### Performance Options

```javascript
const validator = new JSONValidator({
  maxDepth: 100,        // Maximum nesting depth
  maxSize: 50000000,    // 50MB limit
  strictMode: false,    // Relaxed validation
  allowComments: true   // Strip comments before parsing
});
```

### Custom Schema Registration

```javascript
import { registerCustomSchema } from './validators/index.js';

const dashboardSchema = {
  type: 'object',
  required: ['widgets'],
  properties: {
    widgets: {
      type: 'array',
      items: { /* widget schema */ }
    }
  }
};

registerCustomSchema('dashboard', 'grid', dashboardSchema);
```

### Validation Metadata

```javascript
const result = await validateData(data);

console.log('Metadata:', {
  size: result.metadata.size,
  depth: result.metadata.depth,
  keyCount: result.metadata.keyCount,
  validationTime: result.metadata.validationTime
});
```

## Error Types

The system recognizes and handles various error types:

- **Syntax Errors**: JSON parsing failures
- **Schema Errors**: Type mismatches, missing required fields
- **Constraint Errors**: Size limits, depth limits, circular references
- **Data Quality**: Invalid formats, business rule violations

## Integration with PROJECT_html

The validation system integrates seamlessly with the visualization pipeline:

1. **Data Ingestion**: Validates incoming data
2. **Format Detection**: Identifies visualization type
3. **Schema Validation**: Ensures data matches component requirements
4. **Error Handling**: Provides user-friendly feedback
5. **Data Normalization**: Prepares data for visualization

## Best Practices

1. **Always validate external data** before processing
2. **Use schemas** for structured data validation
3. **Provide meaningful error messages** to users
4. **Set appropriate limits** for your use case
5. **Handle validation failures gracefully**

## API Reference

### validateJSON(input, schema?, options?)
Validates JSON string or object.

### validateData(data, options?)
High-level validation with format detection.

### JSONValidator
Core validation class with detailed options.

### DataValidator
Unified validator with schema management.

### ErrorFormatter
Formats errors for display.

### Schema Registry
- `chartSchemas` - Chart visualization schemas
- `hierarchySchemas` - Hierarchical data schemas
- `tableSchemas` - Tabular data schemas

## Performance Considerations

- Large datasets: Use appropriate `maxSize` limits
- Deep nesting: Configure `maxDepth` based on needs
- Streaming: For very large files, consider streaming validation
- Caching: Schema compilation is cached for performance

## Future Enhancements

- [ ] CSV validation support
- [ ] Markdown data extraction
- [ ] Vector store integration
- [ ] Streaming validation for large files
- [ ] Schema versioning support