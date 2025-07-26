/**
 * Hierarchy Data Schemas
 * Predefined JSON schemas for hierarchical data structures
 * Part of PROJECT_html data ingestion pipeline
 * 
 * @module hierarchy-schemas
 * @version 1.0.0
 */

/**
 * Tree Structure Schema
 * For tree diagrams, organizational charts, etc.
 */
export const treeSchema = {
  type: 'object',
  required: ['root'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    root: {
      $ref: '#/definitions/treeNode'
    }
  },
  definitions: {
    treeNode: {
      type: 'object',
      required: ['id', 'label'],
      properties: {
        id: { type: ['string', 'number'] },
        label: { type: 'string' },
        value: { type: 'number' },
        metadata: { type: 'object' },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/treeNode' }
        }
      }
    }
  }
};

/**
 * Network/Graph Schema
 * For network diagrams, relationship maps
 */
export const networkSchema = {
  type: 'object',
  required: ['nodes', 'edges'],
  properties: {
    title: { type: 'string' },
    directed: { type: 'boolean', default: false },
    nodes: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: ['string', 'number'] },
          label: { type: 'string' },
          group: { type: 'string' },
          size: { type: 'number', minimum: 0 },
          color: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' },
          metadata: { type: 'object' }
        }
      }
    },
    edges: {
      type: 'array',
      items: {
        type: 'object',
        required: ['source', 'target'],
        properties: {
          id: { type: ['string', 'number'] },
          source: { type: ['string', 'number'] },
          target: { type: ['string', 'number'] },
          weight: { type: 'number', default: 1 },
          label: { type: 'string' },
          type: { 
            type: 'string',
            enum: ['solid', 'dashed', 'dotted']
          },
          color: { type: 'string' },
          metadata: { type: 'object' }
        }
      }
    },
    clusters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'nodes'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          nodes: {
            type: 'array',
            items: { type: ['string', 'number'] }
          },
          color: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Treemap Schema
 * For hierarchical space-filling visualizations
 */
export const treemapSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    title: { type: 'string' },
    data: {
      $ref: '#/definitions/treemapNode'
    },
    valueProperty: { 
      type: 'string',
      default: 'value'
    },
    colorProperty: { type: 'string' },
    colorScale: {
      type: 'object',
      properties: {
        type: { 
          type: 'string',
          enum: ['sequential', 'diverging', 'categorical']
        },
        domain: {
          type: 'array',
          items: { type: 'number' }
        },
        range: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  },
  definitions: {
    treemapNode: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        value: { type: 'number', minimum: 0 },
        color: { type: 'string' },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/treemapNode' }
        }
      }
    }
  }
};

/**
 * Sunburst/Radial Tree Schema
 */
export const sunburstSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    title: { type: 'string' },
    data: {
      $ref: '#/definitions/sunburstNode'
    },
    valueProperty: { 
      type: 'string',
      default: 'value'
    },
    startAngle: { 
      type: 'number',
      default: 0
    },
    endAngle: { 
      type: 'number',
      default: 360
    }
  },
  definitions: {
    sunburstNode: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        value: { type: 'number', minimum: 0 },
        color: { type: 'string' },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/sunburstNode' }
        }
      }
    }
  }
};

/**
 * Sankey Diagram Schema
 * For flow visualizations
 */
export const sankeySchema = {
  type: 'object',
  required: ['nodes', 'links'],
  properties: {
    title: { type: 'string' },
    nodes: {
      type: 'array',
      minItems: 2,
      items: {
        type: 'object',
        required: ['id', 'label'],
        properties: {
          id: { type: ['string', 'number'] },
          label: { type: 'string' },
          color: { type: 'string' },
          level: { type: 'number' }
        }
      }
    },
    links: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['source', 'target', 'value'],
        properties: {
          source: { type: ['string', 'number'] },
          target: { type: ['string', 'number'] },
          value: { type: 'number', minimum: 0 },
          color: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Mind Map Schema
 */
export const mindMapSchema = {
  type: 'object',
  required: ['central'],
  properties: {
    title: { type: 'string' },
    central: {
      type: 'object',
      required: ['topic'],
      properties: {
        topic: { type: 'string' },
        branches: {
          type: 'array',
          items: {
            $ref: '#/definitions/mindMapBranch'
          }
        }
      }
    }
  },
  definitions: {
    mindMapBranch: {
      type: 'object',
      required: ['topic'],
      properties: {
        topic: { type: 'string' },
        notes: { type: 'string' },
        color: { type: 'string' },
        icon: { type: 'string' },
        branches: {
          type: 'array',
          items: { $ref: '#/definitions/mindMapBranch' }
        }
      }
    }
  }
};

/**
 * Schema Registry
 */
export const hierarchySchemas = {
  tree: treeSchema,
  network: networkSchema,
  treemap: treemapSchema,
  sunburst: sunburstSchema,
  sankey: sankeySchema,
  mindMap: mindMapSchema
};

/**
 * Get schema by hierarchy type
 */
export function getHierarchySchema(hierarchyType) {
  return hierarchySchemas[hierarchyType] || null;
}

/**
 * Validate hierarchy data against schema
 */
export function validateHierarchyData(data, hierarchyType) {
  const schema = getHierarchySchema(hierarchyType);
  if (!schema) {
    return {
      valid: false,
      errors: [{
        type: 'UNKNOWN_HIERARCHY_TYPE',
        message: `Unknown hierarchy type: ${hierarchyType}`
      }]
    };
  }
  
  return { valid: true, schema };
}

export default hierarchySchemas;