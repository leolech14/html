/**
 * Table Data Schemas
 * Predefined JSON schemas for tabular data formats
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module table-schemas
 * @version 1.0.0
 */

/**
 * Basic Table Schema
 * For simple data tables
 */
export const basicTableSchema = {
  type: 'object',
  required: ['columns', 'rows'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    columns: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['key', 'label'],
        properties: {
          key: { 
            type: 'string',
            pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$'
          },
          label: { type: 'string' },
          type: { 
            type: 'string',
            enum: ['string', 'number', 'boolean', 'date', 'datetime', 'url', 'email']
          },
          format: { type: 'string' },
          width: { type: 'number' },
          align: { 
            type: 'string',
            enum: ['left', 'center', 'right']
          },
          sortable: { type: 'boolean', default: true },
          filterable: { type: 'boolean', default: true }
        }
      }
    },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true
      }
    },
    metadata: {
      type: 'object',
      properties: {
        totalRows: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        sortBy: { type: 'string' },
        sortOrder: { 
          type: 'string',
          enum: ['asc', 'desc']
        }
      }
    }
  }
};

/**
 * Pivot Table Schema
 * For cross-tabulation data
 */
export const pivotTableSchema = {
  type: 'object',
  required: ['data', 'rowFields', 'columnFields', 'valueField'],
  properties: {
    title: { type: 'string' },
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: true
      }
    },
    rowFields: {
      type: 'array',
      minItems: 1,
      items: { type: 'string' }
    },
    columnFields: {
      type: 'array',
      minItems: 1,
      items: { type: 'string' }
    },
    valueField: { type: 'string' },
    aggregation: {
      type: 'string',
      enum: ['sum', 'count', 'average', 'min', 'max', 'median'],
      default: 'sum'
    },
    filters: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { type: ['string', 'number', 'boolean'] }
      }
    }
  }
};

/**
 * Data Grid Schema
 * For advanced grid with features
 */
export const dataGridSchema = {
  type: 'object',
  required: ['columns', 'data'],
  properties: {
    title: { type: 'string' },
    columns: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['field', 'headerName'],
        properties: {
          field: { type: 'string' },
          headerName: { type: 'string' },
          type: { 
            type: 'string',
            enum: ['string', 'number', 'boolean', 'date', 'dateTime', 'actions']
          },
          width: { type: 'number' },
          minWidth: { type: 'number' },
          maxWidth: { type: 'number' },
          flex: { type: 'number' },
          sortable: { type: 'boolean', default: true },
          filterable: { type: 'boolean', default: true },
          editable: { type: 'boolean', default: false },
          groupable: { type: 'boolean', default: false },
          aggregatable: { type: 'boolean', default: false },
          renderCell: { type: 'string' },
          valueFormatter: { type: 'string' },
          cellClassName: { type: 'string' },
          headerClassName: { type: 'string' }
        }
      }
    },
    data: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: ['string', 'number'] }
        },
        additionalProperties: true
      }
    },
    features: {
      type: 'object',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            pageSize: { type: 'number', default: 10 },
            pageSizeOptions: {
              type: 'array',
              items: { type: 'number' }
            }
          }
        },
        sorting: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            multiSort: { type: 'boolean', default: false }
          }
        },
        filtering: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            quickFilter: { type: 'boolean', default: true }
          }
        },
        grouping: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: false },
            defaultGrouped: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        export: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            formats: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['csv', 'excel', 'pdf']
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Matrix/Spreadsheet Schema
 * For spreadsheet-like data
 */
export const matrixSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    title: { type: 'string' },
    data: {
      oneOf: [
        {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: ['string', 'number', 'boolean', 'null']
            }
          }
        },
        {
          type: 'object',
          properties: {
            values: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: ['string', 'number', 'boolean', 'null']
                }
              }
            },
            formulas: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: ['string', 'null']
                }
              }
            },
            formats: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: ['object', 'null']
                }
              }
            }
          }
        }
      ]
    },
    headers: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: { type: 'string' }
        },
        columns: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    },
    metadata: {
      type: 'object',
      properties: {
        dimensions: {
          type: 'object',
          required: ['rows', 'columns'],
          properties: {
            rows: { type: 'number' },
            columns: { type: 'number' }
          }
        },
        dataType: {
          type: 'string',
          enum: ['numeric', 'mixed', 'text']
        }
      }
    }
  }
};

/**
 * Calendar/Schedule Schema
 * For time-based tabular data
 */
export const calendarSchema = {
  type: 'object',
  required: ['events'],
  properties: {
    title: { type: 'string' },
    view: {
      type: 'string',
      enum: ['month', 'week', 'day', 'year'],
      default: 'month'
    },
    events: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'start'],
        properties: {
          id: { type: ['string', 'number'] },
          title: { type: 'string' },
          start: {
            type: 'string',
            format: 'date-time'
          },
          end: {
            type: 'string',
            format: 'date-time'
          },
          allDay: { type: 'boolean', default: false },
          color: { type: 'string' },
          category: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          recurring: {
            type: 'object',
            properties: {
              frequency: {
                type: 'string',
                enum: ['daily', 'weekly', 'monthly', 'yearly']
              },
              interval: { type: 'number', minimum: 1 },
              until: {
                type: 'string',
                format: 'date'
              },
              count: { type: 'number', minimum: 1 }
            }
          }
        }
      }
    },
    resources: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          color: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Schema Registry
 */
export const tableSchemas = {
  basic: basicTableSchema,
  pivot: pivotTableSchema,
  dataGrid: dataGridSchema,
  matrix: matrixSchema,
  calendar: calendarSchema
};

/**
 * Get schema by table type
 */
export function getTableSchema(tableType) {
  return tableSchemas[tableType] || null;
}

/**
 * Validate table data against schema
 */
export function validateTableData(data, tableType) {
  const schema = getTableSchema(tableType);
  if (!schema) {
    return {
      valid: false,
      errors: [{
        type: 'UNKNOWN_TABLE_TYPE',
        message: `Unknown table type: ${tableType}`
      }]
    };
  }
  
  return { valid: true, schema };
}

export default tableSchemas;