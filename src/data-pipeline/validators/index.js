/**
 * Data Pipeline Validators
 * Main entry point for validation system
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module validators
 * @version 1.0.0
 */

// Core validators
export { JSONValidator, jsonValidator, default as validateJSON } from './json-validator.js';

// Schema libraries
export { chartSchemas, getChartSchema, validateChartData } from './schemas/chart-schemas.js';
export { hierarchySchemas, getHierarchySchema, validateHierarchyData } from './schemas/hierarchy-schemas.js';
export { tableSchemas, getTableSchema, validateTableData } from './schemas/table-schemas.js';

// Validation engine
export { ValidationRuleEngine, ruleEngine, builtInRules } from './validation-rules.js';

// Error formatting
export { ErrorFormatter, errorFormatter, ErrorSeverity, ErrorCategory } from './error-formatter.js';

// Unified validator interface
import { JSONValidator } from './json-validator.js';
import { chartSchemas } from './schemas/chart-schemas.js';
import { hierarchySchemas } from './schemas/hierarchy-schemas.js';
import { tableSchemas } from './schemas/table-schemas.js';
import { ruleEngine } from './validation-rules.js';
import { errorFormatter } from './error-formatter.js';

/**
 * Unified Data Validator
 * Provides a high-level interface for validating various data formats
 */
export class DataValidator {
  constructor(options = {}) {
    this.jsonValidator = new JSONValidator(options.json || {});
    this.ruleEngine = options.ruleEngine || ruleEngine;
    this.errorFormatter = new ErrorFormatter(options.formatting || {});
    
    // Schema registry
    this.schemas = {
      chart: chartSchemas,
      hierarchy: hierarchySchemas,
      table: tableSchemas,
      custom: options.customSchemas || {}
    };
  }

  /**
   * Validate data with automatic format detection
   */
  async validate(data, options = {}) {
    const startTime = Date.now();
    
    // Step 1: Basic JSON validation
    const jsonResult = this.jsonValidator.validate(data, options.schema);
    if (!jsonResult.valid) {
      return this.formatResult(jsonResult, startTime);
    }

    // Step 2: Detect data format if not specified
    const format = options.format || this.detectFormat(jsonResult.data);
    
    // Step 3: Apply format-specific schema
    if (format && format.type) {
      const schemaResult = await this.validateWithSchema(
        jsonResult.data, 
        format.type, 
        format.subtype
      );
      if (!schemaResult.valid) {
        return this.formatResult(schemaResult, startTime);
      }
    }

    // Step 4: Apply custom rules
    if (options.rules && options.rules.length > 0) {
      const rulesResult = this.ruleEngine.applyRules(
        jsonResult.data.original || jsonResult.data,
        options.rules
      );
      if (!rulesResult.valid) {
        jsonResult.valid = false;
        jsonResult.errors.push(...rulesResult.errors);
        jsonResult.warnings.push(...rulesResult.warnings);
      }
    }

    // Step 5: Format and return results
    return this.formatResult(jsonResult, startTime);
  }

  /**
   * Detect data format
   */
  detectFormat(data) {
    const normalized = data.normalized || data.original || data;
    const hints = data.visualizationHints || {};

    // Check visualization hints first
    if (hints.dataFormat) {
      switch (hints.dataFormat) {
        case 'timeSeries':
          return { type: 'chart', subtype: 'timeSeries' };
        case 'categorical':
          return { type: 'chart', subtype: 'bar' };
        case 'hierarchical':
          return { type: 'hierarchy', subtype: 'tree' };
        case 'tabular':
          return { type: 'table', subtype: 'basic' };
      }
    }

    // Manual detection
    if (this.isChartData(normalized)) {
      return { type: 'chart', subtype: this.detectChartType(normalized) };
    }
    
    if (this.isHierarchicalData(normalized)) {
      return { type: 'hierarchy', subtype: this.detectHierarchyType(normalized) };
    }
    
    if (this.isTabularData(normalized)) {
      return { type: 'table', subtype: this.detectTableType(normalized) };
    }

    return null;
  }

  /**
   * Validate with specific schema
   */
  async validateWithSchema(data, type, subtype) {
    const schemaGroup = this.schemas[type];
    if (!schemaGroup) {
      return {
        valid: false,
        errors: [{
          type: 'UNKNOWN_SCHEMA_TYPE',
          message: `Unknown schema type: ${type}`
        }]
      };
    }

    const schema = schemaGroup[subtype];
    if (!schema) {
      return {
        valid: false,
        errors: [{
          type: 'UNKNOWN_SCHEMA_SUBTYPE',
          message: `Unknown ${type} subtype: ${subtype}`
        }]
      };
    }

    // Use JSON validator with schema
    const normalized = data.normalized || data.original || data;
    return this.jsonValidator.validate(normalized, schema);
  }

  /**
   * Format validation result
   */
  formatResult(result, startTime) {
    const duration = Date.now() - startTime;
    
    // Add timing information
    result.metadata = result.metadata || {};
    result.metadata.validationTime = duration;
    
    // Format errors for display
    const formatted = this.errorFormatter.formatValidationResults(result);
    
    return {
      ...result,
      formatted,
      report: () => this.errorFormatter.generateReport(result, 'text'),
      htmlReport: () => this.errorFormatter.generateReport(result, 'html')
    };
  }

  // Detection helper methods

  isChartData(data) {
    if (Array.isArray(data)) {
      const sample = data[0];
      if (!sample) return false;
      
      // Check for chart-like properties
      return (
        ('x' in sample && 'y' in sample) ||
        ('category' in sample && 'value' in sample) ||
        ('label' in sample && 'value' in sample) ||
        ('timestamp' in sample && 'value' in sample)
      );
    }
    
    return 'data' in data || 'series' in data;
  }

  detectChartType(data) {
    const sample = Array.isArray(data) ? data[0] : data.data?.[0];
    if (!sample) return 'bar';
    
    if ('timestamp' in sample || 'date' in sample || 'time' in sample) {
      return 'timeSeries';
    }
    if ('x' in sample && 'y' in sample && !('category' in sample)) {
      return 'scatter';
    }
    if ('label' in sample && 'value' in sample && data.length < 10) {
      return 'pie';
    }
    
    return 'bar';
  }

  isHierarchicalData(data) {
    return (
      ('children' in data) ||
      ('nodes' in data && 'edges' in data) ||
      ('root' in data) ||
      ('branches' in data)
    );
  }

  detectHierarchyType(data) {
    if ('nodes' in data && 'edges' in data) return 'network';
    if ('nodes' in data && 'links' in data) return 'sankey';
    if ('central' in data && 'branches' in data.central) return 'mindMap';
    if ('children' in data || 'root' in data) return 'tree';
    
    return 'tree';
  }

  isTabularData(data) {
    if (Array.isArray(data) && data.length > 0) {
      const sample = data[0];
      if (typeof sample === 'object' && sample !== null) {
        // Check if all items have same keys
        const keys = Object.keys(sample);
        return data.every(item => 
          typeof item === 'object' && 
          item !== null &&
          keys.every(key => key in item)
        );
      }
    }
    
    return (
      ('columns' in data && 'rows' in data) ||
      ('columns' in data && 'data' in data) ||
      ('headers' in data && 'data' in data)
    );
  }

  detectTableType(data) {
    if ('events' in data) return 'calendar';
    if ('rowFields' in data && 'columnFields' in data) return 'pivot';
    if ('columns' in data && data.columns[0]?.editable) return 'dataGrid';
    if (Array.isArray(data?.[0])) return 'matrix';
    
    return 'basic';
  }

  /**
   * Register custom schema
   */
  registerSchema(type, name, schema) {
    if (!this.schemas[type]) {
      this.schemas[type] = {};
    }
    this.schemas[type][name] = schema;
  }

  /**
   * Register custom validation rule
   */
  registerRule(rule) {
    this.ruleEngine.registerRule(rule);
  }
}

// Export singleton instance
export const dataValidator = new DataValidator();

// Convenience functions
export async function validateData(data, options) {
  return dataValidator.validate(data, options);
}

export function registerCustomSchema(type, name, schema) {
  dataValidator.registerSchema(type, name, schema);
}

export function registerCustomRule(rule) {
  dataValidator.registerRule(rule);
}

export default DataValidator;