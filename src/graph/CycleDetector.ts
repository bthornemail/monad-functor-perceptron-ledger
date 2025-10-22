/**
 * Cycle Detection Implementation
 * 
 * Implements DFS-based cycle detection and acyclic orientation counting
 * as specified in RFC XXXX. Provides O(v) complexity for cycle detection.
 * 
 * @fileoverview Cycle detection with acyclic orientation counting
 */

import type { Graph } from '../types/index.js';

/**
 * Cycle detection result
 */
export interface CycleDetectionResult {
  hasCycle: boolean;
  cycles: string[][];
  acyclicOrientations: number;
  executionTime: number;
}

/**
 * Cycle detector
 * 
 * REQUIRED features:
 * - DFS-based cycle detection (O(v) complexity)
 * - Acyclic orientation counting
 */
export class CycleDetector {
  /**
   * Detect cycles in a graph
   * 
   * @param graph Graph to analyze
   * @returns Cycle detection result
   */
  detectCycles(graph: Graph): CycleDetectionResult {
    const startTime = Date.now();
    
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];
    
    // Find all cycles using DFS
    for (const vertex of graph.vertices) {
      if (!visited.has(vertex)) {
        this.dfsFindCycles(vertex, graph, visited, recursionStack, path, cycles);
      }
    }
    
    // Count acyclic orientations
    const acyclicOrientations = this.countAcyclicOrientations(graph);
    
    const executionTime = Date.now() - startTime;
    
    return {
      hasCycle: cycles.length > 0,
      cycles,
      acyclicOrientations,
      executionTime
    };
  }

  /**
   * Check if graph has cycles
   * 
   * @param graph Graph to check
   * @returns True if graph has cycles
   */
  hasCycle(graph: Graph): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const vertex of graph.vertices) {
      if (!visited.has(vertex)) {
        if (this.dfsHasCycle(vertex, graph, visited, recursionStack)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * DFS to find cycles
   * 
   * @param vertex Current vertex
   * @param graph Graph to search
   * @param visited Set of visited vertices
   * @param recursionStack Set of vertices in current path
   * @param path Current path
   * @param cycles Array to store found cycles
   */
  private dfsFindCycles(
    vertex: string,
    graph: Graph,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
    cycles: string[][]
  ): void {
    visited.add(vertex);
    recursionStack.add(vertex);
    path.push(vertex);
    
    // Check all neighbors
    for (const edge of graph.edges) {
      const neighbor = edge[0] === vertex ? edge[1] : edge[1] === vertex ? edge[0] : null;
      
      if (neighbor) {
        if (!visited.has(neighbor)) {
          this.dfsFindCycles(neighbor, graph, visited, recursionStack, path, cycles);
        } else if (recursionStack.has(neighbor)) {
          // Cycle found
          const cycleStart = path.indexOf(neighbor);
          const cycle = path.slice(cycleStart);
          cycles.push([...cycle, neighbor]); // Complete the cycle
        }
      }
    }
    
    recursionStack.delete(vertex);
    path.pop();
  }

  /**
   * DFS to check for cycles
   * 
   * @param vertex Current vertex
   * @param graph Graph to search
   * @param visited Set of visited vertices
   * @param recursionStack Set of vertices in current path
   * @returns True if cycle found
   */
  private dfsHasCycle(
    vertex: string,
    graph: Graph,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(vertex);
    recursionStack.add(vertex);
    
    // Check all neighbors
    for (const edge of graph.edges) {
      const neighbor = edge[0] === vertex ? edge[1] : edge[1] === vertex ? edge[0] : null;
      
      if (neighbor) {
        if (!visited.has(neighbor)) {
          if (this.dfsHasCycle(neighbor, graph, visited, recursionStack)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true; // Cycle found
        }
      }
    }
    
    recursionStack.delete(vertex);
    return false;
  }

  /**
   * Count acyclic orientations
   * 
   * REQUIRED: π_G(-1) counts acyclic orientations
   * 
   * @param graph Graph to analyze
   * @returns Number of acyclic orientations
   */
  countAcyclicOrientations(graph: Graph): number {
    // For small graphs, count exhaustively
    if (graph.vertices.length <= 10) {
      return this.countAcyclicOrientationsExhaustive(graph);
    } else {
      // For larger graphs, use approximation
      return this.countAcyclicOrientationsApproximate(graph);
    }
  }

  /**
   * Count acyclic orientations exhaustively for small graphs
   * 
   * @param graph Graph to analyze
   * @returns Number of acyclic orientations
   */
  private countAcyclicOrientationsExhaustive(graph: Graph): number {
    let count = 0;
    const edgeCount = graph.edges.length;
    
    // Try all possible orientations (2^edgeCount possibilities)
    for (let orientation = 0; orientation < (1 << edgeCount); orientation++) {
      if (this.isAcyclicOrientation(graph, orientation)) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Check if an orientation is acyclic
   * 
   * @param graph Graph to check
   * @param orientation Bit mask representing edge orientations
   * @returns True if orientation is acyclic
   */
  private isAcyclicOrientation(graph: Graph, orientation: number): boolean {
    // Create directed graph from orientation
    const directedEdges: [string, string][] = [];
    
    for (let i = 0; i < graph.edges.length; i++) {
      const edge = graph.edges[i];
      const direction = (orientation >> i) & 1;
      
      if (direction === 0) {
        directedEdges.push([edge[0], edge[1]]);
      } else {
        directedEdges.push([edge[1], edge[0]]);
      }
    }
    
    // Check for cycles in directed graph
    return !this.hasDirectedCycle(graph.vertices, directedEdges);
  }

  /**
   * Check for cycles in directed graph
   * 
   * @param vertices Vertex list
   * @param directedEdges Directed edge list
   * @returns True if directed graph has cycles
   */
  private hasDirectedCycle(vertices: string[], directedEdges: [string, string][]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const vertex of vertices) {
      if (!visited.has(vertex)) {
        if (this.dfsDirectedCycle(vertex, directedEdges, visited, recursionStack)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * DFS for directed cycle detection
   * 
   * @param vertex Current vertex
   * @param directedEdges Directed edge list
   * @param visited Set of visited vertices
   * @param recursionStack Set of vertices in current path
   * @returns True if cycle found
   */
  private dfsDirectedCycle(
    vertex: string,
    directedEdges: [string, string][],
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(vertex);
    recursionStack.add(vertex);
    
    // Check outgoing edges
    for (const edge of directedEdges) {
      if (edge[0] === vertex) {
        const neighbor = edge[1];
        
        if (!visited.has(neighbor)) {
          if (this.dfsDirectedCycle(neighbor, directedEdges, visited, recursionStack)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true; // Cycle found
        }
      }
    }
    
    recursionStack.delete(vertex);
    return false;
  }

  /**
   * Count acyclic orientations approximately for larger graphs
   * 
   * @param graph Graph to analyze
   * @returns Approximate number of acyclic orientations
   */
  private countAcyclicOrientationsApproximate(graph: Graph): number {
    // Use sampling to estimate
    const sampleSize = Math.min(1000, 1 << Math.min(graph.edges.length, 20));
    let acyclicCount = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      const randomOrientation = Math.floor(Math.random() * (1 << graph.edges.length));
      if (this.isAcyclicOrientation(graph, randomOrientation)) {
        acyclicCount++;
      }
    }
    
    // Estimate total from sample
    const totalOrientations = 1 << graph.edges.length;
    return Math.round((acyclicCount / sampleSize) * totalOrientations);
  }

  /**
   * Find all simple cycles in the graph
   * 
   * @param graph Graph to analyze
   * @returns Array of simple cycles
   */
  findAllSimpleCycles(graph: Graph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const path: string[] = [];
    
    for (const vertex of graph.vertices) {
      if (!visited.has(vertex)) {
        this.dfsSimpleCycles(vertex, vertex, graph, visited, path, cycles);
      }
    }
    
    return cycles;
  }

  /**
   * DFS to find simple cycles
   * 
   * @param startVertex Starting vertex
   * @param currentVertex Current vertex
   * @param graph Graph to search
   * @param visited Set of visited vertices
   * @param path Current path
   * @param cycles Array to store found cycles
   */
  private dfsSimpleCycles(
    startVertex: string,
    currentVertex: string,
    graph: Graph,
    visited: Set<string>,
    path: string[],
    cycles: string[][]
  ): void {
    visited.add(currentVertex);
    path.push(currentVertex);
    
    // Check all neighbors
    for (const edge of graph.edges) {
      const neighbor = edge[0] === currentVertex ? edge[1] : edge[1] === currentVertex ? edge[0] : null;
      
      if (neighbor) {
        if (neighbor === startVertex && path.length > 2) {
          // Simple cycle found
          cycles.push([...path, startVertex]);
        } else if (!visited.has(neighbor)) {
          this.dfsSimpleCycles(startVertex, neighbor, graph, visited, path, cycles);
        }
      }
    }
    
    visited.delete(currentVertex);
    path.pop();
  }

  /**
   * Get cycle detector statistics
   * 
   * @returns Object with detector statistics
   */
  getStatistics(): {
    complexity: string;
    maxGraphSize: number;
    supportedAlgorithms: string[];
  } {
    return {
      complexity: 'O(v + e) for cycle detection, O(2^e) for acyclic orientations',
      maxGraphSize: 20, // Practical limit for exhaustive counting
      supportedAlgorithms: ['DFS', 'exhaustive', 'sampling']
    };
  }
}
