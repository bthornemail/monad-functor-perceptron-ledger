/**
 * Validators Implementation
 * 
 * Implements input validation and geometric structure preservation checks
 * as specified in RFC XXXX. Provides comprehensive validation for all data structures.
 * 
 * @fileoverview Input validation with geometric structure preservation
 */

import type { NeuralArchitecture, IPv6Geometry, State, Graph, ConsensusType } from '../types/index.js';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Input validators for all data structures
 * 
 * REQUIRED features:
 * - Input validation for all data structures
 * - Geometric structure preservation checks
 * - Performance validators
 */
export class Validators {
  /**
   * Validate neural architecture
   * 
   * @param architecture Neural architecture to validate
   * @returns Validation result
   */
  static validateNeuralArchitecture(architecture: NeuralArchitecture): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate model family
    if (architecture.modelFamily < 0 || architecture.modelFamily > 15) {
      errors.push(`Model family ${architecture.modelFamily} is out of range [0, 15]`);
    }

    // Validate feature dimension
    if (architecture.featureDim < 1 || architecture.featureDim > 65535) {
      errors.push(`Feature dimension ${architecture.featureDim} is out of range [1, 65535]`);
    }

    // Validate hidden layers
    if (architecture.hiddenLayers < 0 || architecture.hiddenLayers > 15) {
      errors.push(`Hidden layers ${architecture.hiddenLayers} is out of range [0, 15]`);
    }

    // Validate output dimension
    if (architecture.outputDim < 1 || architecture.outputDim > 65535) {
      errors.push(`Output dimension ${architecture.outputDim} is out of range [1, 65535]`);
    }

    // Validate context length
    if (architecture.contextLength < 1 || architecture.contextLength > 65535) {
      errors.push(`Context length ${architecture.contextLength} is out of range [1, 65535]`);
    }

    // Warnings for unusual configurations
    if (architecture.hiddenLayers === 0 && architecture.featureDim !== architecture.outputDim) {
      warnings.push('No hidden layers with different input/output dimensions may cause issues');
    }

    if (architecture.featureDim > 10000) {
      warnings.push('Large feature dimensions may impact performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate IPv6 geometry
   * 
   * @param geometry IPv6 geometry to validate
   * @returns Validation result
   */
  static validateIPv6Geometry(geometry: IPv6Geometry): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate Fano points
    if (!geometry.fanoPoints || geometry.fanoPoints.length !== 7) {
      errors.push('Fano points must have exactly 7 elements');
    } else {
      for (let i = 0; i < geometry.fanoPoints.length; i++) {
        const point = geometry.fanoPoints[i];
        if (point < 0 || point > 65535) {
          errors.push(`Fano point ${i} value ${point} is out of range [0, 65535]`);
        }
      }
    }

    // Validate lottery winner
    if (!geometry.lotteryWinner || !geometry.lotteryWinner.pair) {
      errors.push('Lottery winner pair is required');
    } else {
      const [a, b] = geometry.lotteryWinner.pair;
      if (a < 0 || a > 6 || b < 0 || b > 6) {
        errors.push(`Lottery winner pair [${a}, ${b}] is out of range [0, 6]`);
      }
      if (a === b) {
        errors.push('Lottery winner pair must have different values');
      }
    }

    // Validate geometric shift
    if (!geometry.geometricShift) {
      errors.push('Geometric shift is required');
    } else {
      if (geometry.geometricShift.dimension < 0 || geometry.geometricShift.dimension > 3) {
        errors.push(`Geometric shift dimension ${geometry.geometricShift.dimension} is out of range [0, 3]`);
      }
      if (geometry.geometricShift.direction !== '+' && geometry.geometricShift.direction !== '-') {
        errors.push(`Geometric shift direction must be '+' or '-', got '${geometry.geometricShift.direction}'`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate state vector
   * 
   * @param state State to validate
   * @returns Validation result
   */
  static validateState(state: State): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate values array
    if (!state.values || !Array.isArray(state.values)) {
      errors.push('State values must be an array');
    } else {
      if (state.values.length !== 7) {
        errors.push(`State must have exactly 7 dimensions, got ${state.values.length}`);
      }

      for (let i = 0; i < state.values.length; i++) {
        const value = state.values[i];
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`State value ${i} must be a valid number, got ${value}`);
        } else if (value < 0 || value > 1) {
          warnings.push(`State value ${i} is outside typical range [0, 1]: ${value}`);
        }
      }
    }

    // Validate basis
    if (!state.basis) {
      errors.push('State basis is required');
    }

    // Validate timestamp
    if (!state.timestamp || typeof state.timestamp !== 'number' || state.timestamp <= 0) {
      errors.push('State timestamp must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate graph structure
   * 
   * @param graph Graph to validate
   * @returns Validation result
   */
  static validateGraph(graph: Graph): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate vertices
    if (!graph.vertices || !Array.isArray(graph.vertices)) {
      errors.push('Graph vertices must be an array');
    } else {
      if (graph.vertices.length === 0) {
        errors.push('Graph must have at least one vertex');
      }

      // Check for duplicate vertices
      const uniqueVertices = new Set(graph.vertices);
      if (uniqueVertices.size !== graph.vertices.length) {
        errors.push('Graph vertices must be unique');
      }

      // Check for valid vertex names
      for (const vertex of graph.vertices) {
        if (typeof vertex !== 'string' || vertex.length === 0) {
          errors.push(`Invalid vertex name: ${vertex}`);
        }
      }
    }

    // Validate edges
    if (!graph.edges || !Array.isArray(graph.edges)) {
      errors.push('Graph edges must be an array');
    } else {
      for (let i = 0; i < graph.edges.length; i++) {
        const edge = graph.edges[i];
        if (!Array.isArray(edge) || edge.length !== 2) {
          errors.push(`Edge ${i} must be an array of two vertices`);
        } else {
          const [u, v] = edge;
          if (!graph.vertices.includes(u)) {
            errors.push(`Edge ${i} references non-existent vertex: ${u}`);
          }
          if (!graph.vertices.includes(v)) {
            errors.push(`Edge ${i} references non-existent vertex: ${v}`);
          }
          if (u === v) {
            errors.push(`Edge ${i} is a self-loop: ${u} -> ${v}`);
          }
        }
      }

      // Check for duplicate edges
      const edgeSet = new Set<string>();
      for (const edge of graph.edges) {
        const [u, v] = edge;
        const edgeKey1 = `${u}-${v}`;
        const edgeKey2 = `${v}-${u}`;
        if (edgeSet.has(edgeKey1) || edgeSet.has(edgeKey2)) {
          errors.push(`Duplicate edge: ${u} - ${v}`);
        }
        edgeSet.add(edgeKey1);
        edgeSet.add(edgeKey2);
      }
    }

    // Warnings for large graphs
    if (graph.vertices.length > 1000) {
      warnings.push('Large graphs may impact performance');
    }

    if (graph.edges.length > 10000) {
      warnings.push('Graphs with many edges may impact performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate consensus type
   * 
   * @param type Consensus type to validate
   * @returns Validation result
   */
  static validateConsensusType(type: ConsensusType): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTypes: ConsensusType[] = ['TETRAHEDRON', 'CUBE', 'OCTAHEDRON'];
    
    if (!validTypes.includes(type)) {
      errors.push(`Invalid consensus type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate geometric structure preservation
   * 
   * @param structure Geometric structure to validate
   * @returns Validation result
   */
  static validateGeometricStructurePreservation(structure: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate Fano plane structure
    if (structure.fanoPlane) {
      const fanoValidation = this.validateFanoPlaneStructure(structure.fanoPlane);
      errors.push(...fanoValidation.errors);
      warnings.push(...fanoValidation.warnings);
    }

    // Validate block design structure
    if (structure.blockDesign) {
      const blockValidation = this.validateBlockDesignStructure(structure.blockDesign);
      errors.push(...blockValidation.errors);
      warnings.push(...blockValidation.warnings);
    }

    // Validate Hilbert space structure
    if (structure.hilbertSpace) {
      const hilbertValidation = this.validateHilbertSpaceStructure(structure.hilbertSpace);
      errors.push(...hilbertValidation.errors);
      warnings.push(...hilbertValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Fano plane structure
   * 
   * @param fanoPlane Fano plane structure
   * @returns Validation result
   */
  private static validateFanoPlaneStructure(fanoPlane: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!fanoPlane.points || fanoPlane.points.length !== 7) {
      errors.push('Fano plane must have exactly 7 points');
    }

    if (!fanoPlane.lines || fanoPlane.lines.length !== 7) {
      errors.push('Fano plane must have exactly 7 lines');
    }

    // Validate projective plane axioms
    if (fanoPlane.points && fanoPlane.lines) {
      // Check that each line has exactly 3 points
      for (const line of fanoPlane.lines) {
        if (!line.points || line.points.length !== 3) {
          errors.push(`Fano plane line must have exactly 3 points, got ${line.points?.length || 0}`);
        }
      }

      // Check that each point lies on exactly 3 lines
      for (const point of fanoPlane.points) {
        const linesThroughPoint = fanoPlane.lines.filter((line: any) => 
          line.points && line.points.includes(point.id)
        );
        if (linesThroughPoint.length !== 3) {
          errors.push(`Fano plane point must lie on exactly 3 lines, got ${linesThroughPoint.length}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate block design structure
   * 
   * @param blockDesign Block design structure
   * @returns Validation result
   */
  private static validateBlockDesignStructure(blockDesign: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!blockDesign.parameters) {
      errors.push('Block design parameters are required');
    } else {
      const { v, k, lambda, r, b } = blockDesign.parameters;

      // Validate BIBD conditions
      if (v * r !== b * k) {
        errors.push(`BIBD condition violated: vr = ${v * r} ≠ bk = ${b * k}`);
      }

      if (lambda * (v - 1) !== r * (k - 1)) {
        errors.push(`BIBD condition violated: λ(v-1) = ${lambda * (v - 1)} ≠ r(k-1) = ${r * (k - 1)}`);
      }

      // Validate parameter ranges
      if (v <= 0 || k <= 0 || lambda <= 0 || r <= 0 || b <= 0) {
        errors.push('All BIBD parameters must be positive');
      }

      if (k > v) {
        errors.push('Block size k cannot exceed number of points v');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Hilbert space structure
   * 
   * @param hilbertSpace Hilbert space structure
   * @returns Validation result
   */
  private static validateHilbertSpaceStructure(hilbertSpace: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!hilbertSpace.basis) {
      errors.push('Hilbert space basis is required');
    } else {
      const expectedBasis = ['Node', 'Edge', 'Graph', 'Incidence', 'Hypergraph', 'Functor', 'Monad'];
      const actualBasis = Object.keys(hilbertSpace.basis);
      
      if (actualBasis.length !== expectedBasis.length) {
        errors.push(`Hilbert space basis must have exactly ${expectedBasis.length} elements, got ${actualBasis.length}`);
      }

      for (const expectedElement of expectedBasis) {
        if (!actualBasis.includes(expectedElement)) {
          errors.push(`Hilbert space basis missing element: ${expectedElement}`);
        }
      }
    }

    if (!hilbertSpace.isComplete) {
      errors.push('Hilbert space must be complete');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate performance constraints
   * 
   * @param constraints Performance constraints
   * @returns Validation result
   */
  static validatePerformanceConstraints(constraints: {
    maxSteps?: number;
    maxVertices?: number;
    maxEdges?: number;
    maxParticipants?: number;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate max steps
    if (constraints.maxSteps !== undefined) {
      if (constraints.maxSteps < 1 || constraints.maxSteps > 14) {
        errors.push(`Max steps ${constraints.maxSteps} is out of range [1, 14]`);
      }
    }

    // Validate max vertices
    if (constraints.maxVertices !== undefined) {
      if (constraints.maxVertices < 1 || constraints.maxVertices > 10000) {
        errors.push(`Max vertices ${constraints.maxVertices} is out of range [1, 10000]`);
      }
    }

    // Validate max edges
    if (constraints.maxEdges !== undefined) {
      if (constraints.maxEdges < 0 || constraints.maxEdges > 50000) {
        errors.push(`Max edges ${constraints.maxEdges} is out of range [0, 50000]`);
      }
    }

    // Validate max participants
    if (constraints.maxParticipants !== undefined) {
      if (constraints.maxParticipants < 1 || constraints.maxParticipants > 7) {
        errors.push(`Max participants ${constraints.maxParticipants} is out of range [1, 7]`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get validator statistics
   * 
   * @returns Validator statistics
   */
  static getStatistics(): {
    supportedValidations: string[];
    maxErrors: number;
    maxWarnings: number;
  } {
    return {
      supportedValidations: [
        'neuralArchitecture',
        'ipv6Geometry',
        'state',
        'graph',
        'consensusType',
        'geometricStructure',
        'performanceConstraints'
      ],
      maxErrors: 100,
      maxWarnings: 50
    };
  }
}
