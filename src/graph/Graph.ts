/**
 * Graph Structures Implementation
 * 
 * Implements graph representation and operations as specified in RFC XXXX.
 * Provides complement transformation, self-complementary detection, and bipartite graphs.
 * 
 * @fileoverview Graph structures with complement and isomorphism operations
 */

import type { Graph, GraphComplement } from '../types/index.js';

/**
 * Graph operations and utilities
 * 
 * REQUIRED features:
 * - Graph representation: vertices, edges
 * - Complement transformation: G → Ḡ
 * - Self-complementary detection: G ≅ Ḡ
 * - Complete bipartite graphs K_{m,n}
 */
export class GraphStructures {
  /**
   * Create complement of a graph
   * 
   * REQUIRED: Complement transformation G → Ḡ
   * 
   * @param graph Original graph
   * @returns Complement graph
   */
  complement(graph: Graph): Graph {
    const complementEdges: [string, string][] = [];
    
    // Generate all possible edges
    for (let i = 0; i < graph.vertices.length; i++) {
      for (let j = i + 1; j < graph.vertices.length; j++) {
        const edge: [string, string] = [graph.vertices[i], graph.vertices[j]];
        
        // Check if edge exists in original graph
        const existsInOriginal = graph.edges.some(e => 
          (e[0] === edge[0] && e[1] === edge[1]) || 
          (e[0] === edge[1] && e[1] === edge[0])
        );
        
        // Add to complement if it doesn't exist in original
        if (!existsInOriginal) {
          complementEdges.push(edge);
        }
      }
    }
    
    return {
      vertices: [...graph.vertices],
      edges: complementEdges
    };
  }

  /**
   * Check if graph is self-complementary
   * 
   * REQUIRED: Self-complementary detection G ≅ Ḡ
   * 
   * @param graph Graph to check
   * @returns True if graph is self-complementary
   */
  isSelfComplementary(graph: Graph): boolean {
    const complement = this.complement(graph);
    return this.areIsomorphic(graph, complement);
  }

  /**
   * Check if two graphs are isomorphic
   * 
   * @param graph1 First graph
   * @param graph2 Second graph
   * @returns True if graphs are isomorphic
   */
  areIsomorphic(graph1: Graph, graph2: Graph): boolean {
    // Basic checks
    if (graph1.vertices.length !== graph2.vertices.length) {
      return false;
    }
    
    if (graph1.edges.length !== graph2.edges.length) {
      return false;
    }
    
    // Check degree sequences
    const degrees1 = this.getDegreeSequence(graph1);
    const degrees2 = this.getDegreeSequence(graph2);
    
    if (!this.arraysEqual(degrees1.sort(), degrees2.sort())) {
      return false;
    }
    
    // For small graphs, try all permutations
    if (graph1.vertices.length <= 8) {
      return this.checkIsomorphismExhaustive(graph1, graph2);
    } else {
      // For larger graphs, use heuristics
      return this.checkIsomorphismHeuristic(graph1, graph2);
    }
  }

  /**
   * Get degree sequence of a graph
   * 
   * @param graph Graph to analyze
   * @returns Array of vertex degrees
   */
  private getDegreeSequence(graph: Graph): number[] {
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
    
    return Array.from(degrees.values());
  }

  /**
   * Check isomorphism exhaustively for small graphs
   * 
   * @param graph1 First graph
   * @param graph2 Second graph
   * @returns True if graphs are isomorphic
   */
  private checkIsomorphismExhaustive(graph1: Graph, graph2: Graph): boolean {
    // Generate all permutations of graph2 vertices
    const permutations = this.generatePermutations(graph2.vertices);
    
    for (const permutation of permutations) {
      if (this.isIsomorphism(graph1, graph2, permutation)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check isomorphism using heuristics for larger graphs
   * 
   * @param graph1 First graph
   * @param graph2 Second graph
   * @returns True if graphs are isomorphic
   */
  private checkIsomorphismHeuristic(graph1: Graph, graph2: Graph): boolean {
    // Use degree-based vertex matching
    const mapping = this.findVertexMapping(graph1, graph2);
    
    if (mapping === null) {
      return false;
    }
    
    return this.isIsomorphism(graph1, graph2, mapping);
  }

  /**
   * Find vertex mapping between two graphs
   * 
   * @param graph1 First graph
   * @param graph2 Second graph
   * @returns Vertex mapping or null
   */
  private findVertexMapping(graph1: Graph, graph2: Graph): string[] | null {
    const degrees1 = this.getVertexDegrees(graph1);
    const degrees2 = this.getVertexDegrees(graph2);
    
    // Group vertices by degree
    const groups1 = this.groupVerticesByDegree(graph1.vertices, degrees1);
    const groups2 = this.groupVerticesByDegree(graph2.vertices, degrees2);
    
    // Check if degree groups match
    const degreeKeys1 = Object.keys(groups1).sort();
    const degreeKeys2 = Object.keys(groups2).sort();
    
    if (!this.arraysEqual(degreeKeys1, degreeKeys2)) {
      return null;
    }
    
    // Create mapping within each degree group
    const mapping: string[] = new Array(graph1.vertices.length);
    
    for (const degree of degreeKeys1) {
      const vertices1 = groups1[degree];
      const vertices2 = groups2[degree];
      
      if (vertices1.length !== vertices2.length) {
        return null;
      }
      
      // Simple mapping within degree group
      for (let i = 0; i < vertices1.length; i++) {
        const index1 = graph1.vertices.indexOf(vertices1[i]);
        mapping[index1] = vertices2[i];
      }
    }
    
    return mapping;
  }

  /**
   * Get vertex degrees
   * 
   * @param graph Graph to analyze
   * @returns Map of vertex to degree
   */
  private getVertexDegrees(graph: Graph): Map<string, number> {
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
    
    return degrees;
  }

  /**
   * Group vertices by degree
   * 
   * @param vertices Vertex list
   * @param degrees Degree map
   * @returns Object with degree as key and vertex list as value
   */
  private groupVerticesByDegree(vertices: string[], degrees: Map<string, number>): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    
    for (const vertex of vertices) {
      const degree = degrees.get(vertex) || 0;
      if (!groups[degree]) {
        groups[degree] = [];
      }
      groups[degree].push(vertex);
    }
    
    return groups;
  }

  /**
   * Check if a mapping is an isomorphism
   * 
   * @param graph1 First graph
   * @param graph2 Second graph
   * @param mapping Vertex mapping
   * @returns True if mapping is an isomorphism
   */
  private isIsomorphism(graph1: Graph, graph2: Graph, mapping: string[]): boolean {
    // Check that mapping is bijective
    if (mapping.length !== graph1.vertices.length) {
      return false;
    }
    
    const mappedVertices = new Set(mapping);
    if (mappedVertices.size !== mapping.length) {
      return false;
    }
    
    // Check that all vertices in graph2 are mapped
    for (const vertex of graph2.vertices) {
      if (!mappedVertices.has(vertex)) {
        return false;
      }
    }
    
    // Check that edges are preserved
    for (const edge of graph1.edges) {
      const mappedEdge: [string, string] = [mapping[graph1.vertices.indexOf(edge[0])], mapping[graph1.vertices.indexOf(edge[1])]];
      
      const existsInGraph2 = graph2.edges.some(e => 
        (e[0] === mappedEdge[0] && e[1] === mappedEdge[1]) || 
        (e[0] === mappedEdge[1] && e[1] === mappedEdge[0])
      );
      
      if (!existsInGraph2) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Generate all permutations of an array
   * 
   * @param arr Array to permute
   * @returns Array of all permutations
   */
  private generatePermutations(arr: string[]): string[][] {
    if (arr.length <= 1) {
      return [arr];
    }
    
    const permutations: string[][] = [];
    
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingPermutations = this.generatePermutations(remaining);
      
      for (const perm of remainingPermutations) {
        permutations.push([current, ...perm]);
      }
    }
    
    return permutations;
  }

  /**
   * Check if two arrays are equal
   * 
   * @param arr1 First array
   * @param arr2 Second array
   * @returns True if arrays are equal
   */
  private arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Create complete bipartite graph K_{m,n}
   * 
   * @param m Size of first partition
   * @param n Size of second partition
   * @returns Complete bipartite graph
   */
  createCompleteBipartite(m: number, n: number): Graph {
    const vertices: string[] = [];
    const edges: [string, string][] = [];
    
    // Create vertices for first partition
    for (let i = 0; i < m; i++) {
      vertices.push(`A${i}`);
    }
    
    // Create vertices for second partition
    for (let i = 0; i < n; i++) {
      vertices.push(`B${i}`);
    }
    
    // Create edges between partitions
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        edges.push([`A${i}`, `B${j}`]);
      }
    }
    
    return { vertices, edges };
  }

  /**
   * Get graph complement with isomorphism check
   * 
   * @param graph Original graph
   * @returns Graph complement with isomorphism information
   */
  getGraphComplement(graph: Graph): GraphComplement {
    const complement = this.complement(graph);
    const isSelfComplementary = this.isSelfComplementary(graph);
    
    return {
      original: graph,
      complement,
      isSelfComplementary
    };
  }

  /**
   * Get graph statistics
   * 
   * @param graph Graph to analyze
   * @returns Graph statistics
   */
  getStatistics(graph: Graph): {
    vertexCount: number;
    edgeCount: number;
    maxDegree: number;
    minDegree: number;
    averageDegree: number;
    isSelfComplementary: boolean;
    isBipartite: boolean;
  } {
    const degrees = this.getVertexDegrees(graph);
    const degreeValues = Array.from(degrees.values());
    
    return {
      vertexCount: graph.vertices.length,
      edgeCount: graph.edges.length,
      maxDegree: Math.max(...degreeValues, 0),
      minDegree: Math.min(...degreeValues, 0),
      averageDegree: degreeValues.length > 0 ? degreeValues.reduce((sum, d) => sum + d, 0) / degreeValues.length : 0,
      isSelfComplementary: this.isSelfComplementary(graph),
      isBipartite: this.isBipartite(graph)
    };
  }

  /**
   * Check if graph is bipartite
   * 
   * @param graph Graph to check
   * @returns True if graph is bipartite
   */
  private isBipartite(graph: Graph): boolean {
    if (graph.vertices.length === 0) {
      return true;
    }
    
    const colors = new Map<string, number>();
    const queue: string[] = [];
    
    // Start with first vertex
    const startVertex = graph.vertices[0];
    colors.set(startVertex, 0);
    queue.push(startVertex);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentColor = colors.get(current)!;
      
      // Check all neighbors
      for (const edge of graph.edges) {
        const neighbor = edge[0] === current ? edge[1] : edge[1] === current ? edge[0] : null;
        
        if (neighbor) {
          if (!colors.has(neighbor)) {
            colors.set(neighbor, 1 - currentColor);
            queue.push(neighbor);
          } else if (colors.get(neighbor) === currentColor) {
            return false; // Odd cycle found
          }
        }
      }
    }
    
    return true;
  }
}
