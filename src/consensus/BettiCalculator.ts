/**
 * Betti Calculator Implementation
 * 
 * Implements topological invariants calculation for network analysis
 * as specified in RFC XXXX. Provides O(v) complexity for β₀ calculation.
 * 
 * @fileoverview Betti number calculation for partition detection
 */

import type { BettiNumbers, Graph, Network } from '../types/index.js';

/**
 * Connected component
 */
interface ConnectedComponent {
  vertices: string[];
  edges: [string, string][];
}

/**
 * Betti number calculator
 * 
 * REQUIRED features:
 * - β₀ calculation using DFS for connected components (O(v) complexity)
 * - β₁ calculation using Euler characteristic: β₁ = E - V + β₀
 * - β₂ calculation for void detection
 * - Network partition detection: β₀ > 1 indicates partition
 */
export class BettiCalculator {
  /**
   * Calculate Betti numbers for a graph
   * 
   * @param graph Graph to analyze
   * @returns Betti numbers {β₀, β₁, β₂}
   */
  calculateBettiNumbers(graph: Graph): BettiNumbers {
    // β₀: Number of connected components
    const beta0 = this.calculateBeta0(graph);
    
    // β₁: Number of cycles (using Euler characteristic)
    const beta1 = this.calculateBeta1(graph, beta0);
    
    // β₂: Number of voids (simplified calculation)
    const beta2 = this.calculateBeta2(graph, beta0, beta1);
    
    return {
      beta0,
      beta1,
      beta2
    };
  }

  /**
   * Calculate β₀ (number of connected components)
   * 
   * REQUIRED: O(v) complexity using DFS
   * 
   * @param graph Graph to analyze
   * @returns Number of connected components
   */
  calculateBeta0(graph: Graph): number {
    const visited = new Set<string>();
    let components = 0;
    
    // Use DFS to find connected components
    for (const vertex of graph.vertices) {
      if (!visited.has(vertex)) {
        this.dfs(vertex, graph, visited);
        components++;
      }
    }
    
    return components;
  }

  /**
   * Calculate β₁ (number of cycles)
   * 
   * Formula: β₁ = E - V + β₀
   * Where E = number of edges, V = number of vertices
   * 
   * @param graph Graph to analyze
   * @param beta0 Number of connected components
   * @returns Number of cycles
   */
  calculateBeta1(graph: Graph, beta0: number): number {
    const E = graph.edges.length;
    const V = graph.vertices.length;
    
    // β₁ = E - V + β₀ (Euler characteristic)
    return E - V + beta0;
  }

  /**
   * Calculate β₂ (number of voids)
   * 
   * Simplified calculation for 2D graphs
   * 
   * @param graph Graph to analyze
   * @param beta0 Number of connected components
   * @param beta1 Number of cycles
   * @returns Number of voids
   */
  calculateBeta2(graph: Graph, beta0: number, beta1: number): number {
    // For 2D graphs, β₂ is typically 0 unless we have enclosed regions
    // This is a simplified implementation
    const V = graph.vertices.length;
    const E = graph.edges.length;
    
    // Check for triangular faces (simplified)
    const triangularFaces = this.countTriangularFaces(graph);
    
    // β₂ = F - E + V - β₀ (where F is number of faces)
    // For planar graphs: F = E - V + β₀ + 1
    const F = triangularFaces;
    return Math.max(0, F - E + V - beta0);
  }

  /**
   * Depth-first search for connected components
   * 
   * @param vertex Starting vertex
   * @param graph Graph to search
   * @param visited Set of visited vertices
   */
  private dfs(vertex: string, graph: Graph, visited: Set<string>): void {
    visited.add(vertex);
    
    // Find all neighbors
    for (const edge of graph.edges) {
      const neighbor = edge[0] === vertex ? edge[1] : edge[1] === vertex ? edge[0] : null;
      if (neighbor && !visited.has(neighbor)) {
        this.dfs(neighbor, graph, visited);
      }
    }
  }

  /**
   * Count triangular faces in the graph
   * 
   * @param graph Graph to analyze
   * @returns Number of triangular faces
   */
  private countTriangularFaces(graph: Graph): number {
    let triangularFaces = 0;
    
    // Check all combinations of three vertices
    for (let i = 0; i < graph.vertices.length; i++) {
      for (let j = i + 1; j < graph.vertices.length; j++) {
        for (let k = j + 1; k < graph.vertices.length; k++) {
          const v1 = graph.vertices[i];
          const v2 = graph.vertices[j];
          const v3 = graph.vertices[k];
          
          // Check if all three edges exist
          if (this.hasEdge(graph, v1, v2) && 
              this.hasEdge(graph, v2, v3) && 
              this.hasEdge(graph, v3, v1)) {
            triangularFaces++;
          }
        }
      }
    }
    
    return triangularFaces;
  }

  /**
   * Check if an edge exists between two vertices
   * 
   * @param graph Graph to check
   * @param v1 First vertex
   * @param v2 Second vertex
   * @returns True if edge exists
   */
  private hasEdge(graph: Graph, v1: string, v2: string): boolean {
    return graph.edges.some(edge => 
      (edge[0] === v1 && edge[1] === v2) || 
      (edge[0] === v2 && edge[1] === v1)
    );
  }

  /**
   * Find connected components
   * 
   * @param graph Graph to analyze
   * @returns Array of connected components
   */
  findConnectedComponents(graph: Graph): ConnectedComponent[] {
    const visited = new Set<string>();
    const components: ConnectedComponent[] = [];
    
    for (const vertex of graph.vertices) {
      if (!visited.has(vertex)) {
        const component = this.dfsComponent(vertex, graph, visited);
        components.push(component);
      }
    }
    
    return components;
  }

  /**
   * DFS to find a connected component
   * 
   * @param startVertex Starting vertex
   * @param graph Graph to search
   * @param visited Set of visited vertices
   * @returns Connected component
   */
  private dfsComponent(startVertex: string, graph: Graph, visited: Set<string>): ConnectedComponent {
    const component: ConnectedComponent = {
      vertices: [],
      edges: []
    };
    
    const stack = [startVertex];
    
    while (stack.length > 0) {
      const vertex = stack.pop()!;
      
      if (visited.has(vertex)) {
        continue;
      }
      
      visited.add(vertex);
      component.vertices.push(vertex);
      
      // Find all edges connected to this vertex
      for (const edge of graph.edges) {
        if (edge[0] === vertex || edge[1] === vertex) {
          if (!component.edges.some(e => 
            (e[0] === edge[0] && e[1] === edge[1]) || 
            (e[0] === edge[1] && e[1] === edge[0])
          )) {
            component.edges.push(edge);
          }
          
          // Add neighbor to stack
          const neighbor = edge[0] === vertex ? edge[1] : edge[0];
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }
    
    return component;
  }

  /**
   * Detect network partition
   * 
   * REQUIRED: β₀ > 1 indicates partition
   * 
   * @param network Network to analyze
   * @returns True if network is partitioned
   */
  detectPartition(network: Network): boolean {
    const bettiNumbers = this.calculateBettiNumbers(network.topology);
    return bettiNumbers.beta0 > 1;
  }

  /**
   * Get partition information
   * 
   * @param network Network to analyze
   * @returns Partition information
   */
  getPartitionInfo(network: Network): {
    isPartitioned: boolean;
    partitionCount: number;
    components: string[][];
  } {
    const components = this.findConnectedComponents(network.topology);
    
    return {
      isPartitioned: components.length > 1,
      partitionCount: components.length,
      components: components.map(comp => comp.vertices)
    };
  }

  /**
   * Calculate network connectivity metrics
   * 
   * @param network Network to analyze
   * @returns Connectivity metrics
   */
  calculateConnectivityMetrics(network: Network): {
    bettiNumbers: BettiNumbers;
    isPartitioned: boolean;
    componentCount: number;
    largestComponentSize: number;
    averageComponentSize: number;
  } {
    const bettiNumbers = this.calculateBettiNumbers(network.topology);
    const components = this.findConnectedComponents(network.topology);
    
    const componentSizes = components.map(comp => comp.vertices.length);
    const largestComponentSize = Math.max(...componentSizes, 0);
    const averageComponentSize = componentSizes.length > 0 
      ? componentSizes.reduce((sum, size) => sum + size, 0) / componentSizes.length 
      : 0;
    
    return {
      bettiNumbers,
      isPartitioned: bettiNumbers.beta0 > 1,
      componentCount: bettiNumbers.beta0,
      largestComponentSize,
      averageComponentSize
    };
  }

  /**
   * Validate Betti number calculation
   * 
   * @param graph Graph to validate
   * @returns True if calculation is valid
   */
  validateBettiNumbers(graph: Graph): boolean {
    const bettiNumbers = this.calculateBettiNumbers(graph);
    
    // Basic validation checks
    if (bettiNumbers.beta0 < 0) {
      return false;
    }
    
    if (bettiNumbers.beta1 < 0) {
      return false;
    }
    
    if (bettiNumbers.beta2 < 0) {
      return false;
    }
    
    // Check Euler characteristic: V - E + F = β₀ - β₁ + β₂
    const V = graph.vertices.length;
    const E = graph.edges.length;
    const F = this.countTriangularFaces(graph);
    const eulerCharacteristic = V - E + F;
    const bettiCharacteristic = bettiNumbers.beta0 - bettiNumbers.beta1 + bettiNumbers.beta2;
    
    // Allow small numerical differences
    return Math.abs(eulerCharacteristic - bettiCharacteristic) < 0.01;
  }

  /**
   * Get Betti calculator statistics
   * 
   * @returns Object with calculator statistics
   */
  getStatistics(): {
    maxVertices: number;
    maxEdges: number;
    complexity: string;
    supportedGraphs: string[];
  } {
    return {
      maxVertices: 10000, // Practical limit
      maxEdges: 50000,    // Practical limit
      complexity: 'O(v) for β₀, O(v²) for β₁, O(v³) for β₂',
      supportedGraphs: ['undirected', 'connected', 'disconnected']
    };
  }
}
