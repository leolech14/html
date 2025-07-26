/**
 * JSON Validator Module
 * Provides comprehensive JSON validation with schema support
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module json-validator
 * @version 1.0.0
 */

export class JSONValidator {
  constructor(options = {}) {
    this.options = {
      strictMode: options.strictMode ?? true,
      allowComments: options.allowComments ?? false,
      maxDepth: options.maxDepth ?? 100,
      maxSize: options.maxSize ?? 10 * 1024 * 1024, // 10MB default
      ...options
    };
    
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate JSON string or object
   * @param {string|object} input - JSON string or object to validate
   * @param {object} schema - Optional JSON Schema for validation
   * @returns {object} Validation result with parsed data, errors, and warnings
   */
  validate(input, schema = null) {
    this.reset();
    
    let data;
    const result = {
      valid: false,
      data: null,
      errors: [],
      warnings: [],
      metadata: {
        inputType: typeof input,
        size: 0,
        depth: 0,
        keyCount: 0
      }
    };

    // Step 1: Parse JSON if string
    if (typeof input === 'string') {
      const parseResult = this.parseJSON(input);
      if (!parseResult.success) {
        result.errors = parseResult.errors;
        return result;
      }
      data = parseResult.data;
      result.metadata.size = new Blob([input]).size;
    } else if (typeof input === 'object' && input !== null) {
      data = input;
      result.metadata.size = new Blob([JSON.stringify(input)]).size;
    } else {
      result.errors.push({
        type: 'INVALID_INPUT',
        message: 'Input must be a JSON string or object',
        path: '$'
      });
      return result;
    }

    // Step 2: Check size constraints
    if (result.metadata.size > this.options.maxSize) {
      result.errors.push({
        type: 'SIZE_EXCEEDED',
        message: `JSON size (${result.metadata.size} bytes) exceeds maximum allowed (${this.options.maxSize} bytes)`,
        path: '$'
      });
      return result;
    }

    // Step 3: Validate structure
    const structureValidation = this.validateStructure(data);
    if (!structureValidation.valid) {
      result.errors.push(...structureValidation.errors);
      result.warnings.push(...structureValidation.warnings);
      return result;
    }
    
    result.metadata.depth = structureValidation.depth;
    result.metadata.keyCount = structureValidation.keyCount;

    // Step 4: Schema validation if provided
    if (schema) {
      const schemaValidation = this.validateAgainstSchema(data, schema);
      if (!schemaValidation.valid) {
        result.errors.push(...schemaValidation.errors);
        result.warnings.push(...schemaValidation.warnings);
        return result;
      }
    }

    // Step 5: Normalize data for visualization
    result.data = this.normalizeData(data);
    result.valid = result.errors.length === 0;
    result.errors = this.errors;
    result.warnings = this.warnings;

    return result;
  }

  /**
   * Parse JSON with enhanced error handling
   */
  parseJSON(jsonString) {
    const result = {
      success: false,
      data: null,
      errors: []
    };

    try {
      // Remove BOM if present
      let cleanJson = jsonString;
      if (cleanJson.charCodeAt(0) === 0xFEFF) {
        cleanJson = cleanJson.slice(1);
      }

      // Handle comments if allowed
      if (this.options.allowComments) {
        cleanJson = this.stripComments(cleanJson);
      }

      result.data = JSON.parse(cleanJson);
      result.success = true;
    } catch (error) {
      const errorInfo = this.parseJSONError(error, jsonString);
      result.errors.push(errorInfo);
    }

    return result;
  }

  /**
   * Parse JSON error to provide detailed information
   */
  parseJSONError(error, jsonString) {
    const errorInfo = {
      type: 'PARSE_ERROR',
      message: error.message,
      path: '$'
    };

    // Try to extract line and column from error message
    const match = error.message.match(/position (\d+)/);
    if (match) {
      const position = parseInt(match[1]);
      const lines = jsonString.substring(0, position).split('\n');
      errorInfo.line = lines.length;
      errorInfo.column = lines[lines.length - 1].length + 1;
      
      // Get context around error
      const errorLine = jsonString.split('\n')[errorInfo.line - 1];
      if (errorLine) {
        errorInfo.context = {
          line: errorLine,
          pointer: ' '.repeat(errorInfo.column - 1) + '^'
        };
      }
    }

    return errorInfo;
  }

  /**
   * Strip comments from JSON string
   */
  stripComments(jsonString) {
    // Remove single-line comments
    jsonString = jsonString.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
    return jsonString;
  }

  /**
   * Validate JSON structure (depth, circular references, etc.)
   */
  validateStructure(data, path = '$', depth = 0, visited = new WeakSet()) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      depth: 0,
      keyCount: 0
    };

    // Check depth
    if (depth > this.options.maxDepth) {
      result.valid = false;
      result.errors.push({
        type: 'MAX_DEPTH_EXCEEDED',
        message: `Maximum depth of ${this.options.maxDepth} exceeded`,
        path
      });
      return result;
    }

    // Check circular reference
    if (typeof data === 'object' && data !== null) {
      if (visited.has(data)) {
        result.valid = false;
        result.errors.push({
          type: 'CIRCULAR_REFERENCE',
          message: 'Circular reference detected',
          path
        });
        return result;
      }
      visited.add(data);
    }

    // Process based on type
    if (Array.isArray(data)) {
      result.depth = depth;
      data.forEach((item, index) => {
        const itemResult = this.validateStructure(
          item, 
          `${path}[${index}]`, 
          depth + 1, 
          visited
        );
        if (!itemResult.valid) {
          result.valid = false;
          result.errors.push(...itemResult.errors);
        }
        result.warnings.push(...itemResult.warnings);
        result.depth = Math.max(result.depth, itemResult.depth);
        result.keyCount += itemResult.keyCount;
      });
    } else if (data !== null && typeof data === 'object') {
      result.depth = depth;
      const keys = Object.keys(data);
      result.keyCount = keys.length;

      keys.forEach(key => {
        // Validate key
        if (this.options.strictMode && !this.isValidKey(key)) {
          result.warnings.push({
            type: 'INVALID_KEY_FORMAT',
            message: `Key "${key}" contains special characters`,
            path: `${path}.${key}`
          });
        }

        const itemResult = this.validateStructure(
          data[key], 
          `${path}.${key}`, 
          depth + 1, 
          visited
        );
        if (!itemResult.valid) {
          result.valid = false;
          result.errors.push(...itemResult.errors);
        }
        result.warnings.push(...itemResult.warnings);
        result.depth = Math.max(result.depth, itemResult.depth);
        result.keyCount += itemResult.keyCount;
      });
    }

    return result;
  }

  /**
   * Validate data against JSON Schema
   */
  validateAgainstSchema(data, schema, path = '$') {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Type validation
    if (schema.type) {
      const actualType = this.getJsonType(data);
      const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
      
      if (!expectedTypes.includes(actualType)) {
        result.valid = false;
        result.errors.push({
          type: 'TYPE_MISMATCH',
          message: `Expected type ${expectedTypes.join(' or ')}, got ${actualType}`,
          path,
          expected: expectedTypes,
          actual: actualType
        });
        return result;
      }
    }

    // Required properties
    if (schema.required && Array.isArray(schema.required)) {
      schema.required.forEach(prop => {
        if (!(prop in data)) {
          result.valid = false;
          result.errors.push({
            type: 'MISSING_REQUIRED',
            message: `Missing required property "${prop}"`,
            path: `${path}.${prop}`
          });
        }
      });
    }

    // Properties validation
    if (schema.properties && typeof data === 'object' && data !== null) {
      Object.keys(schema.properties).forEach(prop => {
        if (prop in data) {
          const propResult = this.validateAgainstSchema(
            data[prop], 
            schema.properties[prop], 
            `${path}.${prop}`
          );
          if (!propResult.valid) {
            result.valid = false;
            result.errors.push(...propResult.errors);
          }
          result.warnings.push(...propResult.warnings);
        }
      });
    }

    // Additional properties
    if (schema.additionalProperties === false && typeof data === 'object' && data !== null) {
      const allowedProps = Object.keys(schema.properties || {});
      Object.keys(data).forEach(prop => {
        if (!allowedProps.includes(prop)) {
          result.warnings.push({
            type: 'ADDITIONAL_PROPERTY',
            message: `Additional property "${prop}" not defined in schema`,
            path: `${path}.${prop}`
          });
        }
      });
    }

    // Array items validation
    if (schema.items && Array.isArray(data)) {
      data.forEach((item, index) => {
        const itemResult = this.validateAgainstSchema(
          item, 
          schema.items, 
          `${path}[${index}]`
        );
        if (!itemResult.valid) {
          result.valid = false;
          result.errors.push(...itemResult.errors);
        }
        result.warnings.push(...itemResult.warnings);
      });
    }

    // String constraints
    if (actualType === 'string' && typeof data === 'string') {
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        result.valid = false;
        result.errors.push({
          type: 'MIN_LENGTH',
          message: `String length ${data.length} is less than minimum ${schema.minLength}`,
          path
        });
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        result.valid = false;
        result.errors.push({
          type: 'MAX_LENGTH',
          message: `String length ${data.length} exceeds maximum ${schema.maxLength}`,
          path
        });
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        result.valid = false;
        result.errors.push({
          type: 'PATTERN_MISMATCH',
          message: `String does not match pattern ${schema.pattern}`,
          path
        });
      }
    }

    // Number constraints
    if ((actualType === 'number' || actualType === 'integer') && typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        result.valid = false;
        result.errors.push({
          type: 'MINIMUM',
          message: `Value ${data} is less than minimum ${schema.minimum}`,
          path
        });
      }
      if (schema.maximum !== undefined && data > schema.maximum) {
        result.valid = false;
        result.errors.push({
          type: 'MAXIMUM',
          message: `Value ${data} exceeds maximum ${schema.maximum}`,
          path
        });
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(data)) {
      result.valid = false;
      result.errors.push({
        type: 'ENUM_MISMATCH',
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        path,
        expected: schema.enum,
        actual: data
      });
    }

    return result;
  }

  /**
   * Normalize data for visualization pipeline
   */
  normalizeData(data) {
    return {
      original: data,
      normalized: this.normalizeStructure(data),
      metadata: this.extractMetadata(data),
      visualizationHints: this.generateVisualizationHints(data)
    };
  }

  /**
   * Normalize data structure
   */
  normalizeStructure(data, depth = 0) {
    if (depth > 10) return data; // Prevent deep recursion

    if (Array.isArray(data)) {
      return data.map(item => this.normalizeStructure(item, depth + 1));
    }

    if (data !== null && typeof data === 'object') {
      const normalized = {};
      Object.keys(data).sort().forEach(key => {
        normalized[key] = this.normalizeStructure(data[key], depth + 1);
      });
      return normalized;
    }

    return data;
  }

  /**
   * Extract metadata from data
   */
  extractMetadata(data) {
    const metadata = {
      type: this.getJsonType(data),
      shape: null,
      stats: {}
    };

    if (Array.isArray(data)) {
      metadata.shape = [data.length];
      metadata.stats = {
        length: data.length,
        types: this.getArrayTypes(data),
        homogeneous: this.isHomogeneousArray(data)
      };
    } else if (data !== null && typeof data === 'object') {
      const keys = Object.keys(data);
      metadata.shape = keys;
      metadata.stats = {
        keyCount: keys.length,
        types: this.getObjectTypes(data)
      };
    }

    return metadata;
  }

  /**
   * Generate visualization hints based on data structure
   */
  generateVisualizationHints(data) {
    const hints = {
      recommendedCharts: [],
      dataFormat: null,
      transformations: []
    };

    // Detect time series data
    if (this.isTimeSeries(data)) {
      hints.recommendedCharts.push('line', 'area');
      hints.dataFormat = 'timeSeries';
    }

    // Detect categorical data
    if (this.isCategoricalData(data)) {
      hints.recommendedCharts.push('bar', 'pie');
      hints.dataFormat = 'categorical';
    }

    // Detect hierarchical data
    if (this.isHierarchicalData(data)) {
      hints.recommendedCharts.push('treemap', 'sunburst');
      hints.dataFormat = 'hierarchical';
    }

    // Detect tabular data
    if (this.isTabularData(data)) {
      hints.recommendedCharts.push('table', 'heatmap');
      hints.dataFormat = 'tabular';
    }

    return hints;
  }

  // Helper methods

  getJsonType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    const type = typeof value;
    if (type === 'number' && Number.isInteger(value)) return 'integer';
    return type;
  }

  isValidKey(key) {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
  }

  getArrayTypes(arr) {
    const types = new Set();
    arr.forEach(item => types.add(this.getJsonType(item)));
    return Array.from(types);
  }

  isHomogeneousArray(arr) {
    if (arr.length === 0) return true;
    const firstType = this.getJsonType(arr[0]);
    return arr.every(item => this.getJsonType(item) === firstType);
  }

  getObjectTypes(obj) {
    const types = {};
    Object.keys(obj).forEach(key => {
      types[key] = this.getJsonType(obj[key]);
    });
    return types;
  }

  isTimeSeries(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    // Check if array of objects with date/time field
    const sample = data[0];
    if (typeof sample !== 'object' || sample === null) return false;
    
    const dateFields = ['date', 'time', 'timestamp', 'datetime', 'created_at', 'updated_at'];
    return dateFields.some(field => field in sample);
  }

  isCategoricalData(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    const sample = data[0];
    if (typeof sample !== 'object' || sample === null) return false;
    
    // Look for category-like fields
    const categoryFields = ['category', 'type', 'group', 'label', 'name'];
    return categoryFields.some(field => field in sample);
  }

  isHierarchicalData(data) {
    if (typeof data !== 'object' || data === null) return false;
    
    // Look for parent-child relationships
    const hierarchyFields = ['children', 'parent', 'nodes', 'items'];
    return hierarchyFields.some(field => field in data);
  }

  isTabularData(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    // Check if array of uniform objects
    const sample = data[0];
    if (typeof sample !== 'object' || sample === null) return false;
    
    const sampleKeys = Object.keys(sample).sort().join(',');
    return data.every(item => 
      typeof item === 'object' && 
      item !== null && 
      Object.keys(item).sort().join(',') === sampleKeys
    );
  }

  reset() {
    this.errors = [];
    this.warnings = [];
  }
}

// Export singleton instance for convenience
export const jsonValidator = new JSONValidator();

// Export default validator function
export default function validateJSON(input, schema = null, options = {}) {
  const validator = new JSONValidator(options);
  return validator.validate(input, schema);
}