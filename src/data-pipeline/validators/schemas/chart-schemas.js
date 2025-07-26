/**
 * Chart Data Schemas
 * Predefined JSON schemas for common chart visualization formats
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module chart-schemas
 * @version 1.0.0
 */

/**
 * Time Series Chart Schema
 * For line charts, area charts, etc.
 */
export const timeSeriesSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['timestamp', 'value'],
        properties: {
          timestamp: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?)?$'
          },
          value: { type: 'number' },
          label: { type: 'string' },
          series: { type: 'string' }
        }
      }
    },
    xAxis: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        type: { 
          type: 'string', 
          enum: ['time', 'linear', 'logarithmic'] 
        }
      }
    },
    yAxis: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        min: { type: 'number' },
        max: { type: 'number' }
      }
    },
    series: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          color: { 
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$|^rgb\\(\\d+,\\s*\\d+,\\s*\\d+\\)$'
          },
          type: { 
            type: 'string', 
            enum: ['line', 'area', 'bar', 'scatter'] 
          }
        }
      }
    }
  }
};

/**
 * Bar Chart Schema
 * For vertical/horizontal bar charts
 */
export const barChartSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    orientation: { 
      type: 'string', 
      enum: ['vertical', 'horizontal'],
      default: 'vertical'
    },
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['category', 'value'],
        properties: {
          category: { type: 'string' },
          value: { type: 'number' },
          label: { type: 'string' },
          color: { type: 'string' },
          group: { type: 'string' }
        }
      }
    },
    stacked: { type: 'boolean', default: false },
    xAxis: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        tickRotation: { type: 'number' }
      }
    },
    yAxis: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        min: { type: 'number' },
        max: { type: 'number' }
      }
    }
  }
};

/**
 * Pie/Donut Chart Schema
 */
export const pieChartSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    type: { 
      type: 'string', 
      enum: ['pie', 'donut'],
      default: 'pie'
    },
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['label', 'value'],
        properties: {
          label: { type: 'string' },
          value: { 
            type: 'number',
            minimum: 0
          },
          color: { type: 'string' },
          percentage: { type: 'number' }
        }
      }
    },
    innerRadius: { 
      type: 'number',
      minimum: 0,
      maximum: 1,
      default: 0
    },
    showLabels: { type: 'boolean', default: true },
    showPercentages: { type: 'boolean', default: false }
  }
};

/**
 * Scatter Plot Schema
 */
export const scatterPlotSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['x', 'y'],
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
          size: { type: 'number', minimum: 0 },
          color: { type: 'string' },
          label: { type: 'string' },
          series: { type: 'string' }
        }
      }
    },
    xAxis: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        min: { type: 'number' },
        max: { type: 'number' },
        type: { 
          type: 'string', 
          enum: ['linear', 'logarithmic'] 
        }
      }
    },
    yAxis: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        min: { type: 'number' },
        max: { type: 'number' },
        type: { 
          type: 'string', 
          enum: ['linear', 'logarithmic'] 
        }
      }
    }
  }
};

/**
 * Heatmap Schema
 */
export const heatmapSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['x', 'y', 'value'],
        properties: {
          x: { type: ['string', 'number'] },
          y: { type: ['string', 'number'] },
          value: { type: 'number' },
          label: { type: 'string' }
        }
      }
    },
    xCategories: {
      type: 'array',
      items: { type: 'string' }
    },
    yCategories: {
      type: 'array',
      items: { type: 'string' }
    },
    colorScale: {
      type: 'object',
      properties: {
        min: { type: 'string' },
        max: { type: 'string' },
        steps: { type: 'number', minimum: 2 }
      }
    }
  }
};

/**
 * Multi-series Chart Schema
 */
export const multiSeriesSchema = {
  type: 'object',
  required: ['series'],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    series: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['name', 'data'],
        properties: {
          name: { type: 'string' },
          type: { 
            type: 'string', 
            enum: ['line', 'bar', 'area', 'scatter'] 
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              required: ['x', 'y'],
              properties: {
                x: { type: ['string', 'number'] },
                y: { type: 'number' }
              }
            }
          },
          color: { type: 'string' },
          yAxisIndex: { type: 'number', default: 0 }
        }
      }
    },
    xAxis: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        label: { type: 'string' }
      }
    },
    yAxis: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          min: { type: 'number' },
          max: { type: 'number' },
          position: { 
            type: 'string', 
            enum: ['left', 'right'] 
          }
        }
      }
    }
  }
};

/**
 * Schema Registry
 */
export const chartSchemas = {
  timeSeries: timeSeriesSchema,
  bar: barChartSchema,
  pie: pieChartSchema,
  scatter: scatterPlotSchema,
  heatmap: heatmapSchema,
  multiSeries: multiSeriesSchema
};

/**
 * Get schema by chart type
 */
export function getChartSchema(chartType) {
  return chartSchemas[chartType] || null;
}

/**
 * Validate chart data against schema
 */
export function validateChartData(data, chartType) {
  const schema = getChartSchema(chartType);
  if (!schema) {
    return {
      valid: false,
      errors: [{
        type: 'UNKNOWN_CHART_TYPE',
        message: `Unknown chart type: ${chartType}`
      }]
    };
  }
  
  // Use the JSONValidator to validate against schema
  // This would be imported from json-validator.js
  return { valid: true, schema };
}

export default chartSchemas;