/**
 * Validation Rules Engine
 * Custom validation rules and business logic
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module validation-rules
 * @version 1.0.0
 */

/**
 * Rule definition interface
 * @typedef {Object} ValidationRule
 * @property {string} id - Unique rule identifier
 * @property {string} name - Human-readable rule name
 * @property {string} description - Rule description
 * @property {string} type - Rule type (field, cross-field, dataset)
 * @property {Function} validate - Validation function
 * @property {Object} params - Rule parameters
 */

/**
 * Built-in validation rules
 */
export const builtInRules = {
  // Data quality rules
  notEmpty: {
    id: 'not-empty',
    name: 'Not Empty',
    description: 'Field must not be empty',
    type: 'field',
    validate: (value) => {
      if (value === null || value === undefined || value === '') {
        return {
          valid: false,
          message: 'Field cannot be empty'
        };
      }
      return { valid: true };
    }
  },

  // Numeric rules
  inRange: {
    id: 'in-range',
    name: 'In Range',
    description: 'Numeric value must be within specified range',
    type: 'field',
    params: { min: null, max: null },
    validate: (value, params = {}) => {
      if (typeof value !== 'number') {
        return {
          valid: false,
          message: 'Value must be a number'
        };
      }
      if (params.min !== null && value < params.min) {
        return {
          valid: false,
          message: `Value must be at least ${params.min}`
        };
      }
      if (params.max !== null && value > params.max) {
        return {
          valid: false,
          message: `Value must be at most ${params.max}`
        };
      }
      return { valid: true };
    }
  },

  positiveNumber: {
    id: 'positive-number',
    name: 'Positive Number',
    description: 'Value must be a positive number',
    type: 'field',
    validate: (value) => {
      if (typeof value !== 'number' || value <= 0) {
        return {
          valid: false,
          message: 'Value must be a positive number'
        };
      }
      return { valid: true };
    }
  },

  // String rules
  matchesPattern: {
    id: 'matches-pattern',
    name: 'Matches Pattern',
    description: 'String must match specified pattern',
    type: 'field',
    params: { pattern: null, flags: '' },
    validate: (value, params = {}) => {
      if (typeof value !== 'string') {
        return {
          valid: false,
          message: 'Value must be a string'
        };
      }
      if (!params.pattern) {
        return { valid: true };
      }
      const regex = new RegExp(params.pattern, params.flags || '');
      if (!regex.test(value)) {
        return {
          valid: false,
          message: `Value does not match pattern: ${params.pattern}`
        };
      }
      return { valid: true };
    }
  },

  validEmail: {
    id: 'valid-email',
    name: 'Valid Email',
    description: 'Value must be a valid email address',
    type: 'field',
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          valid: false,
          message: 'Invalid email address'
        };
      }
      return { valid: true };
    }
  },

  validURL: {
    id: 'valid-url',
    name: 'Valid URL',
    description: 'Value must be a valid URL',
    type: 'field',
    validate: (value) => {
      try {
        new URL(value);
        return { valid: true };
      } catch {
        return {
          valid: false,
          message: 'Invalid URL'
        };
      }
    }
  },

  // Date rules
  validDate: {
    id: 'valid-date',
    name: 'Valid Date',
    description: 'Value must be a valid date',
    type: 'field',
    validate: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return {
          valid: false,
          message: 'Invalid date'
        };
      }
      return { valid: true };
    }
  },

  dateInRange: {
    id: 'date-in-range',
    name: 'Date In Range',
    description: 'Date must be within specified range',
    type: 'field',
    params: { min: null, max: null },
    validate: (value, params = {}) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return {
          valid: false,
          message: 'Invalid date'
        };
      }
      if (params.min) {
        const minDate = new Date(params.min);
        if (date < minDate) {
          return {
            valid: false,
            message: `Date must be after ${params.min}`
          };
        }
      }
      if (params.max) {
        const maxDate = new Date(params.max);
        if (date > maxDate) {
          return {
            valid: false,
            message: `Date must be before ${params.max}`
          };
        }
      }
      return { valid: true };
    }
  },

  // Array rules
  arrayLength: {
    id: 'array-length',
    name: 'Array Length',
    description: 'Array must have specific length constraints',
    type: 'field',
    params: { min: null, max: null, exact: null },
    validate: (value, params = {}) => {
      if (!Array.isArray(value)) {
        return {
          valid: false,
          message: 'Value must be an array'
        };
      }
      if (params.exact !== null && value.length !== params.exact) {
        return {
          valid: false,
          message: `Array must have exactly ${params.exact} items`
        };
      }
      if (params.min !== null && value.length < params.min) {
        return {
          valid: false,
          message: `Array must have at least ${params.min} items`
        };
      }
      if (params.max !== null && value.length > params.max) {
        return {
          valid: false,
          message: `Array must have at most ${params.max} items`
        };
      }
      return { valid: true };
    }
  },

  uniqueArray: {
    id: 'unique-array',
    name: 'Unique Array',
    description: 'Array elements must be unique',
    type: 'field',
    validate: (value) => {
      if (!Array.isArray(value)) {
        return {
          valid: false,
          message: 'Value must be an array'
        };
      }
      const uniqueSet = new Set(value.map(item => JSON.stringify(item)));
      if (uniqueSet.size !== value.length) {
        return {
          valid: false,
          message: 'Array contains duplicate values'
        };
      }
      return { valid: true };
    }
  },

  // Cross-field rules
  sumEquals: {
    id: 'sum-equals',
    name: 'Sum Equals',
    description: 'Sum of fields must equal specified value',
    type: 'cross-field',
    params: { fields: [], targetValue: null },
    validate: (data, params = {}) => {
      const sum = params.fields.reduce((acc, field) => {
        return acc + (Number(data[field]) || 0);
      }, 0);
      if (sum !== params.targetValue) {
        return {
          valid: false,
          message: `Sum of fields (${sum}) does not equal ${params.targetValue}`
        };
      }
      return { valid: true };
    }
  },

  dateSequence: {
    id: 'date-sequence',
    name: 'Date Sequence',
    description: 'Dates must be in chronological order',
    type: 'cross-field',
    params: { startField: null, endField: null },
    validate: (data, params = {}) => {
      const startDate = new Date(data[params.startField]);
      const endDate = new Date(data[params.endField]);
      if (startDate > endDate) {
        return {
          valid: false,
          message: `${params.startField} must be before ${params.endField}`
        };
      }
      return { valid: true };
    }
  },

  // Dataset rules
  noDuplicateRows: {
    id: 'no-duplicate-rows',
    name: 'No Duplicate Rows',
    description: 'Dataset must not contain duplicate rows',
    type: 'dataset',
    params: { keyFields: [] },
    validate: (dataset, params = {}) => {
      const keyFields = params.keyFields.length > 0 ? params.keyFields : null;
      const seen = new Set();
      
      for (let i = 0; i < dataset.length; i++) {
        const row = dataset[i];
        const key = keyFields 
          ? keyFields.map(field => row[field]).join('|')
          : JSON.stringify(row);
          
        if (seen.has(key)) {
          return {
            valid: false,
            message: `Duplicate row found at index ${i}`,
            rowIndex: i
          };
        }
        seen.add(key);
      }
      return { valid: true };
    }
  },

  consistentDataTypes: {
    id: 'consistent-data-types',
    name: 'Consistent Data Types',
    description: 'Column data types must be consistent',
    type: 'dataset',
    validate: (dataset) => {
      if (dataset.length === 0) return { valid: true };
      
      const columnTypes = {};
      const errors = [];
      
      dataset.forEach((row, rowIndex) => {
        Object.keys(row).forEach(column => {
          const value = row[column];
          const type = getDataType(value);
          
          if (!columnTypes[column]) {
            columnTypes[column] = type;
          } else if (columnTypes[column] !== type && value !== null) {
            errors.push({
              column,
              rowIndex,
              expectedType: columnTypes[column],
              actualType: type
            });
          }
        });
      });
      
      if (errors.length > 0) {
        return {
          valid: false,
          message: 'Inconsistent data types found',
          errors
        };
      }
      return { valid: true };
    }
  }
};

/**
 * Rule Engine Class
 */
export class ValidationRuleEngine {
  constructor() {
    this.rules = new Map();
    this.loadBuiltInRules();
  }

  /**
   * Load built-in rules
   */
  loadBuiltInRules() {
    Object.values(builtInRules).forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Register custom rule
   */
  registerRule(rule) {
    if (!rule.id || !rule.validate) {
      throw new Error('Rule must have id and validate function');
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Apply rules to data
   */
  applyRules(data, ruleConfigs) {
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    ruleConfigs.forEach(config => {
      const rule = this.rules.get(config.ruleId);
      if (!rule) {
        results.warnings.push({
          type: 'UNKNOWN_RULE',
          message: `Unknown rule: ${config.ruleId}`
        });
        return;
      }

      const ruleResult = this.executeRule(rule, data, config);
      if (!ruleResult.valid) {
        results.valid = false;
        results.errors.push({
          type: 'RULE_VIOLATION',
          ruleId: rule.id,
          ruleName: rule.name,
          message: ruleResult.message,
          field: config.field,
          ...ruleResult
        });
      }
    });

    return results;
  }

  /**
   * Execute single rule
   */
  executeRule(rule, data, config) {
    try {
      switch (rule.type) {
        case 'field':
          if (!config.field) {
            return {
              valid: false,
              message: 'Field name required for field-type rule'
            };
          }
          const fieldValue = this.getFieldValue(data, config.field);
          return rule.validate(fieldValue, config.params || rule.params);
          
        case 'cross-field':
          return rule.validate(data, config.params || rule.params);
          
        case 'dataset':
          if (!Array.isArray(data)) {
            return {
              valid: false,
              message: 'Dataset rule requires array data'
            };
          }
          return rule.validate(data, config.params || rule.params);
          
        default:
          return {
            valid: false,
            message: `Unknown rule type: ${rule.type}`
          };
      }
    } catch (error) {
      return {
        valid: false,
        message: `Rule execution error: ${error.message}`
      };
    }
  }

  /**
   * Get field value from nested path
   */
  getFieldValue(data, fieldPath) {
    const parts = fieldPath.split('.');
    return parts.reduce((obj, part) => {
      if (part.includes('[') && part.includes(']')) {
        const [arrayName, indexStr] = part.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        return obj?.[arrayName]?.[index];
      }
      return obj?.[part];
    }, data);
  }
}

/**
 * Helper function to determine data type
 */
function getDataType(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    // Try to detect date strings
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return 'date';
    }
    return 'string';
  }
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'unknown';
}

// Export singleton instance
export const ruleEngine = new ValidationRuleEngine();

export default ValidationRuleEngine;