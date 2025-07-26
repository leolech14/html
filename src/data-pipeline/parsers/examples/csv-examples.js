/**
 * CSV Parser Examples
 * Demonstrates usage of the PROJECT_html CSV ingestion system
 * 
 * @module csv-examples
 * @version 1.0.0
 */

import { 
  parseCSV,
  transformCSV,
  ingestCSV,
  CSVParser,
  CSVTransformer 
} from '../index.js';

// Example 1: Basic CSV Parsing
export async function basicCSVExample() {
  console.log('=== Example 1: Basic CSV Parsing ===\n');
  
  const csvData = `name,age,city,salary
John Doe,30,New York,75000
Jane Smith,25,Los Angeles,65000
Bob Johnson,35,Chicago,80000
Alice Brown,28,Houston,70000`;

  const result = parseCSV(csvData);
  
  console.log('Parse Success:', result.valid);
  console.log('Rows:', result.metadata.rows);
  console.log('Columns:', result.metadata.columns);
  console.log('Column Types:', result.metadata.columnTypes);
  console.log('\nFirst Row:', result.data.data[0]);
}

// Example 2: Custom Delimiter and Quote
export async function customDelimiterExample() {
  console.log('\n=== Example 2: Custom Delimiter (Semicolon) ===\n');
  
  const csvData = `product;price;quantity;description
"Laptop Pro";1299.99;15;"High-end laptop; 16GB RAM"
"Mouse Wireless";29.99;50;"Ergonomic design; 2.4GHz"
"Keyboard RGB";89.99;30;"Mechanical; Cherry MX switches"`;

  const parser = new CSVParser({
    delimiter: ';',
    quote: '"'
  });
  
  const result = parser.parse(csvData);
  
  console.log('Products found:', result.data.data.length);
  result.data.data.forEach(product => {
    console.log(`- ${product.product}: $${product.price}`);
  });
}

// Example 3: Time Series Transformation
export async function timeSeriesExample() {
  console.log('\n=== Example 3: Time Series Transformation ===\n');
  
  const csvData = `date,temperature,humidity,pressure
2025-01-01,22.5,65,1013
2025-01-02,23.1,63,1012
2025-01-03,21.8,68,1014
2025-01-04,24.2,61,1011
2025-01-05,25.0,59,1010`;

  // Parse and transform to time series
  const parseResult = parseCSV(csvData);
  const transformResult = await transformCSV(parseResult.data, {
    targetFormat: 'timeSeries',
    dateColumn: 'date',
    valueColumns: ['temperature', 'humidity']
  });

  console.log('Transformation Success:', transformResult.valid);
  console.log('Format:', transformResult.metadata.targetFormat);
  console.log('Chart Title:', transformResult.data.title);
  console.log('Data Points:', transformResult.data.data.length);
  console.log('\nSample Point:', transformResult.data.data[0]);
}

// Example 4: Bar Chart Transformation
export async function barChartExample() {
  console.log('\n=== Example 4: Bar Chart Transformation ===\n');
  
  const csvData = `department,employees,budget
Engineering,45,2500000
Marketing,20,800000
Sales,35,1200000
HR,12,400000
Finance,15,600000`;

  const ingestionResult = await ingestCSV(csvData, {
    transformer: {
      targetFormat: 'bar',
      categoryColumn: 'department',
      valueColumn: 'budget',
      title: 'Department Budgets',
      yLabel: 'Budget ($)'
    }
  });

  console.log('Ingestion Success:', ingestionResult.success);
  console.log('Generated Chart:');
  console.log('- Title:', ingestionResult.data.title);
  console.log('- Categories:', ingestionResult.data.data.length);
  console.log('- Total Budget:', 
    ingestionResult.data.data.reduce((sum, d) => sum + d.value, 0));
}

// Example 5: Pivot Table Transformation
export async function pivotTableExample() {
  console.log('\n=== Example 5: Pivot Table Transformation ===\n');
  
  const csvData = `region,product,quarter,sales
North,Laptop,Q1,150000
North,Laptop,Q2,180000
North,Phone,Q1,120000
North,Phone,Q2,140000
South,Laptop,Q1,130000
South,Laptop,Q2,160000
South,Phone,Q1,110000
South,Phone,Q2,125000
East,Laptop,Q1,140000
East,Laptop,Q2,170000
East,Phone,Q1,100000
East,Phone,Q2,115000`;

  const ingestionResult = await ingestCSV(csvData, {
    transformer: {
      targetFormat: 'pivot',
      rowField: 'region',
      columnField: 'quarter',
      valueField: 'sales',
      aggregation: 'sum'
    }
  });

  console.log('Pivot Table Created:', ingestionResult.success);
  console.log('Rows:', ingestionResult.data.rowValues);
  console.log('Columns:', ingestionResult.data.columnValues);
  console.log('\nPivot Data:');
  Object.entries(ingestionResult.data.data).forEach(([region, quarters]) => {
    console.log(`${region}:`, quarters);
  });
}

// Example 6: Error Handling
export async function errorHandlingExample() {
  console.log('\n=== Example 6: Error Handling ===\n');
  
  // CSV with various issues
  const problematicCSV = `name,age,salary
John,30,50000
Jane,twenty-five,60000
Bob,35
Alice,28,70000,extra-field
"Unclosed quote,40,80000`;

  const result = parseCSV(problematicCSV);
  
  console.log('Parse Success:', result.valid);
  console.log('Errors:', result.errors.length);
  console.log('Warnings:', result.warnings.length);
  
  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach(warning => {
      console.log(`- ${warning.type}: ${warning.message}`);
    });
  }
}

// Example 7: Large Dataset Handling
export async function largeDatasetExample() {
  console.log('\n=== Example 7: Large Dataset Handling ===\n');
  
  // Generate large CSV
  const headers = 'id,timestamp,cpu,memory,disk,network\n';
  const rows = Array.from({ length: 10000 }, (_, i) => {
    const timestamp = new Date(Date.now() - i * 60000).toISOString();
    return `SERVER-${i},${timestamp},${Math.random() * 100},${Math.random() * 16384},${Math.random() * 1000},${Math.random() * 1000}`;
  });
  
  const largeCsv = headers + rows.join('\n');
  
  const startTime = Date.now();
  const result = parseCSV(largeCsv, {
    typeDetection: true,
    maxRows: 5000 // Limit for demo
  });
  const parseTime = Date.now() - startTime;
  
  console.log('Parse Time:', parseTime, 'ms');
  console.log('Rows Parsed:', result.metadata.rows);
  console.log('Data Size:', new Blob([largeCsv]).size, 'bytes');
  console.log('Warnings:', result.warnings.length);
}

// Example 8: Auto Format Detection
export async function autoDetectExample() {
  console.log('\n=== Example 8: Auto Format Detection ===\n');
  
  const samples = {
    comma: 'name,age,city\nJohn,30,NYC',
    semicolon: 'name;age;city\nJohn;30;NYC',
    tab: 'name\tage\tcity\nJohn\t30\tNYC',
    pipe: 'name|age|city\nJohn|30|NYC'
  };
  
  for (const [name, sample] of Object.entries(samples)) {
    const detected = await CSVParser.detectFormat(sample);
    console.log(`${name}: delimiter='${detected.delimiter}'`);
  }
}

// Example 9: Complete Ingestion Pipeline
export async function completeIngestionExample() {
  console.log('\n=== Example 9: Complete Ingestion Pipeline ===\n');
  
  const salesData = `month,region,product,units,revenue
2025-01,North,Widget A,120,24000
2025-01,North,Widget B,80,12000
2025-01,South,Widget A,100,20000
2025-01,South,Widget B,90,13500
2025-02,North,Widget A,130,26000
2025-02,North,Widget B,85,12750
2025-02,South,Widget A,110,22000
2025-02,South,Widget B,95,14250`;

  // Ingest with multiple transformations
  const formats = ['timeSeries', 'bar', 'pivot', 'table'];
  
  for (const format of formats) {
    console.log(`\nTransforming to ${format}:`);
    
    const options = {
      transformer: { targetFormat: format }
    };
    
    // Add format-specific options
    if (format === 'timeSeries') {
      options.transformer.dateColumn = 'month';
      options.transformer.valueColumns = ['revenue'];
    } else if (format === 'bar') {
      options.transformer.categoryColumn = 'product';
      options.transformer.valueColumn = 'revenue';
      options.transformer.aggregation = 'sum';
    } else if (format === 'pivot') {
      options.transformer.rowField = 'region';
      options.transformer.columnField = 'product';
      options.transformer.valueField = 'revenue';
    }
    
    const result = await ingestCSV(salesData, options);
    console.log('- Success:', result.success);
    console.log('- Data Type:', result.data?.type || result.format);
  }
}

// Example 10: Streaming CSV (mock example)
export async function streamingExample() {
  console.log('\n=== Example 10: Streaming CSV Processing ===\n');
  
  // Simulate a stream with chunks
  const chunks = [
    'name,department,',
    'salary,start_date\n',
    'John Doe,Engineering,',
    '95000,2020-01-15\n',
    'Jane Smith,Marketing,',
    '75000,2021-03-20\n'
  ];
  
  // Concatenate chunks (in real scenario, this would be a stream)
  const fullCsv = chunks.join('');
  
  const result = parseCSV(fullCsv);
  console.log('Stream Processing Complete');
  console.log('Employees:', result.data.data.length);
  console.log('Departments:', 
    [...new Set(result.data.data.map(r => r.department))]);
}

// Run all examples
export async function runAllExamples() {
  await basicCSVExample();
  await customDelimiterExample();
  await timeSeriesExample();
  await barChartExample();
  await pivotTableExample();
  await errorHandlingExample();
  await largeDatasetExample();
  await autoDetectExample();
  await completeIngestionExample();
  await streamingExample();
}

// Export individual examples
export default {
  basic: basicCSVExample,
  customDelimiter: customDelimiterExample,
  timeSeries: timeSeriesExample,
  barChart: barChartExample,
  pivotTable: pivotTableExample,
  errorHandling: errorHandlingExample,
  largeDataset: largeDatasetExample,
  autoDetect: autoDetectExample,
  completeIngestion: completeIngestionExample,
  streaming: streamingExample,
  runAll: runAllExamples
};