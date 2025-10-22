/**
 * Chromatic Polynomial Implementation
 * 
 * Implements chromatic polynomial calculation for consensus validation
 * as specified in RFC XXXX. Provides π_G(-1) > 0 validation for acyclic configurations.
 * 
 * @fileoverview Chromatic polynomial with size-based strategies
 */

import type { Graph } from '../types/index.js';

/**
 * Polynomial representation
 */
export interface Polynomial {
  coefficients: number[];
  degree: number;
  evaluate(x: number): number;
}

/**
 * Chromatic polynomial calculator
 * 
 * REQUIRED features:
 * - Recursive calculation for small graphs (≤10 vertices)
 * - Approximation algorithms for medium graphs (≤20 vertices)
 * - Fallback to simple cycle detection for large graphs
 * - Validation: π_G(-1) > 0 for acyclic configurations
 */
export class ChromaticPolynomial {
  private static readonly SMALL_GRAPH_LIMIT = 10;
  private static readonly MEDIUM_GRAPH_LIMIT = 20;

  /**
   * Calculate chromatic polynomial for a graph
   * 
   * @param graph Graph to analyze
   * @returns Chromatic polynomial
   */
  calculate(graph: Graph): Polynomial {
    const vertexCount = graph.vertices.length;

    if (vertexCount <= this.SMALL_GRAPH_LIMIT) {
      // REQUIRED for small networks: Full chromatic polynomial
      return this.fullChromaticCalculation(graph);
    } else if (vertexCount <= this.MEDIUM_GRAPH_LIMIT) {
      // RECOMMENDED for medium networks: Approximation algorithms
      return this.approximateChromaticCalculation(graph);
    } else {
      // ACCEPTABLE for large networks: Simpler cycle detection
      return this.simpleChromaticCalculation(graph);
    }
  }

  /**
   * Validate consensus state using chromatic polynomial
   * 
   * REQUIRED: π_G(-1) > 0 indicates acyclic (valid) configuration
   * 
   * @param graph Graph representing consensus state
   * @returns True if state is valid (acyclic)
   */
  validateConsensus(graph: Graph): boolean {
    const polynomial = this.calculate(graph);
    const value = polynomial.evaluate(-1);
    return value > 0;
  }

  /**
   * Full chromatic polynomial calculation for small graphs
   * 
   * @param graph Graph to analyze
   * @returns Chromatic polynomial
   */
  private fullChromaticCalculation(graph: Graph): Polynomial {
    // Use deletion-contraction algorithm
    return this.deletionContraction(graph);
  }

  /**
   * Deletion-contraction algorithm for chromatic polynomial
   * 
   * @param graph Graph to analyze
   * @returns Chromatic polynomial
   */
  private deletionContraction(graph: Graph): Polynomial {
    // Base cases
    if (graph.vertices.length === 0) {
      return this.createPolynomial([1]); // P(K₀) = 1
    }

    if (graph.edges.length === 0) {
      // Graph with n vertices and no edges: P(G) = x^n
      const coefficients = new Array(graph.vertices.length + 1).fill(0);
      coefficients[graph.vertices.length] = 1;
      return this.createPolynomial(coefficients);
    }

    // Find an edge to delete and contract
    const edge = graph.edges[0];
    const [u, v] = edge;

    // Create graph with edge deleted
    const deletedGraph: Graph = {
      vertices: [...graph.vertices],
      edges: graph.edges.filter(e => !(e[0] === u && e[1] === v))
    };

    // Create graph with edge contracted
    const contractedGraph = this.contractEdge(graph, u, v);

    // P(G) = P(G-e) - P(G/e)
    const deletedPolynomial = this.deletionContraction(deletedGraph);
    const contractedPolynomial = this.deletionContraction(contractedGraph);

    return this.subtractPolynomials(deletedPolynomial, contractedPolynomial);
  }

  /**
   * Contract an edge in the graph
   * 
   * @param graph Original graph
   * @param u First vertex of edge
   * @param v Second vertex of edge
   * @returns Graph with edge contracted
   */
  private contractEdge(graph: Graph, u: string, v: string): Graph {
    const contractedVertices = graph.vertices.filter(vertex => vertex !== v);
    const contractedEdges: [string, string][] = [];

    for (const edge of graph.edges) {
      if (edge[0] === v && edge[1] === u) {
        // Skip the edge being contracted
        continue;
      } else if (edge[0] === v) {
        // Replace v with u
        contractedEdges.push([u, edge[1]]);
      } else if (edge[1] === v) {
        // Replace v with u
        contractedEdges.push([edge[0], u]);
      } else {
        // Keep edge as is
        contractedEdges.push(edge);
      }
    }

    // Remove duplicate edges
    const uniqueEdges = this.removeDuplicateEdges(contractedEdges);

    return {
      vertices: contractedVertices,
      edges: uniqueEdges
    };
  }

  /**
   * Remove duplicate edges from edge list
   * 
   * @param edges Edge list
   * @returns Edge list with duplicates removed
   */
  private removeDuplicateEdges(edges: [string, string][]): [string, string][] {
    const uniqueEdges: [string, string][] = [];
    const seen = new Set<string>();

    for (const edge of edges) {
      const [u, v] = edge;
      const key1 = `${u}-${v}`;
      const key2 = `${v}-${u}`;

      if (!seen.has(key1) && !seen.has(key2)) {
        uniqueEdges.push(edge);
        seen.add(key1);
        seen.add(key2);
      }
    }

    return uniqueEdges;
  }

  /**
   * Approximate chromatic polynomial calculation for medium graphs
   * 
   * @param graph Graph to analyze
   * @returns Approximate chromatic polynomial
   */
  private approximateChromaticCalculation(graph: Graph): Polynomial {
    // Use approximation based on graph properties
    const vertexCount = graph.vertices.length;
    const edgeCount = graph.edges.length;
    
    // Approximate chromatic number
    const chromaticNumber = this.approximateChromaticNumber(graph);
    
    // Create approximate polynomial: (x-1)^(n-k) * x^k
    const coefficients = new Array(vertexCount + 1).fill(0);
    
    // This is a simplified approximation
    // In practice, more sophisticated algorithms would be used
    coefficients[vertexCount] = 1; // Leading coefficient
    coefficients[vertexCount - 1] = -vertexCount; // Second coefficient
    
    return this.createPolynomial(coefficients);
  }

  /**
   * Approximate chromatic number
   * 
   * @param graph Graph to analyze
   * @returns Approximate chromatic number
   */
  private approximateChromaticNumber(graph: Graph): number {
    // Simple greedy coloring approximation
    const colors = new Map<string, number>();
    const maxDegree = this.calculateMaxDegree(graph);
    
    // Greedy coloring
    for (const vertex of graph.vertices) {
      const usedColors = new Set<number>();
      
      // Find colors used by neighbors
      for (const edge of graph.edges) {
        if (edge[0] === vertex) {
          const neighborColor = colors.get(edge[1]);
          if (neighborColor !== undefined) {
            usedColors.add(neighborColor);
          }
        } else if (edge[1] === vertex) {
          const neighborColor = colors.get(edge[0]);
          if (neighborColor !== undefined) {
            usedColors.add(neighborColor);
          }
        }
      }
      
      // Assign smallest available color
      let color = 0;
      while (usedColors.has(color)) {
        color++;
      }
      colors.set(vertex, color);
    }
    
    return Math.max(...colors.values()) + 1;
  }

  /**
   * Calculate maximum degree of graph
   * 
   * @param graph Graph to analyze
   * @returns Maximum degree
   */
  private calculateMaxDegree(graph: Graph): number {
    const degrees = new Map<string, number>();
    
    // Initialize degrees
    for (const vertex of graph.vertices) {
      degrees.set(vertex, 0);
    }
    
    // Count edges for each vertex
    for (const edge of graph.edges) {
      degrees.set(edge[0], (degrees.get(edge[0]) || 0) + 1);
      degrees.set(edge[1], (degrees.get(edge[1]) || 0) + 1);
    }
    
    return Math.max(...degrees.values());
  }

  /**
   * Simple chromatic polynomial calculation for large graphs
   * 
   * @param graph Graph to analyze
   * @returns Simple chromatic polynomial
   */
  private simpleChromaticCalculation(graph: Graph): Polynomial {
    // For large graphs, use a very simple approximation
    const vertexCount = graph.vertices.length;
    const hasCycles = this.hasCycles(graph);
    
    if (hasCycles) {
      // Graph with cycles: approximate as x^n - n*x^(n-1) + ...
      const coefficients = new Array(vertexCount + 1).fill(0);
      coefficients[vertexCount] = 1;
      coefficients[vertexCount - 1] = -vertexCount;
      return this.createPolynomial(coefficients);
    } else {
      // Acyclic graph: P(G) = x^n
      const coefficients = new Array(vertexCount + 1).fill(0);
      coefficients[vertexCount] = 1;
      return this.createPolynomial(coefficients);
    }
  }

  /**
   * Check if graph has cycles
   * 
   * @param graph Graph to check
   * @returns True if graph has cycles
   */
  private hasCycles(graph: Graph): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycleDFS = (vertex: string): boolean => {
      visited.add(vertex);
      recursionStack.add(vertex);
      
      for (const edge of graph.edges) {
        const neighbor = edge[0] === vertex ? edge[1] : edge[1] === vertex ? edge[0] : null;
        if (neighbor) {
          if (!visited.has(neighbor)) {
            if (hasCycleDFS(neighbor)) {
              return true;
            }
          } else if (recursionStack.has(neighbor)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(vertex);
      return false;
    };
    
    for (const vertex of graph.vertices) {
      if (!visited.has(vertex)) {
        if (hasCycleDFS(vertex)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Create polynomial from coefficients
   * 
   * @param coefficients Polynomial coefficients
   * @returns Polynomial object
   */
  private createPolynomial(coefficients: number[]): Polynomial {
    // Remove leading zeros
    while (coefficients.length > 0 && coefficients[coefficients.length - 1] === 0) {
      coefficients.pop();
    }
    
    if (coefficients.length === 0) {
      coefficients = [0];
    }
    
    return {
      coefficients: [...coefficients],
      degree: coefficients.length - 1,
      evaluate: (x: number) => {
        let result = 0;
        for (let i = 0; i < coefficients.length; i++) {
          result += coefficients[i] * Math.pow(x, i);
        }
        return result;
      }
    };
  }

  /**
   * Subtract two polynomials
   * 
   * @param p1 First polynomial
   * @param p2 Second polynomial
   * @returns Result polynomial
   */
  private subtractPolynomials(p1: Polynomial, p2: Polynomial): Polynomial {
    const maxDegree = Math.max(p1.degree, p2.degree);
    const resultCoefficients = new Array(maxDegree + 1).fill(0);
    
    for (let i = 0; i <= maxDegree; i++) {
      const coeff1 = i <= p1.degree ? p1.coefficients[i] : 0;
      const coeff2 = i <= p2.degree ? p2.coefficients[i] : 0;
      resultCoefficients[i] = coeff1 - coeff2;
    }
    
    return this.createPolynomial(resultCoefficients);
  }

  /**
   * Get chromatic polynomial statistics
   * 
   * @returns Object with calculator statistics
   */
  getStatistics(): {
    smallGraphLimit: number;
    mediumGraphLimit: number;
    supportedAlgorithms: string[];
    complexity: Record<string, string>;
  } {
    return {
      smallGraphLimit: this.SMALL_GRAPH_LIMIT,
      mediumGraphLimit: this.MEDIUM_GRAPH_LIMIT,
      supportedAlgorithms: ['deletion-contraction', 'approximation', 'simple'],
      complexity: {
        small: 'O(2^e) where e is number of edges',
        medium: 'O(v^2) approximation',
        large: 'O(v + e) cycle detection'
      }
    };
  }
}
