/**
 * CSV Parser Module
 * Converts CSV data to JSON for visualization pipeline
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module csv-parser
 * @version 1.0.0
 */

/**
 * CSV Parser Options
 */
const DEFAULT_OPTIONS = {
  delimiter: ',',
  quote: '"',
  escape: '"',
  newline: 'auto', // auto-detect, or specify '\n', '\r\n', '\r'
  header: true, // first row contains headers
  skipEmptyLines: true,
  skipComments: false,
  comment: '#',
  trim: true,
  encoding: 'utf-8',
  maxRows: null,
  maxColumns: 1000,
  typeDetection: true,
  dateFormats: [
    'YYYY-MM-DD',
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY-MM-DD HH:mm:ss'
  ],
  nullValues: ['', 'null', 'NULL', 'N/A', 'n/a', 'NA', 'na', '-']
};

/**
 * CSV Parser Class
 */
export class CSVParser {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.errors = [];
    this.warnings = [];
    this.metadata = {
      rows: 0,
      columns: 0,
      headers: [],
      columnTypes: {},
      parseTime: 0
    };
  }

  /**
   * Parse CSV string or file
   * @param {string|Buffer} input - CSV data
   * @returns {object} Parsed result with data and metadata
   */
  parse(input) {
    const startTime = Date.now();
    this.reset();

    try {
      // Convert Buffer to string if needed
      const csvString = input instanceof Buffer ? 
        input.toString(this.options.encoding) : input;

      // Normalize line endings
      const normalizedCsv = this.normalizeLineEndings(csvString);

      // Parse CSV structure
      const { headers, rows } = this.parseStructure(normalizedCsv);
      
      // Process data
      const data = this.processRows(headers, rows);

      // Detect column types if enabled
      if (this.options.typeDetection && data.length > 0) {
        this.detectColumnTypes(headers, data);
      }

      // Calculate metadata
      this.metadata.parseTime = Date.now() - startTime;
      this.metadata.rows = data.length;
      this.metadata.columns = headers.length;
      this.metadata.headers = headers;

      return {
        valid: this.errors.length === 0,
        data: this.transformToJSON(headers, data),
        metadata: this.metadata,
        errors: this.errors,
        warnings: this.warnings
      };

    } catch (error) {
      this.errors.push({
        type: 'PARSE_ERROR',
        message: error.message,
        line: error.line || null
      });

      return {
        valid: false,
        data: null,
        metadata: this.metadata,
        errors: this.errors,
        warnings: this.warnings
      };
    }
  }

  /**
   * Parse CSV from file path
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<object>} Parsed result
   */
  async parseFile(filePath) {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, this.options.encoding);
      return this.parse(content);
    } catch (error) {
      this.errors.push({
        type: 'FILE_ERROR',
        message: `Failed to read file: ${error.message}`,
        path: filePath
      });

      return {
        valid: false,
        data: null,
        metadata: this.metadata,
        errors: this.errors,
        warnings: this.warnings
      };
    }
  }

  /**
   * Parse CSV from stream
   * @param {ReadableStream} stream - Input stream
   * @returns {Promise<object>} Parsed result
   */
  async parseStream(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let rowCount = 0;
      
      stream.on('data', chunk => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        const csvData = Buffer.concat(chunks).toString(this.options.encoding);
        const result = this.parse(csvData);
        resolve(result);
      });

      stream.on('error', error => {
        this.errors.push({
          type: 'STREAM_ERROR',
          message: error.message
        });
        reject({
          valid: false,
          data: null,
          errors: this.errors
        });
      });
    });
  }

  /**
   * Normalize line endings
   */
  normalizeLineEndings(csvString) {
    if (this.options.newline === 'auto') {
      // Detect line ending
      const crlf = csvString.includes('\r\n');
      const lf = csvString.includes('\n');
      const cr = csvString.includes('\r');

      if (crlf) {
        this.metadata.detectedNewline = '\\r\\n';
        return csvString;
      } else if (lf) {
        this.metadata.detectedNewline = '\\n';
        return csvString.replace(/\r/g, '');
      } else if (cr) {
        this.metadata.detectedNewline = '\\r';
        return csvString.replace(/\r/g, '\n');
      }
    }

    // Use specified newline
    return csvString.replace(/\r\n|\r|\n/g, '\n');
  }

  /**
   * Parse CSV structure
   */
  parseStructure(csvString) {
    const lines = csvString.split('\n');
    let headers = [];
    const rows = [];
    let inQuotes = false;
    let currentRow = [];
    let currentField = '';
    let lineNumber = 0;

    for (let line of lines) {
      lineNumber++;

      // Skip empty lines if configured
      if (this.options.skipEmptyLines && line.trim() === '') {
        continue;
      }

      // Skip comments if configured
      if (this.options.skipComments && line.startsWith(this.options.comment)) {
        continue;
      }

      // Process each character
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === this.options.quote) {
          if (inQuotes && nextChar === this.options.quote) {
            // Escaped quote
            currentField += char;
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === this.options.delimiter && !inQuotes) {
          // Field separator
          currentRow.push(this.processField(currentField));
          currentField = '';
        } else {
          currentField += char;
        }
      }

      // End of line
      if (!inQuotes) {
        currentRow.push(this.processField(currentField));
        
        if (this.options.header && headers.length === 0) {
          headers = currentRow;
          this.validateHeaders(headers, lineNumber);
        } else {
          if (this.options.maxRows && rows.length >= this.options.maxRows) {
            this.warnings.push({
              type: 'MAX_ROWS_REACHED',
              message: `Maximum row limit (${this.options.maxRows}) reached`,
              line: lineNumber
            });
            break;
          }
          rows.push(currentRow);
        }

        currentRow = [];
        currentField = '';
      } else {
        // Multi-line field
        currentField += '\n';
      }
    }

    // Check for unclosed quotes
    if (inQuotes) {
      this.errors.push({
        type: 'UNCLOSED_QUOTE',
        message: 'Unclosed quote in CSV',
        line: lineNumber
      });
    }

    // If no headers and header option is false, generate headers
    if (!this.options.header || headers.length === 0) {
      const maxColumns = Math.max(...rows.map(row => row.length));
      headers = Array.from({ length: maxColumns }, (_, i) => `column_${i + 1}`);
    }

    return { headers, rows };
  }

  /**
   * Process individual field
   */
  processField(field) {
    if (this.options.trim) {
      field = field.trim();
    }

    // Check for null values
    if (this.options.nullValues.includes(field)) {
      return null;
    }

    return field;
  }

  /**
   * Validate headers
   */
  validateHeaders(headers, lineNumber) {
    // Check for duplicate headers
    const seen = new Set();
    const duplicates = [];

    headers.forEach((header, index) => {
      if (seen.has(header)) {
        duplicates.push(header);
      }
      seen.add(header);
    });

    if (duplicates.length > 0) {
      this.warnings.push({
        type: 'DUPLICATE_HEADERS',
        message: `Duplicate column names found: ${duplicates.join(', ')}`,
        line: lineNumber,
        headers: duplicates
      });
    }

    // Check for empty headers
    const emptyIndices = headers
      .map((h, i) => h === '' ? i : null)
      .filter(i => i !== null);

    if (emptyIndices.length > 0) {
      this.warnings.push({
        type: 'EMPTY_HEADERS',
        message: `Empty column names at positions: ${emptyIndices.join(', ')}`,
        line: lineNumber,
        indices: emptyIndices
      });

      // Generate names for empty headers
      emptyIndices.forEach(index => {
        headers[index] = `column_${index + 1}`;
      });
    }

    // Check column limit
    if (headers.length > this.options.maxColumns) {
      this.errors.push({
        type: 'TOO_MANY_COLUMNS',
        message: `Column count (${headers.length}) exceeds maximum (${this.options.maxColumns})`,
        line: lineNumber
      });
    }
  }

  /**
   * Process rows
   */
  processRows(headers, rows) {
    const processedRows = [];
    const columnCount = headers.length;

    rows.forEach((row, index) => {
      const lineNumber = this.options.header ? index + 2 : index + 1;

      // Validate column count
      if (row.length !== columnCount) {
        this.warnings.push({
          type: 'COLUMN_MISMATCH',
          message: `Row has ${row.length} columns, expected ${columnCount}`,
          line: lineNumber,
          expected: columnCount,
          actual: row.length
        });

        // Pad or trim row
        if (row.length < columnCount) {
          row = [...row, ...Array(columnCount - row.length).fill(null)];
        } else {
          row = row.slice(0, columnCount);
        }
      }

      processedRows.push(row);
    });

    return processedRows;
  }

  /**
   * Detect column types
   */
  detectColumnTypes(headers, data) {
    const sampleSize = Math.min(100, data.length);
    const samples = data.slice(0, sampleSize);

    headers.forEach((header, index) => {
      const values = samples
        .map(row => row[index])
        .filter(val => val !== null && val !== '');

      if (values.length === 0) {
        this.metadata.columnTypes[header] = 'null';
        return;
      }

      // Detect type
      const type = this.detectType(values);
      this.metadata.columnTypes[header] = type;

      // Type-specific metadata
      if (type === 'number') {
        const numbers = values.map(v => this.parseNumber(v)).filter(n => n !== null);
        if (numbers.length > 0) {
          this.metadata.columnTypes[`${header}_stats`] = {
            min: Math.min(...numbers),
            max: Math.max(...numbers),
            avg: numbers.reduce((a, b) => a + b, 0) / numbers.length
          };
        }
      }
    });
  }

  /**
   * Detect value type
   */
  detectType(values) {
    const types = {
      boolean: 0,
      number: 0,
      date: 0,
      string: 0
    };

    values.forEach(value => {
      if (this.isBoolean(value)) {
        types.boolean++;
      } else if (this.isNumber(value)) {
        types.number++;
      } else if (this.isDate(value)) {
        types.date++;
      } else {
        types.string++;
      }
    });

    // Return most common type (with threshold)
    const total = values.length;
    if (types.boolean / total > 0.9) return 'boolean';
    if (types.number / total > 0.9) return 'number';
    if (types.date / total > 0.9) return 'date';
    return 'string';
  }

  /**
   * Type checking methods
   */
  isBoolean(value) {
    const booleanValues = ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'];
    return booleanValues.includes(value.toString().toLowerCase());
  }

  isNumber(value) {
    // Handle various number formats
    const cleaned = value.toString()
      .replace(/,/g, '') // Remove thousand separators
      .replace(/^\$/, '') // Remove currency symbols
      .replace(/%$/, ''); // Remove percentage
    
    return !isNaN(cleaned) && cleaned !== '';
  }

  isDate(value) {
    // Check common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/ // ISO datetime
    ];

    return datePatterns.some(pattern => pattern.test(value.toString()));
  }

  /**
   * Parse number value
   */
  parseNumber(value) {
    if (value === null || value === '') return null;
    
    const cleaned = value.toString()
      .replace(/,/g, '')
      .replace(/^\$/, '')
      .replace(/%$/, '');
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  /**
   * Parse boolean value
   */
  parseBoolean(value) {
    if (value === null) return null;
    
    const lower = value.toString().toLowerCase();
    const trueValues = ['true', '1', 'yes', 'y'];
    const falseValues = ['false', '0', 'no', 'n'];
    
    if (trueValues.includes(lower)) return true;
    if (falseValues.includes(lower)) return false;
    return value;
  }

  /**
   * Transform rows to JSON
   */
  transformToJSON(headers, rows) {
    const result = {
      type: 'csv',
      headers: headers,
      data: [],
      raw: rows
    };

    // Transform to array of objects
    result.data = rows.map((row, rowIndex) => {
      const obj = {};
      headers.forEach((header, colIndex) => {
        let value = row[colIndex];

        // Apply type conversion if detected
        if (this.options.typeDetection && this.metadata.columnTypes[header]) {
          const type = this.metadata.columnTypes[header];
          
          switch (type) {
            case 'number':
              value = this.parseNumber(value);
              break;
            case 'boolean':
              value = this.parseBoolean(value);
              break;
            case 'date':
              // Keep as string for now, let visualization layer handle
              break;
          }
        }

        obj[header] = value;
      });
      return obj;
    });

    // Add visualization hints
    result.visualizationHints = this.generateVisualizationHints(result.data);

    return result;
  }

  /**
   * Generate visualization hints
   */
  generateVisualizationHints(data) {
    const hints = {
      recommendedCharts: [],
      dataFormat: 'tabular',
      suggestions: []
    };

    if (data.length === 0) return hints;

    const types = this.metadata.columnTypes;
    const headers = this.metadata.headers;

    // Count column types
    const typeCount = {
      number: 0,
      date: 0,
      string: 0,
      boolean: 0
    };

    Object.values(types).forEach(type => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Suggest visualizations based on data shape
    if (typeCount.date >= 1 && typeCount.number >= 1) {
      hints.recommendedCharts.push('line', 'area');
      hints.suggestions.push('Time series data detected - consider line or area charts');
    }

    if (typeCount.string >= 1 && typeCount.number >= 1) {
      hints.recommendedCharts.push('bar', 'pie');
      hints.suggestions.push('Categorical data detected - consider bar or pie charts');
    }

    if (typeCount.number >= 2) {
      hints.recommendedCharts.push('scatter', 'heatmap');
      hints.suggestions.push('Multiple numeric columns - consider scatter plots or heatmaps');
    }

    // Always suggest table for CSV data
    hints.recommendedCharts.push('table');

    return hints;
  }

  /**
   * Reset parser state
   */
  reset() {
    this.errors = [];
    this.warnings = [];
    this.metadata = {
      rows: 0,
      columns: 0,
      headers: [],
      columnTypes: {},
      parseTime: 0
    };
  }

  /**
   * Auto-detect CSV format
   */
  static async detectFormat(sample, options = {}) {
    const detectedFormat = {
      delimiter: ',',
      quote: '"',
      hasHeader: true,
      encoding: 'utf-8'
    };

    // Detect delimiter
    const delimiters = [',', ';', '\t', '|'];
    const delimiterCounts = {};
    
    delimiters.forEach(delim => {
      delimiterCounts[delim] = (sample.match(new RegExp(delim, 'g')) || []).length;
    });

    detectedFormat.delimiter = Object.entries(delimiterCounts)
      .reduce((a, b) => delimiterCounts[a] > delimiterCounts[b] ? a : b);

    // Detect quote character
    if (sample.includes('"')) {
      detectedFormat.quote = '"';
    } else if (sample.includes("'")) {
      detectedFormat.quote = "'";
    }

    // Detect header (simple heuristic)
    const firstLine = sample.split(/\r?\n/)[0];
    const hasNumbers = /\d/.test(firstLine);
    detectedFormat.hasHeader = !hasNumbers;

    return detectedFormat;
  }
}

// Export singleton instance
export const csvParser = new CSVParser();

// Export convenience function
export default function parseCSV(input, options = {}) {
  const parser = new CSVParser(options);
  return parser.parse(input);
}