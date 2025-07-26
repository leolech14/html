/**
 * JSON Validation Examples
 * Demonstrates usage of the PROJECT_html data validation system
 * 
 * @module validation-examples
 * @version 1.0.0
 */

import { 
  validateData, 
  validateJSON, 
  JSONValidator,
  chartSchemas,
  ErrorFormatter,
  registerCustomSchema,
  registerCustomRule
} from '../index.js';

// Example 1: Basic JSON Validation
export async function basicValidationExample() {
  console.log('=== Example 1: Basic JSON Validation ===\n');
  
  const jsonString = `{
    "name": "Sales Data",
    "period": "Q1 2025",
    "totalSales": 125000,
    "categories": ["Electronics", "Clothing", "Food"]
  }`;
  
  const result = validateJSON(jsonString);
  
  console.log('Valid:', result.valid);
  console.log('Metadata:', result.metadata);
  
  if (!result.valid) {
    console.log('Errors:', result.errors);
  }
}

// Example 2: Schema-Based Validation
export async function schemaValidationExample() {
  console.log('\n=== Example 2: Schema-Based Validation ===\n');
  
  // Custom schema for product data
  const productSchema = {
    type: 'object',
    required: ['id', 'name', 'price'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string', minLength: 3 },
      price: { type: 'number', minimum: 0 },
      category: { 
        type: 'string', 
        enum: ['Electronics', 'Clothing', 'Food', 'Other'] 
      },
      inStock: { type: 'boolean' }
    },
    additionalProperties: false
  };
  
  const productData = {
    id: "PROD-001",
    name: "Laptop",
    price: 999.99,
    category: "Electronics",
    inStock: true,
    discount: 10 // This will trigger a warning
  };
  
  const result = validateJSON(productData, productSchema);
  console.log('Validation Result:', result.valid);
  
  if (result.warnings.length > 0) {
    console.log('Warnings:', result.warnings);
  }
}

// Example 3: Time Series Data Validation
export async function timeSeriesValidationExample() {
  console.log('\n=== Example 3: Time Series Data Validation ===\n');
  
  const timeSeriesData = {
    title: "Website Traffic",
    subtitle: "Daily visits for January 2025",
    data: [
      { timestamp: "2025-01-01", value: 1250 },
      { timestamp: "2025-01-02", value: 1380 },
      { timestamp: "2025-01-03", value: 1290 },
      { timestamp: "2025-01-04", value: 1450 },
      { timestamp: "2025-01-05", value: 1680 }
    ],
    xAxis: { label: "Date", type: "time" },
    yAxis: { label: "Visitors", min: 0 }
  };
  
  // Validate with automatic format detection
  const result = await validateData(timeSeriesData);
  
  console.log('Format Detected:', result.data?.visualizationHints?.dataFormat);
  console.log('Recommended Charts:', result.data?.visualizationHints?.recommendedCharts);
  console.log('Valid:', result.valid);
}

// Example 4: Bar Chart Data Validation
export async function barChartValidationExample() {
  console.log('\n=== Example 4: Bar Chart Data Validation ===\n');
  
  const barChartData = {
    title: "Sales by Category",
    data: [
      { category: "Electronics", value: 45000 },
      { category: "Clothing", value: 32000 },
      { category: "Food", value: 28000 },
      { category: "Books", value: 15000 }
    ],
    xAxis: { label: "Category" },
    yAxis: { label: "Sales ($)" }
  };
  
  // Validate with specific format
  const result = await validateData(barChartData, {
    format: { type: 'chart', subtype: 'bar' }
  });
  
  console.log('Valid:', result.valid);
  console.log('Chart Type Validation:', result.valid ? 'Passed' : 'Failed');
}

// Example 5: Error Handling and Reporting
export async function errorHandlingExample() {
  console.log('\n=== Example 5: Error Handling and Reporting ===\n');
  
  // Intentionally malformed JSON
  const malformedJSON = `{
    "title": "Sales Report",
    "data": [
      { "month": "January", "sales": 10000 },
      { "month": "February", "sales": 12000 }
      { "month": "March", "sales": 15000 }  // Missing comma
    ]
  }`;
  
  const result = validateJSON(malformedJSON);
  
  if (!result.valid) {
    // Generate formatted error report
    console.log(result.report());
  }
}

// Example 6: Custom Validation Rules
export async function customRulesExample() {
  console.log('\n=== Example 6: Custom Validation Rules ===\n');
  
  // Register a custom validation rule
  registerCustomRule({
    name: 'salesThreshold',
    message: 'Sales value must be between 1000 and 1000000',
    validate: (data) => {
      if (data.sales) {
        return data.sales >= 1000 && data.sales <= 1000000;
      }
      return true;
    }
  });
  
  const salesData = {
    region: "North",
    sales: 500, // Below threshold
    quarter: "Q1"
  };
  
  const result = await validateData(salesData, {
    rules: ['salesThreshold']
  });
  
  console.log('Valid:', result.valid);
  if (!result.valid) {
    console.log('Rule Violations:', result.errors);
  }
}

// Example 7: Hierarchical Data Validation
export async function hierarchicalDataExample() {
  console.log('\n=== Example 7: Hierarchical Data Validation ===\n');
  
  const orgChart = {
    name: "CEO",
    title: "Chief Executive Officer",
    children: [
      {
        name: "CTO",
        title: "Chief Technology Officer",
        children: [
          { name: "Dev Manager", title: "Development Manager" },
          { name: "QA Manager", title: "Quality Assurance Manager" }
        ]
      },
      {
        name: "CFO",
        title: "Chief Financial Officer",
        children: [
          { name: "Controller", title: "Financial Controller" }
        ]
      }
    ]
  };
  
  const result = await validateData(orgChart);
  
  console.log('Format Detected:', result.data?.visualizationHints?.dataFormat);
  console.log('Valid:', result.valid);
  console.log('Structure Depth:', result.metadata?.depth);
}

// Example 8: Large Dataset Validation
export async function largeDatasetExample() {
  console.log('\n=== Example 8: Large Dataset Validation ===\n');
  
  // Generate large dataset
  const largeData = {
    title: "Performance Metrics",
    data: Array.from({ length: 10000 }, (_, i) => ({
      id: `METRIC-${i}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      cpu: Math.random() * 100,
      memory: Math.random() * 8192,
      disk: Math.random() * 1000
    }))
  };
  
  const validator = new JSONValidator({
    maxSize: 50 * 1024 * 1024, // 50MB limit
    maxDepth: 50
  });
  
  const startTime = Date.now();
  const result = validator.validate(largeData);
  const duration = Date.now() - startTime;
  
  console.log('Dataset Size:', result.metadata.size, 'bytes');
  console.log('Validation Time:', duration, 'ms');
  console.log('Valid:', result.valid);
}

// Example 9: Custom Schema Registration
export async function customSchemaExample() {
  console.log('\n=== Example 9: Custom Schema Registration ===\n');
  
  // Register a custom dashboard schema
  const dashboardSchema = {
    type: 'object',
    required: ['title', 'widgets'],
    properties: {
      title: { type: 'string' },
      theme: { 
        type: 'string', 
        enum: ['light', 'dark', 'auto'] 
      },
      widgets: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['type', 'position', 'data'],
          properties: {
            type: { 
              type: 'string',
              enum: ['chart', 'table', 'metric', 'text']
            },
            position: {
              type: 'object',
              required: ['x', 'y', 'width', 'height'],
              properties: {
                x: { type: 'number', minimum: 0 },
                y: { type: 'number', minimum: 0 },
                width: { type: 'number', minimum: 1, maximum: 12 },
                height: { type: 'number', minimum: 1, maximum: 12 }
              }
            },
            data: { type: 'object' }
          }
        }
      }
    }
  };
  
  registerCustomSchema('dashboard', 'grid', dashboardSchema);
  
  const dashboardData = {
    title: "Sales Dashboard",
    theme: "dark",
    widgets: [
      {
        type: "metric",
        position: { x: 0, y: 0, width: 3, height: 2 },
        data: { label: "Total Sales", value: 125000 }
      },
      {
        type: "chart",
        position: { x: 3, y: 0, width: 9, height: 4 },
        data: { type: "line", title: "Sales Trend" }
      }
    ]
  };
  
  const result = await validateData(dashboardData, {
    format: { type: 'dashboard', subtype: 'grid' }
  });
  
  console.log('Dashboard Valid:', result.valid);
}

// Example 10: Error Formatter Customization
export async function errorFormatterExample() {
  console.log('\n=== Example 10: Error Formatter Customization ===\n');
  
  const formatter = new ErrorFormatter({
    includeContext: true,
    includeHints: true,
    colorize: false,
    locale: 'en'
  });
  
  const invalidData = {
    title: "Report",
    data: {
      nested: {
        deep: {
          deeper: {
            value: "This nesting is too deep"
          }
        }
      }
    }
  };
  
  const validator = new JSONValidator({ maxDepth: 3 });
  const result = validator.validate(invalidData);
  
  if (!result.valid) {
    const formatted = formatter.formatValidationResults(result);
    console.log('Formatted Summary:', formatted.summary);
    console.log('Formatted Errors:', formatted.errors);
    
    // Generate HTML report
    const htmlReport = formatter.generateReport(result, 'html');
    console.log('\nHTML Report Generated (preview):', 
      htmlReport.substring(0, 200) + '...');
  }
}

// Run all examples
export async function runAllExamples() {
  await basicValidationExample();
  await schemaValidationExample();
  await timeSeriesValidationExample();
  await barChartValidationExample();
  await errorHandlingExample();
  await customRulesExample();
  await hierarchicalDataExample();
  await largeDatasetExample();
  await customSchemaExample();
  await errorFormatterExample();
}

// Export individual examples for selective use
export default {
  basicValidation: basicValidationExample,
  schemaValidation: schemaValidationExample,
  timeSeries: timeSeriesValidationExample,
  barChart: barChartValidationExample,
  errorHandling: errorHandlingExample,
  customRules: customRulesExample,
  hierarchical: hierarchicalDataExample,
  largeDataset: largeDatasetExample,
  customSchema: customSchemaExample,
  errorFormatter: errorFormatterExample,
  runAll: runAllExamples
};