/**
 * Error Formatter Module
 * Formats validation errors into user-friendly messages
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module error-formatter
 * @version 1.0.0
 */

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Error categories
 */
export const ErrorCategory = {
  SYNTAX: 'syntax',
  SCHEMA: 'schema',
  CONSTRAINT: 'constraint',
  DATA_QUALITY: 'data_quality',
  BUSINESS_RULE: 'business_rule'
};

/**
 * Error Formatter Class
 */
export class ErrorFormatter {
  constructor(options = {}) {
    this.options = {
      includeContext: options.includeContext ?? true,
      includeHints: options.includeHints ?? true,
      maxContextLines: options.maxContextLines ?? 3,
      colorize: options.colorize ?? false,
      locale: options.locale ?? 'en',
      ...options
    };
    
    this.errorTemplates = this.loadErrorTemplates();
  }

  /**
   * Format validation results
   */
  formatValidationResults(results) {
    const formatted = {
      summary: this.generateSummary(results),
      errors: results.errors?.map(error => this.formatError(error)) || [],
      warnings: results.warnings?.map(warning => this.formatWarning(warning)) || [],
      metadata: results.metadata || {}
    };

    if (this.options.includeHints && formatted.errors.length > 0) {
      formatted.hints = this.generateHints(results);
    }

    return formatted;
  }

  /**
   * Generate summary
   */
  generateSummary(results) {
    const errorCount = results.errors?.length || 0;
    const warningCount = results.warnings?.length || 0;
    
    if (results.valid) {
      return {
        status: 'success',
        message: 'Validation passed successfully',
        stats: {
          errors: 0,
          warnings: warningCount
        }
      };
    }

    return {
      status: 'failed',
      message: this.pluralize(
        `Validation failed with ${errorCount} error`,
        errorCount
      ) + (warningCount > 0 ? ` and ${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''),
      stats: {
        errors: errorCount,
        warnings: warningCount,
        categories: this.categorizeErrors(results.errors)
      }
    };
  }

  /**
   * Format individual error
   */
  formatError(error) {
    const formatted = {
      severity: ErrorSeverity.ERROR,
      category: this.determineCategory(error.type),
      code: error.type,
      message: this.enhanceMessage(error),
      location: this.formatLocation(error)
    };

    if (this.options.includeContext && error.context) {
      formatted.context = this.formatContext(error.context);
    }

    if (error.expected && error.actual) {
      formatted.details = {
        expected: error.expected,
        actual: error.actual
      };
    }

    const hint = this.getErrorHint(error);
    if (hint) {
      formatted.hint = hint;
    }

    return formatted;
  }

  /**
   * Format warning
   */
  formatWarning(warning) {
    return {
      severity: ErrorSeverity.WARNING,
      category: this.determineCategory(warning.type),
      code: warning.type,
      message: warning.message,
      location: this.formatLocation(warning)
    };
  }

  /**
   * Enhance error message
   */
  enhanceMessage(error) {
    const template = this.errorTemplates[error.type];
    if (template) {
      return this.interpolateTemplate(template, error);
    }
    
    // Fallback to original message with enhancements
    let message = error.message;
    
    // Add field information
    if (error.path && error.path !== '$') {
      message = `At ${this.formatPath(error.path)}: ${message}`;
    }
    
    return message;
  }

  /**
   * Format location information
   */
  formatLocation(error) {
    const location = {};
    
    if (error.path) {
      location.path = error.path;
      location.jsonPath = this.formatJsonPath(error.path);
    }
    
    if (error.line !== undefined) {
      location.line = error.line;
      location.column = error.column;
    }
    
    if (error.rowIndex !== undefined) {
      location.row = error.rowIndex + 1; // 1-based for display
    }
    
    return location;
  }

  /**
   * Format context
   */
  formatContext(context) {
    if (typeof context === 'string') {
      return { snippet: context };
    }
    
    if (context.line && context.pointer) {
      return {
        snippet: context.line,
        pointer: context.pointer,
        lineNumber: context.lineNumber
      };
    }
    
    return context;
  }

  /**
   * Get error hint
   */
  getErrorHint(error) {
    const hints = {
      'PARSE_ERROR': 'Check for missing commas, quotes, or brackets',
      'TYPE_MISMATCH': 'Ensure the value matches the expected data type',
      'MISSING_REQUIRED': 'Add the required field to your JSON',
      'CIRCULAR_REFERENCE': 'Remove circular references from your data structure',
      'MAX_DEPTH_EXCEEDED': 'Simplify nested structures or increase max depth limit',
      'SIZE_EXCEEDED': 'Reduce data size or increase size limit',
      'PATTERN_MISMATCH': 'Ensure the value matches the required format',
      'ENUM_MISMATCH': 'Use one of the allowed values',
      'MIN_LENGTH': 'Provide a longer value',
      'MAX_LENGTH': 'Provide a shorter value',
      'MINIMUM': 'Increase the value to meet minimum requirement',
      'MAXIMUM': 'Decrease the value to meet maximum requirement'
    };
    
    return hints[error.type] || null;
  }

  /**
   * Generate hints for all errors
   */
  generateHints(results) {
    const hints = [];
    const errorTypes = new Set(results.errors.map(e => e.type));
    
    if (errorTypes.has('PARSE_ERROR')) {
      hints.push({
        type: 'general',
        message: 'JSON syntax errors often occur due to:',
        suggestions: [
          'Missing or extra commas',
          'Unmatched brackets or braces',
          'Unescaped quotes in strings',
          'Invalid escape sequences'
        ]
      });
    }
    
    if (errorTypes.has('TYPE_MISMATCH')) {
      hints.push({
        type: 'schema',
        message: 'Type mismatches can be fixed by:',
        suggestions: [
          'Converting strings to numbers where needed',
          'Using boolean values (true/false) instead of strings',
          'Ensuring arrays are wrapped in square brackets',
          'Wrapping objects in curly braces'
        ]
      });
    }
    
    const missingFields = results.errors
      .filter(e => e.type === 'MISSING_REQUIRED')
      .map(e => e.path?.split('.').pop());
      
    if (missingFields.length > 0) {
      hints.push({
        type: 'structure',
        message: 'Required fields missing:',
        fields: [...new Set(missingFields)]
      });
    }
    
    return hints;
  }

  /**
   * Determine error category
   */
  determineCategory(errorType) {
    const categoryMap = {
      'PARSE_ERROR': ErrorCategory.SYNTAX,
      'TYPE_MISMATCH': ErrorCategory.SCHEMA,
      'MISSING_REQUIRED': ErrorCategory.SCHEMA,
      'ADDITIONAL_PROPERTY': ErrorCategory.SCHEMA,
      'CIRCULAR_REFERENCE': ErrorCategory.CONSTRAINT,
      'MAX_DEPTH_EXCEEDED': ErrorCategory.CONSTRAINT,
      'SIZE_EXCEEDED': ErrorCategory.CONSTRAINT,
      'RULE_VIOLATION': ErrorCategory.BUSINESS_RULE,
      'INVALID_KEY_FORMAT': ErrorCategory.DATA_QUALITY
    };
    
    return categoryMap[errorType] || ErrorCategory.DATA_QUALITY;
  }

  /**
   * Categorize errors
   */
  categorizeErrors(errors) {
    const categories = {};
    
    errors.forEach(error => {
      const category = this.determineCategory(error.type);
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return categories;
  }

  /**
   * Format JSON path
   */
  formatJsonPath(path) {
    // Convert JavaScript path to JSONPath format
    return path
      .replace(/\[(\d+)\]/g, '[$1]')
      .replace(/^\./, '$.');
  }

  /**
   * Format path for display
   */
  formatPath(path) {
    // Make path more readable
    return path
      .replace(/^\$\.?/, '')
      .replace(/\[(\d+)\]/g, '[$1]')
      .replace(/\./g, ' → ');
  }

  /**
   * Load error message templates
   */
  loadErrorTemplates() {
    return {
      'PARSE_ERROR': 'Invalid JSON syntax: {message}',
      'TYPE_MISMATCH': 'Expected {expected} but got {actual}',
      'MISSING_REQUIRED': 'Required field "{field}" is missing',
      'CIRCULAR_REFERENCE': 'Circular reference detected in data structure',
      'MAX_DEPTH_EXCEEDED': 'Data nesting exceeds maximum depth of {maxDepth}',
      'SIZE_EXCEEDED': 'Data size ({size} bytes) exceeds maximum ({maxSize} bytes)',
      'PATTERN_MISMATCH': 'Value does not match required pattern: {pattern}',
      'ENUM_MISMATCH': 'Value must be one of: {expected}',
      'MIN_LENGTH': 'Value length ({length}) is less than minimum ({minLength})',
      'MAX_LENGTH': 'Value length ({length}) exceeds maximum ({maxLength})',
      'MINIMUM': 'Value ({value}) is less than minimum ({minimum})',
      'MAXIMUM': 'Value ({value}) exceeds maximum ({maximum})',
      'RULE_VIOLATION': '{ruleName}: {message}'
    };
  }

  /**
   * Interpolate template
   */
  interpolateTemplate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      if (key === 'field' && data.path) {
        return data.path.split('.').pop();
      }
      return data[key] || match;
    });
  }

  /**
   * Pluralize helper
   */
  pluralize(text, count) {
    return count === 1 ? text : text + 's';
  }

  /**
   * Generate report
   */
  generateReport(results, format = 'text') {
    const formatted = this.formatValidationResults(results);
    
    switch (format) {
      case 'text':
        return this.generateTextReport(formatted);
      case 'html':
        return this.generateHTMLReport(formatted);
      case 'json':
        return JSON.stringify(formatted, null, 2);
      default:
        return formatted;
    }
  }

  /**
   * Generate text report
   */
  generateTextReport(formatted) {
    const lines = [];
    
    // Summary
    lines.push('=== Validation Report ===');
    lines.push(`Status: ${formatted.summary.status.toUpperCase()}`);
    lines.push(formatted.summary.message);
    lines.push('');
    
    // Errors
    if (formatted.errors.length > 0) {
      lines.push('ERRORS:');
      formatted.errors.forEach((error, index) => {
        lines.push(`${index + 1}. ${error.message}`);
        if (error.location.path) {
          lines.push(`   Location: ${error.location.jsonPath}`);
        }
        if (error.hint) {
          lines.push(`   Hint: ${error.hint}`);
        }
        lines.push('');
      });
    }
    
    // Warnings
    if (formatted.warnings.length > 0) {
      lines.push('WARNINGS:');
      formatted.warnings.forEach((warning, index) => {
        lines.push(`${index + 1}. ${warning.message}`);
        if (warning.location.path) {
          lines.push(`   Location: ${warning.location.jsonPath}`);
        }
        lines.push('');
      });
    }
    
    // Hints
    if (formatted.hints) {
      lines.push('SUGGESTIONS:');
      formatted.hints.forEach(hint => {
        lines.push(`- ${hint.message}`);
        if (hint.suggestions) {
          hint.suggestions.forEach(suggestion => {
            lines.push(`  • ${suggestion}`);
          });
        }
        if (hint.fields) {
          lines.push(`  Fields: ${hint.fields.join(', ')}`);
        }
      });
    }
    
    return lines.join('\n');
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(formatted) {
    // Simple HTML report template
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .status-success { color: green; }
    .status-failed { color: red; }
    .error { background: #fee; padding: 10px; margin: 10px 0; border-left: 3px solid red; }
    .warning { background: #ffeaa7; padding: 10px; margin: 10px 0; border-left: 3px solid orange; }
    .hint { background: #e3f2fd; padding: 10px; margin: 10px 0; border-left: 3px solid blue; }
    .location { color: #666; font-size: 0.9em; }
    code { background: #f5f5f5; padding: 2px 4px; }
  </style>
</head>
<body>
  <h1>Validation Report</h1>
  <p class="status-${formatted.summary.status}">${formatted.summary.message}</p>
  
  ${formatted.errors.length > 0 ? `
    <h2>Errors</h2>
    ${formatted.errors.map(error => `
      <div class="error">
        <strong>${error.message}</strong>
        ${error.location.path ? `<div class="location">Location: <code>${error.location.jsonPath}</code></div>` : ''}
        ${error.hint ? `<div>💡 ${error.hint}</div>` : ''}
      </div>
    `).join('')}
  ` : ''}
  
  ${formatted.warnings.length > 0 ? `
    <h2>Warnings</h2>
    ${formatted.warnings.map(warning => `
      <div class="warning">
        <strong>${warning.message}</strong>
        ${warning.location.path ? `<div class="location">Location: <code>${warning.location.jsonPath}</code></div>` : ''}
      </div>
    `).join('')}
  ` : ''}
  
  ${formatted.hints ? `
    <h2>Suggestions</h2>
    ${formatted.hints.map(hint => `
      <div class="hint">
        <strong>${hint.message}</strong>
        ${hint.suggestions ? `<ul>${hint.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
        ${hint.fields ? `<div>Fields: ${hint.fields.join(', ')}</div>` : ''}
      </div>
    `).join('')}
  ` : ''}
</body>
</html>
    `;
  }
}

// Export singleton instance
export const errorFormatter = new ErrorFormatter();

export default ErrorFormatter;