/**
 * CSV Ingestion Module
 * Complete CSV to visualization pipeline
 * Part of PROJECT_html data ingestion system
 * 
 * @module csv-ingestion
 * @version 1.0.0
 */

import { CSVParser } from './csv-parser.js';
import { CSVTransformer } from './csv-transformer.js';
import { validateData } from '../validators/index.js';
import { ErrorFormatter } from '../validators/error-formatter.js';

/**
 * CSV Ingestion Options
 */
const DEFAULT_OPTIONS = {
  // Parser options
  parser: {
    delimiter: ',',
    quote: '"',
    header: true,
    skipEmptyLines: true,
    trim: true,
    typeDetection: true
  },
  // Transformer options
  transformer: {
    autoDetect: true,
    targetFormat: null,
    aggregation: 'sum'
  },
  // Validation options
  validation: {
    enabled: true,
    strict: false
  }
};

/**
 * CSV Ingestion Class
 * Handles complete CSV to visualization pipeline
 */
export class CSVIngestion {
  constructor(options = {}) {
    this.options = this.mergeOptions(DEFAULT_OPTIONS, options);
    this.parser = new CSVParser(this.options.parser);
    this.transformer = new CSVTransformer(this.options.transformer);
    this.errorFormatter = new ErrorFormatter();
  }

  /**
   * Ingest CSV from various sources
   * @param {string|Buffer|File} input - CSV input
   * @param {object} options - Ingestion options
   * @returns {Promise<object>} Ingestion result
   */
  async ingest(input, options = {}) {
    const opts = this.mergeOptions(this.options, options);
    const result = {
      success: false,
      data: null,
      format: null,
      errors: [],
      warnings: [],
      metadata: {
        startTime: Date.now(),
        source: this.detectSource(input),
        steps: []
      }
    };

    try {
      // Step 1: Parse CSV
      const parseResult = await this.parseInput(input, opts.parser);
      result.metadata.steps.push({
        step: 'parse',
        duration: parseResult.metadata.parseTime,
        success: parseResult.valid
      });

      if (!parseResult.valid) {
        result.errors = parseResult.errors;
        result.warnings = parseResult.warnings;
        return this.formatResult(result);
      }

      // Step 2: Transform to visualization format
      const transformStart = Date.now();
      const transformResult = await this.transformer.transform(
        parseResult.data,
        opts.transformer
      );
      
      result.metadata.steps.push({
        step: 'transform',
        duration: Date.now() - transformStart,
        success: transformResult.valid,
        format: transformResult.metadata?.targetFormat
      });

      if (!transformResult.valid) {
        result.errors.push({
          type: 'TRANSFORM_ERROR',
          message: transformResult.error || 'Transformation failed'
        });
        return this.formatResult(result);
      }

      // Step 3: Validate if enabled
      if (opts.validation.enabled) {
        const validationStart = Date.now();
        const validation = transformResult.validation || 
          await validateData(transformResult.data);
        
        result.metadata.steps.push({
          step: 'validate',
          duration: Date.now() - validationStart,
          success: validation.valid
        });

        if (!validation.valid && opts.validation.strict) {
          result.errors = validation.errors;
          result.warnings = validation.warnings;
          return this.formatResult(result);
        }

        result.warnings.push(...(validation.warnings || []));
      }

      // Success
      result.success = true;
      result.data = transformResult.data;
      result.format = transformResult.metadata?.targetFormat;
      result.metadata = {
        ...result.metadata,
        ...transformResult.metadata,
        totalDuration: Date.now() - result.metadata.startTime
      };

      return this.formatResult(result);

    } catch (error) {
      result.errors.push({
        type: 'INGESTION_ERROR',
        message: error.message,
        stack: error.stack
      });
      return this.formatResult(result);
    }
  }

  /**
   * Ingest CSV from file path
   * @param {string} filePath - Path to CSV file
   * @param {object} options - Ingestion options
   * @returns {Promise<object>} Ingestion result
   */
  async ingestFile(filePath, options = {}) {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      return this.ingest(content, {
        ...options,
        metadata: { filePath }
      });
    } catch (error) {
      return {
        success: false,
        errors: [{
          type: 'FILE_ERROR',
          message: `Failed to read file: ${error.message}`,
          path: filePath
        }]
      };
    }
  }

  /**
   * Ingest CSV from URL
   * @param {string} url - URL to CSV file
   * @param {object} options - Ingestion options
   * @returns {Promise<object>} Ingestion result
   */
  async ingestURL(url, options = {}) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      return this.ingest(content, {
        ...options,
        metadata: { url }
      });
    } catch (error) {
      return {
        success: false,
        errors: [{
          type: 'FETCH_ERROR',
          message: `Failed to fetch URL: ${error.message}`,
          url
        }]
      };
    }
  }

  /**
   * Auto-detect CSV format
   * @param {string} sample - Sample of CSV data
   * @returns {Promise<object>} Detected format options
   */
  async detectFormat(sample) {
    return CSVParser.detectFormat(sample);
  }

  /**
   * Get available transformation formats
   * @param {object} csvData - Parsed CSV data
   * @returns {object} Available formats with recommendations
   */
  getAvailableFormats(csvData) {
    const formats = {
      recommended: [],
      available: [],
      reasons: {}
    };

    const { columnTypes, visualizationHints } = csvData;
    const types = Object.values(columnTypes || {});

    // Check for time series
    if (types.includes('date') && types.includes('number')) {
      formats.recommended.push('timeSeries');
      formats.reasons.timeSeries = 'Date and numeric columns detected';
    }

    // Check for categorical
    if (types.includes('string') && types.includes('number')) {
      formats.recommended.push('bar', 'pie');
      formats.reasons.bar = 'Categorical and numeric columns detected';
      formats.reasons.pie = 'Good for showing proportions';
    }

    // Check for scatter
    if (types.filter(t => t === 'number').length >= 2) {
      formats.recommended.push('scatter');
      formats.reasons.scatter = 'Multiple numeric columns detected';
    }

    // Check for heatmap
    if (types.filter(t => t === 'string').length >= 2 && types.includes('number')) {
      formats.available.push('heatmap');
      formats.reasons.heatmap = 'Two categorical and one numeric column available';
    }

    // Always available
    formats.available.push('table');
    formats.reasons.table = 'Universal tabular display';

    return formats;
  }

  /**
   * Parse input based on type
   */
  async parseInput(input, options) {
    // Handle File object
    if (typeof File !== 'undefined' && input instanceof File) {
      const text = await input.text();
      return this.parser.parse(text);
    }

    // Handle Buffer or string
    return this.parser.parse(input);
  }

  /**
   * Detect input source type
   */
  detectSource(input) {
    if (typeof input === 'string') {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return 'url';
      }
      if (input.includes('\n') || input.includes(',')) {
        return 'string';
      }
      return 'file';
    }
    if (input instanceof Buffer) {
      return 'buffer';
    }
    if (typeof File !== 'undefined' && input instanceof File) {
      return 'file-object';
    }
    return 'unknown';
  }

  /**
   * Format result for output
   */
  formatResult(result) {
    // Add formatted errors if any
    if (result.errors.length > 0 || result.warnings.length > 0) {
      result.formatted = this.errorFormatter.formatValidationResults({
        valid: result.success,
        errors: result.errors,
        warnings: result.warnings
      });
    }

    // Add report generation functions
    result.report = () => this.generateReport(result, 'text');
    result.htmlReport = () => this.generateReport(result, 'html');
    result.jsonReport = () => this.generateReport(result, 'json');

    return result;
  }

  /**
   * Generate ingestion report
   */
  generateReport(result, format = 'text') {
    const report = {
      title: 'CSV Ingestion Report',
      timestamp: new Date().toISOString(),
      success: result.success,
      metadata: result.metadata,
      errors: result.errors,
      warnings: result.warnings
    };

    switch (format) {
      case 'text':
        return this.generateTextReport(report);
      case 'html':
        return this.generateHTMLReport(report);
      case 'json':
        return JSON.stringify(report, null, 2);
      default:
        return report;
    }
  }

  /**
   * Generate text report
   */
  generateTextReport(report) {
    const lines = [
      '=== CSV Ingestion Report ===',
      `Timestamp: ${report.timestamp}`,
      `Status: ${report.success ? 'SUCCESS' : 'FAILED'}`,
      ''
    ];

    if (report.metadata) {
      lines.push('Processing Steps:');
      report.metadata.steps?.forEach(step => {
        lines.push(`  - ${step.step}: ${step.success ? '✓' : '✗'} (${step.duration}ms)`);
      });
      lines.push('');
    }

    if (report.errors.length > 0) {
      lines.push('Errors:');
      report.errors.forEach((error, i) => {
        lines.push(`  ${i + 1}. ${error.type}: ${error.message}`);
      });
      lines.push('');
    }

    if (report.warnings.length > 0) {
      lines.push('Warnings:');
      report.warnings.forEach((warning, i) => {
        lines.push(`  ${i + 1}. ${warning.type}: ${warning.message}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(report) {
    const statusClass = report.success ? 'success' : 'error';
    const statusIcon = report.success ? '✓' : '✗';

    return `
<!DOCTYPE html>
<html>
<head>
  <title>CSV Ingestion Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
    .status.success { background: #d4edda; color: #155724; }
    .status.error { background: #f8d7da; color: #721c24; }
    .step { padding: 8px; margin: 5px 0; background: #f8f9fa; border-left: 3px solid #007bff; }
    .error { padding: 10px; margin: 5px 0; background: #f8d7da; border-left: 3px solid #dc3545; }
    .warning { padding: 10px; margin: 5px 0; background: #fff3cd; border-left: 3px solid #ffc107; }
    .metadata { background: #f8f9fa; padding: 10px; border-radius: 4px; }
    code { background: #e9ecef; padding: 2px 4px; border-radius: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>CSV Ingestion Report</h1>
    <div class="metadata">
      <strong>Timestamp:</strong> ${report.timestamp}<br>
      <strong>Source:</strong> ${report.metadata?.source || 'Unknown'}
    </div>
    
    <div class="status ${statusClass}">
      <strong>${statusIcon} Status:</strong> ${report.success ? 'SUCCESS' : 'FAILED'}
    </div>

    ${report.metadata?.steps ? `
      <h2>Processing Steps</h2>
      ${report.metadata.steps.map(step => `
        <div class="step">
          <strong>${step.step}:</strong> ${step.success ? '✓ Success' : '✗ Failed'} 
          <span style="color: #666;">(${step.duration}ms)</span>
          ${step.format ? `<br>Format: <code>${step.format}</code>` : ''}
        </div>
      `).join('')}
    ` : ''}

    ${report.errors.length > 0 ? `
      <h2>Errors</h2>
      ${report.errors.map(error => `
        <div class="error">
          <strong>${error.type}:</strong> ${error.message}
          ${error.line ? `<br>Line: ${error.line}` : ''}
        </div>
      `).join('')}
    ` : ''}

    ${report.warnings.length > 0 ? `
      <h2>Warnings</h2>
      ${report.warnings.map(warning => `
        <div class="warning">
          <strong>${warning.type}:</strong> ${warning.message}
          ${warning.line ? `<br>Line: ${warning.line}` : ''}
        </div>
      `).join('')}
    ` : ''}
  </div>
</body>
</html>`;
  }

  /**
   * Merge options recursively
   */
  mergeOptions(defaults, overrides) {
    const merged = { ...defaults };
    
    for (const key in overrides) {
      if (overrides[key] !== undefined) {
        if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
          merged[key] = this.mergeOptions(defaults[key] || {}, overrides[key]);
        } else {
          merged[key] = overrides[key];
        }
      }
    }
    
    return merged;
  }
}

// Export singleton instance
export const csvIngestion = new CSVIngestion();

// Export convenience functions
export async function ingestCSV(input, options = {}) {
  return csvIngestion.ingest(input, options);
}

export async function ingestCSVFile(filePath, options = {}) {
  return csvIngestion.ingestFile(filePath, options);
}

export async function ingestCSVURL(url, options = {}) {
  return csvIngestion.ingestURL(url, options);
}

export default CSVIngestion;