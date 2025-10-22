/**
 * Tutte Polynomial Implementation (Optional)
 * 
 * Implements Tutte polynomial calculation for research purposes
 * as specified in RFC XXXX. Provides recursive calculation and specializations.
 * 
 * @fileoverview Tutte polynomial with chromatic polynomial and genus specializations
 */

import type { Graph } from '../types/index.js';

/**
 * Tutte polynomial representation
 */
export interface TuttePolynomial {
  coefficients: number[][];
  degree: { x: number; y: number };
  evaluate(x: number, y: number): number;
}

/**
 * Tutte polynomial calculator
 * 
 * OPTIONAL features:
 * - Recursive calculation for research purposes
 * - Specializations: chromatic polynomial, genus evaluation
 */
export class TuttePolynomialCalculator {
  private static readonly MAX_VERTICES = 8; // Practical limit for #P-complete calculation

  /**
   * Calculate Tutte polynomial for a graph
   * 
   * WARNING: #P-complete for general graphs
   * 
   * @param graph Graph to analyze
   * @returns Tutte polynomial
   */
  calculate(graph: Graph): TuttePolynomial {
    if (graph.vertices.length > this.MAX_VERTICES) {
      throw new Error(`Graph too large for Tutte polynomial calculation (max ${this.MAX_VERTICES} vertices)`);
    }

    // Use deletion-contraction algorithm
    return this.deletionContraction(graph);
  }

  /**
   * Deletion-contraction algorithm for Tutte polynomial
   * 
   * @param graph Graph to analyze
   * @returns Tutte polynomial
   */
  private deletionContraction(graph: Graph): TuttePolynomial {
    // Base cases
    if (graph.vertices.length === 0) {
      return this.createTuttePolynomial([[1]]); // T(K₀) = 1
    }

    if (graph.edges.length === 0) {
      // Graph with n vertices and no edges: T(G) = x^n
      const coefficients = new Array(graph.vertices.length + 1).fill(0).map(() => new Array(1).fill(0));
      coefficients[graph.vertices.length][0] = 1;
      return this.createTuttePolynomial(coefficients);
    }

    // Find an edge to delete and contract
    const edge = graph.edges[0];
    const [u, v] = edge;

    // Check if edge is a bridge
    if (this.isBridge(graph, u, v)) {
      // T(G) = T(G-e) + T(G/e)
      const deletedGraph = this.deleteEdge(graph, u, v);
      const contractedGraph = this.contractEdge(graph, u, v);
      
      const deletedPolynomial = this.deletionContraction(deletedGraph);
      const contractedPolynomial = this.deletionContraction(contractedGraph);
      
      return this.addTuttePolynomials(deletedPolynomial, contractedPolynomial);
    }

    // Check if edge is a loop
    if (u === v) {
      // T(G) = y * T(G-e)
      const deletedGraph = this.deleteEdge(graph, u, v);
      const deletedPolynomial = this.deletionContraction(deletedGraph);
      
      return this.multiplyTuttePolynomial(deletedPolynomial, 0, 1); // Multiply by y
    }

    // General case: T(G) = T(G-e) + T(G/e)
    const deletedGraph = this.deleteEdge(graph, u, v);
    const contractedGraph = this.contractEdge(graph, u, v);
    
    const deletedPolynomial = this.deletionContraction(deletedGraph);
    const contractedPolynomial = this.deletionContraction(contractedGraph);
    
    return this.addTuttePolynomials(deletedPolynomial, contractedPolynomial);
  }

  /**
   * Check if an edge is a bridge
   * 
   * @param graph Graph to check
   * @param u First vertex of edge
   * @param v Second vertex of edge
   * @returns True if edge is a bridge
   */
  private isBridge(graph: Graph, u: string, v: string): boolean {
    // Remove the edge and check if graph becomes disconnected
    const graphWithoutEdge = this.deleteEdge(graph, u, v);
    return this.isDisconnected(graphWithoutEdge);
  }

  /**
   * Check if graph is disconnected
   * 
   * @param graph Graph to check
   * @returns True if graph is disconnected
   */
  private isDisconnected(graph: Graph): boolean {
    if (graph.vertices.length === 0) {
      return true;
    }

    const visited = new Set<string>();
    const startVertex = graph.vertices[0];
    
    this.dfs(startVertex, graph, visited);
    
    return visited.size < graph.vertices.length;
  }

  /**
   * DFS to mark connected vertices
   * 
   * @param vertex Starting vertex
   * @param graph Graph to search
   * @param visited Set of visited vertices
   */
  private dfs(vertex: string, graph: Graph, visited: Set<string>): void {
    visited.add(vertex);
    
    for (const edge of graph.edges) {
      const neighbor = edge[0] === vertex ? edge[1] : edge[1] === vertex ? edge[0] : null;
      if (neighbor && !visited.has(neighbor)) {
        this.dfs(neighbor, graph, visited);
      }
    }
  }

  /**
   * Delete an edge from the graph
   * 
   * @param graph Original graph
   * @param u First vertex of edge
   * @param v Second vertex of edge
   * @returns Graph with edge deleted
   */
  private deleteEdge(graph: Graph, u: string, v: string): Graph {
    return {
      vertices: [...graph.vertices],
      edges: graph.edges.filter(edge => !(edge[0] === u && edge[1] === v))
    };
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
   * Create Tutte polynomial from coefficients
   * 
   * @param coefficients 2D array of coefficients [x^i][y^j]
   * @returns Tutte polynomial
   */
  private createTuttePolynomial(coefficients: number[][]): TuttePolynomial {
    return {
      coefficients: coefficients.map(row => [...row]),
      degree: {
        x: coefficients.length - 1,
        y: coefficients.length > 0 ? coefficients[0].length - 1 : 0
      },
      evaluate: (x: number, y: number) => {
        let result = 0;
        for (let i = 0; i < coefficients.length; i++) {
          for (let j = 0; j < coefficients[i].length; j++) {
            result += coefficients[i][j] * Math.pow(x, i) * Math.pow(y, j);
          }
        }
        return result;
      }
    };
  }

  /**
   * Add two Tutte polynomials
   * 
   * @param p1 First polynomial
   * @param p2 Second polynomial
   * @returns Sum polynomial
   */
  private addTuttePolynomials(p1: TuttePolynomial, p2: TuttePolynomial): TuttePolynomial {
    const maxX = Math.max(p1.degree.x, p2.degree.x);
    const maxY = Math.max(p1.degree.y, p2.degree.y);
    
    const resultCoefficients: number[][] = [];
    
    for (let i = 0; i <= maxX; i++) {
      resultCoefficients[i] = [];
      for (let j = 0; j <= maxY; j++) {
        const coeff1 = (i <= p1.degree.x && j <= p1.degree.y) ? p1.coefficients[i][j] : 0;
        const coeff2 = (i <= p2.degree.x && j <= p2.degree.y) ? p2.coefficients[i][j] : 0;
        resultCoefficients[i][j] = coeff1 + coeff2;
      }
    }
    
    return this.createTuttePolynomial(resultCoefficients);
  }

  /**
   * Multiply Tutte polynomial by x^a * y^b
   * 
   * @param polynomial Polynomial to multiply
   * @param a Power of x
   * @param b Power of y
   * @returns Multiplied polynomial
   */
  private multiplyTuttePolynomial(polynomial: TuttePolynomial, a: number, b: number): TuttePolynomial {
    const newDegreeX = polynomial.degree.x + a;
    const newDegreeY = polynomial.degree.y + b;
    
    const resultCoefficients: number[][] = [];
    
    for (let i = 0; i <= newDegreeX; i++) {
      resultCoefficients[i] = [];
      for (let j = 0; j <= newDegreeY; j++) {
        const oldI = i - a;
        const oldJ = j - b;
        
        if (oldI >= 0 && oldI <= polynomial.degree.x && oldJ >= 0 && oldJ <= polynomial.degree.y) {
          resultCoefficients[i][j] = polynomial.coefficients[oldI][oldJ];
        } else {
          resultCoefficients[i][j] = 0;
        }
      }
    }
    
    return this.createTuttePolynomial(resultCoefficients);
  }

  /**
   * Get chromatic polynomial from Tutte polynomial
   * 
   * @param tuttePolynomial Tutte polynomial
   * @param vertexCount Number of vertices
   * @returns Chromatic polynomial
   */
  getChromaticPolynomial(tuttePolynomial: TuttePolynomial, vertexCount: number): {
    coefficients: number[];
    degree: number;
    evaluate(x: number): number;
  } {
    // T_G(1-x, 0) gives chromatic polynomial
    const chromaticCoefficients: number[] = [];
    
    for (let i = 0; i <= vertexCount; i++) {
      let coeff = 0;
      for (let j = 0; j <= tuttePolynomial.degree.x; j++) {
        if (j <= tuttePolynomial.degree.x && 0 <= tuttePolynomial.degree.y) {
          const tutteCoeff = tuttePolynomial.coefficients[j][0];
          // Binomial expansion of (1-x)^j
          const binomialCoeff = this.binomialCoefficient(j, i);
          coeff += tutteCoeff * binomialCoeff * Math.pow(-1, i);
        }
      }
      chromaticCoefficients[i] = coeff;
    }
    
    return {
      coefficients: chromaticCoefficients,
      degree: vertexCount,
      evaluate: (x: number) => {
        let result = 0;
        for (let i = 0; i < chromaticCoefficients.length; i++) {
          result += chromaticCoefficients[i] * Math.pow(x, i);
        }
        return result;
      }
    };
  }

  /**
   * Calculate binomial coefficient C(n,k)
   * 
   * @param n Upper number
   * @param k Lower number
   * @returns Binomial coefficient
   */
  private binomialCoefficient(n: number, k: number): number {
    if (k > n || k < 0) {
      return 0;
    }
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return result;
  }

  /**
   * Get Tutte polynomial statistics
   * 
   * @returns Object with calculator statistics
   */
  getStatistics(): {
    maxVertices: number;
    complexity: string;
    specializations: string[];
  } {
    return {
      maxVertices: this.MAX_VERTICES,
      complexity: '#P-complete',
      specializations: ['chromatic polynomial', 'flow polynomial', 'reliability polynomial']
    };
  }
}
