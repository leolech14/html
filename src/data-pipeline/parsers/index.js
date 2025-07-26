/**
 * Data Pipeline Parsers
 * Main entry point for data parsing modules
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module parsers
 * @version 1.0.0
 */

// CSV Parser modules
export { CSVParser, csvParser, default as parseCSV } from './csv-parser.js';
export { CSVTransformer, csvTransformer, default as transformCSV } from './csv-transformer.js';
export { CSVIngestion, csvIngestion, ingestCSV, ingestCSVFile, ingestCSVURL } from './csv-ingestion.js';

// Future parsers will be added here:
// export { MarkdownParser } from './markdown-parser.js';
// export { VectorStoreConnector } from './vector-store-connector.js';
// export { APIFetcher } from './api-fetcher.js';

/**
 * Universal Data Ingestion Interface
 * Detects and processes various data formats
 */
export class DataIngestion {
  constructor(options = {}) {
    this.options = options;
    this.parsers = {
      csv: new CSVIngestion(options.csv),
      // markdown: new MarkdownParser(options.markdown),
      // json: direct validation through validators
    };
  }

  /**
   * Ingest data from any supported format
   * @param {any} input - Data input (string, buffer, file, URL)
   * @param {object} options - Ingestion options
   * @returns {Promise<object>} Ingestion result
   */
  async ingest(input, options = {}) {
    const format = options.format || await this.detectFormat(input);
    
    switch (format) {
      case 'csv':
        return this.parsers.csv.ingest(input, options);
      
      case 'json':
        // For JSON, parse and validate directly
        const { validateData } = await import('../validators/index.js');
        try {
          const data = typeof input === 'string' ? JSON.parse(input) : input;
          return {
            success: true,
            data,
            format: 'json',
            validation: await validateData(data, options.validation)
          };
        } catch (error) {
          return {
            success: false,
            errors: [{
              type: 'JSON_PARSE_ERROR',
              message: error.message
            }]
          };
        }
      
      // case 'markdown':
      //   return this.parsers.markdown.ingest(input, options);
      
      default:
        return {
          success: false,
          errors: [{
            type: 'UNSUPPORTED_FORMAT',
            message: `Format '${format}' is not supported`
          }]
        };
    }
  }

  /**
   * Detect data format from input
   * @param {any} input - Data input
   * @returns {Promise<string>} Detected format
   */
  async detectFormat(input) {
    // Convert to string for detection
    let sample;
    if (typeof input === 'string') {
      sample = input.slice(0, 1000); // First 1KB
    } else if (input instanceof Buffer) {
      sample = input.toString('utf-8', 0, 1000);
    } else if (typeof File !== 'undefined' && input instanceof File) {
      sample = await input.slice(0, 1000).text();
    } else {
      return 'json'; // Assume objects are JSON
    }

    // JSON detection
    if (sample.trim().startsWith('{') || sample.trim().startsWith('[')) {
      try {
        JSON.parse(sample);
        return 'json';
      } catch {
        // Not valid JSON, continue checking
      }
    }

    // CSV detection
    const lines = sample.split(/\r?\n/);
    if (lines.length > 1) {
      const delimiters = [',', ';', '\t', '|'];
      for (const delim of delimiters) {
        const firstLineCount = (lines[0].match(new RegExp(delim, 'g')) || []).length;
        const secondLineCount = (lines[1].match(new RegExp(delim, 'g')) || []).length;
        
        if (firstLineCount > 0 && firstLineCount === secondLineCount) {
          return 'csv';
        }
      }
    }

    // Markdown detection
    if (sample.includes('#') || sample.includes('```') || sample.includes('**')) {
      return 'markdown';
    }

    // Default to text
    return 'text';
  }

  /**
   * Get supported formats
   * @returns {object} Supported formats with descriptions
   */
  getSupportedFormats() {
    return {
      csv: {
        name: 'CSV',
        description: 'Comma-separated values',
        extensions: ['.csv', '.tsv'],
        mimeTypes: ['text/csv', 'text/tab-separated-values']
      },
      json: {
        name: 'JSON',
        description: 'JavaScript Object Notation',
        extensions: ['.json'],
        mimeTypes: ['application/json']
      },
      markdown: {
        name: 'Markdown',
        description: 'Markdown with embedded data',
        extensions: ['.md', '.markdown'],
        mimeTypes: ['text/markdown'],
        status: 'coming-soon'
      },
      vectorStore: {
        name: 'Vector Store',
        description: 'Vector database connections',
        providers: ['pinecone', 'chroma', 'qdrant'],
        status: 'coming-soon'
      }
    };
  }
}

// Export singleton instance
export const dataIngestion = new DataIngestion();

// Export convenience function
export async function ingestData(input, options = {}) {
  return dataIngestion.ingest(input, options);
}

export default DataIngestion;