/**
 * CSV Transformer Module
 * Transforms CSV data into visualization-ready JSON formats
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module csv-transformer
 * @version 1.0.0
 */

import { validateData } from '../validators/index.js';

/**
 * Transformation templates for common visualization types
 */
const TRANSFORM_TEMPLATES = {
  timeSeries: {
    requires: ['date', 'number'],
    transform: (data, options) => transformToTimeSeries(data, options)
  },
  categorical: {
    requires: ['string', 'number'],
    transform: (data, options) => transformToCategorical(data, options)
  },
  scatter: {
    requires: ['number', 'number'],
    transform: (data, options) => transformToScatter(data, options)
  },
  heatmap: {
    requires: ['string', 'string', 'number'],
    transform: (data, options) => transformToHeatmap(data, options)
  },
  pivot: {
    requires: ['string', 'string', 'number'],
    transform: (data, options) => transformToPivot(data, options)
  },
  hierarchical: {
    requires: ['string', 'string'],
    transform: (data, options) => transformToHierarchical(data, options)
  }
};

/**
 * CSV Transformer Class
 */
export class CSVTransformer {
  constructor(options = {}) {
    this.options = {
      autoDetect: true,
      targetFormat: null,
      dateColumn: null,
      valueColumns: [],
      categoryColumn: null,
      aggregation: 'sum', // sum, avg, count, min, max
      ...options
    };
  }

  /**
   * Transform CSV data to visualization format
   * @param {object} csvData - Parsed CSV data from csv-parser
   * @param {object} options - Transformation options
   * @returns {Promise<object>} Transformed and validated data
   */
  async transform(csvData, options = {}) {
    const opts = { ...this.options, ...options };
    
    // Extract metadata and data
    const { data, headers, visualizationHints, columnTypes } = csvData;
    
    if (!data || data.length === 0) {
      return {
        valid: false,
        error: 'No data to transform',
        data: null
      };
    }

    let transformedData;
    
    try {
      // Auto-detect format if not specified
      if (opts.autoDetect && !opts.targetFormat) {
        opts.targetFormat = this.detectBestFormat(columnTypes, visualizationHints);
      }

      // Apply transformation
      switch (opts.targetFormat) {
        case 'timeSeries':
          transformedData = await this.transformToTimeSeries(data, columnTypes, opts);
          break;
        case 'bar':
        case 'categorical':
          transformedData = await this.transformToCategorical(data, columnTypes, opts);
          break;
        case 'pie':
          transformedData = await this.transformToPie(data, columnTypes, opts);
          break;
        case 'scatter':
          transformedData = await this.transformToScatter(data, columnTypes, opts);
          break;
        case 'heatmap':
          transformedData = await this.transformToHeatmap(data, columnTypes, opts);
          break;
        case 'table':
          transformedData = await this.transformToTable(data, headers, columnTypes, opts);
          break;
        case 'pivot':
          transformedData = await this.transformToPivot(data, columnTypes, opts);
          break;
        default:
          // Default to table format
          transformedData = await this.transformToTable(data, headers, columnTypes, opts);
      }

      // Validate transformed data
      const validation = await validateData(transformedData, {
        format: { 
          type: this.getFormatType(opts.targetFormat), 
          subtype: opts.targetFormat 
        }
      });

      return {
        valid: validation.valid,
        data: transformedData,
        validation,
        metadata: {
          sourceFormat: 'csv',
          targetFormat: opts.targetFormat,
          rowCount: data.length,
          transformations: opts
        }
      };

    } catch (error) {
      return {
        valid: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Detect best visualization format
   */
  detectBestFormat(columnTypes, hints) {
    const types = Object.values(columnTypes);
    
    // Count column types
    const typeCount = {
      date: types.filter(t => t === 'date').length,
      number: types.filter(t => t === 'number').length,
      string: types.filter(t => t === 'string').length,
      boolean: types.filter(t => t === 'boolean').length
    };

    // Time series: has date and number columns
    if (typeCount.date >= 1 && typeCount.number >= 1) {
      return 'timeSeries';
    }

    // Scatter: has 2+ number columns
    if (typeCount.number >= 2) {
      return 'scatter';
    }

    // Categorical: has string and number columns
    if (typeCount.string >= 1 && typeCount.number >= 1) {
      return 'categorical';
    }

    // Default to table
    return 'table';
  }

  /**
   * Transform to time series format
   */
  async transformToTimeSeries(data, columnTypes, options) {
    // Find date column
    const dateColumns = Object.entries(columnTypes)
      .filter(([col, type]) => type === 'date')
      .map(([col]) => col);
    
    const dateColumn = options.dateColumn || dateColumns[0];
    
    if (!dateColumn) {
      throw new Error('No date column found for time series transformation');
    }

    // Find value columns
    const numberColumns = Object.entries(columnTypes)
      .filter(([col, type]) => type === 'number')
      .map(([col]) => col);
    
    const valueColumns = options.valueColumns.length > 0 ? 
      options.valueColumns : numberColumns;

    if (valueColumns.length === 0) {
      throw new Error('No numeric columns found for time series transformation');
    }

    // Transform data
    const seriesData = [];
    
    data.forEach(row => {
      const timestamp = this.parseDate(row[dateColumn]);
      
      valueColumns.forEach(col => {
        if (row[col] !== null) {
          seriesData.push({
            timestamp: timestamp,
            value: parseFloat(row[col]),
            series: col,
            label: `${col}: ${row[col]}`
          });
        }
      });
    });

    // Sort by timestamp
    seriesData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
      title: options.title || 'Time Series Data',
      subtitle: options.subtitle || `${dateColumn} vs ${valueColumns.join(', ')}`,
      data: seriesData,
      xAxis: {
        label: options.xLabel || dateColumn,
        type: 'time'
      },
      yAxis: {
        label: options.yLabel || 'Value'
      },
      series: valueColumns.map(col => ({
        name: col,
        type: 'line'
      }))
    };
  }

  /**
   * Transform to categorical format (bar chart)
   */
  async transformToCategorical(data, columnTypes, options) {
    // Find category column
    const stringColumns = Object.entries(columnTypes)
      .filter(([col, type]) => type === 'string')
      .map(([col]) => col);
    
    const categoryColumn = options.categoryColumn || stringColumns[0];
    
    if (!categoryColumn) {
      throw new Error('No category column found for categorical transformation');
    }

    // Find value columns
    const numberColumns = Object.entries(columnTypes)
      .filter(([col, type]) => type === 'number')
      .map(([col]) => col);
    
    const valueColumn = options.valueColumn || numberColumns[0];
    
    if (!valueColumn) {
      throw new Error('No value column found for categorical transformation');
    }

    // Aggregate data by category
    const aggregated = this.aggregateByCategory(data, categoryColumn, valueColumn, options.aggregation);

    return {
      title: options.title || 'Categorical Data',
      subtitle: options.subtitle || `${categoryColumn} by ${valueColumn}`,
      data: Object.entries(aggregated).map(([category, value]) => ({
        category,
        value,
        label: `${category}: ${value.toFixed(2)}`
      })),
      xAxis: {
        label: options.xLabel || categoryColumn
      },
      yAxis: {
        label: options.yLabel || valueColumn
      }
    };
  }

  /**
   * Transform to pie chart format
   */
  async transformToPie(data, columnTypes, options) {
    const categorical = await this.transformToCategorical(data, columnTypes, options);
    
    // Calculate percentages
    const total = categorical.data.reduce((sum, item) => sum + item.value, 0);
    
    return {
      title: categorical.title,
      subtitle: categorical.subtitle,
      type: options.donut ? 'donut' : 'pie',
      data: categorical.data.map(item => ({
        label: item.category,
        value: item.value,
        percentage: (item.value / total) * 100
      })),
      innerRadius: options.donut ? 0.5 : 0,
      showPercentages: true
    };
  }

  /**
   * Transform to scatter plot format
   */
  async transformToScatter(data, columnTypes, options) {
    const numberColumns = Object.entries(columnTypes)
      .filter(([col, type]) => type === 'number')
      .map(([col]) => col);
    
    if (numberColumns.length < 2) {
      throw new Error('Need at least 2 numeric columns for scatter plot');
    }

    const xColumn = options.xColumn || numberColumns[0];
    const yColumn = options.yColumn || numberColumns[1];
    const sizeColumn = options.sizeColumn || numberColumns[2];
    const colorColumn = options.colorColumn;

    const scatterData = data.map(row => {
      const point = {
        x: parseFloat(row[xColumn]),
        y: parseFloat(row[yColumn])
      };

      if (sizeColumn && row[sizeColumn] !== null) {
        point.size = parseFloat(row[sizeColumn]);
      }

      if (colorColumn && row[colorColumn] !== null) {
        point.series = row[colorColumn];
        point.color = row[colorColumn];
      }

      point.label = `${xColumn}: ${point.x}, ${yColumn}: ${point.y}`;

      return point;
    }).filter(point => !isNaN(point.x) && !isNaN(point.y));

    return {
      title: options.title || 'Scatter Plot',
      subtitle: options.subtitle || `${xColumn} vs ${yColumn}`,
      data: scatterData,
      xAxis: {
        label: options.xLabel || xColumn,
        type: 'linear'
      },
      yAxis: {
        label: options.yLabel || yColumn,
        type: 'linear'
      }
    };
  }

  /**
   * Transform to heatmap format
   */
  async transformToHeatmap(data, columnTypes, options) {
    const stringColumns = Object.entries(columnTypes)
      .filter(([col, type]) => type === 'string')
      .map(([col]) => col);
    
    const numberColumns = Object.entries(columnTypes)
      .filter(([col, type]) => type === 'number')
      .map(([col]) => col);

    if (stringColumns.length < 2 || numberColumns.length < 1) {
      throw new Error('Need at least 2 categorical and 1 numeric column for heatmap');
    }

    const xColumn = options.xColumn || stringColumns[0];
    const yColumn = options.yColumn || stringColumns[1];
    const valueColumn = options.valueColumn || numberColumns[0];

    // Create heatmap data
    const heatmapData = [];
    const xCategories = new Set();
    const yCategories = new Set();

    data.forEach(row => {
      const x = row[xColumn];
      const y = row[yColumn];
      const value = parseFloat(row[valueColumn]);

      if (x && y && !isNaN(value)) {
        xCategories.add(x);
        yCategories.add(y);
        heatmapData.push({ x, y, value });
      }
    });

    return {
      title: options.title || 'Heatmap',
      subtitle: options.subtitle || `${xColumn} × ${yColumn}: ${valueColumn}`,
      data: heatmapData,
      xCategories: Array.from(xCategories).sort(),
      yCategories: Array.from(yCategories).sort(),
      colorScale: {
        min: options.colorMin || '#e3f2fd',
        max: options.colorMax || '#1976d2'
      }
    };
  }

  /**
   * Transform to table format
   */
  async transformToTable(data, headers, columnTypes, options) {
    // Define column configuration
    const columns = headers.map(header => ({
      key: header,
      title: header,
      type: columnTypes[header] || 'string',
      sortable: true,
      filterable: true,
      width: options.columnWidths?.[header]
    }));

    // Process rows
    const rows = data.map((row, index) => ({
      _id: index,
      ...row
    }));

    return {
      title: options.title || 'Data Table',
      type: 'basic',
      columns,
      rows,
      data: rows, // For compatibility
      pagination: {
        enabled: options.pagination !== false,
        pageSize: options.pageSize || 50
      },
      sorting: {
        enabled: true,
        defaultSort: options.defaultSort
      },
      filtering: {
        enabled: true
      }
    };
  }

  /**
   * Transform to pivot table format
   */
  async transformToPivot(data, columnTypes, options) {
    if (!options.rowField || !options.columnField || !options.valueField) {
      throw new Error('Pivot transformation requires rowField, columnField, and valueField');
    }

    const pivotData = {};
    const rowValues = new Set();
    const columnValues = new Set();

    // Build pivot structure
    data.forEach(row => {
      const rowKey = row[options.rowField];
      const colKey = row[options.columnField];
      const value = parseFloat(row[options.valueField]);

      if (rowKey && colKey && !isNaN(value)) {
        rowValues.add(rowKey);
        columnValues.add(colKey);

        if (!pivotData[rowKey]) {
          pivotData[rowKey] = {};
        }

        if (!pivotData[rowKey][colKey]) {
          pivotData[rowKey][colKey] = [];
        }

        pivotData[rowKey][colKey].push(value);
      }
    });

    // Aggregate values
    const aggregated = {};
    rowValues.forEach(rowKey => {
      aggregated[rowKey] = {};
      columnValues.forEach(colKey => {
        const values = pivotData[rowKey]?.[colKey] || [];
        aggregated[rowKey][colKey] = this.aggregate(values, options.aggregation);
      });
    });

    return {
      title: options.title || 'Pivot Table',
      type: 'pivot',
      rowField: options.rowField,
      columnField: options.columnField,
      valueField: options.valueField,
      aggregation: options.aggregation,
      rowValues: Array.from(rowValues).sort(),
      columnValues: Array.from(columnValues).sort(),
      data: aggregated
    };
  }

  /**
   * Helper: Parse date
   */
  parseDate(value) {
    if (!value) return null;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      // Try common formats
      const formats = [
        /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
        /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
      ];

      for (const format of formats) {
        const match = value.match(format);
        if (match) {
          return new Date(match[3], match[1] - 1, match[2]).toISOString();
        }
      }
    }

    return date.toISOString();
  }

  /**
   * Helper: Aggregate by category
   */
  aggregateByCategory(data, categoryColumn, valueColumn, aggregation = 'sum') {
    const grouped = {};

    data.forEach(row => {
      const category = row[categoryColumn];
      const value = parseFloat(row[valueColumn]);

      if (category && !isNaN(value)) {
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(value);
      }
    });

    const aggregated = {};
    Object.entries(grouped).forEach(([category, values]) => {
      aggregated[category] = this.aggregate(values, aggregation);
    });

    return aggregated;
  }

  /**
   * Helper: Aggregate values
   */
  aggregate(values, method = 'sum') {
    if (values.length === 0) return 0;

    switch (method) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
      case 'average':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return values[0];
    }
  }

  /**
   * Helper: Get format type
   */
  getFormatType(format) {
    const chartFormats = ['timeSeries', 'bar', 'categorical', 'pie', 'scatter', 'heatmap'];
    const tableFormats = ['table', 'pivot', 'dataGrid'];
    const hierarchyFormats = ['tree', 'hierarchy'];

    if (chartFormats.includes(format)) return 'chart';
    if (tableFormats.includes(format)) return 'table';
    if (hierarchyFormats.includes(format)) return 'hierarchy';
    
    return 'unknown';
  }
}

// Export singleton instance
export const csvTransformer = new CSVTransformer();

// Export convenience function
export default async function transformCSV(csvData, options = {}) {
  const transformer = new CSVTransformer(options);
  return transformer.transform(csvData, options);
}