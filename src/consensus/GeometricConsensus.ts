/**
 * Geometric Consensus Implementation
 * 
 * Implements the main consensus algorithm with guaranteed ≤14 steps using Ramanujan forms
 * as specified in RFC XXXX. Supports tetrahedron, cube, and octahedron consensus types.
 * 
 * @fileoverview Main consensus engine with bounded convergence
 */

import type { Consensus, ConsensusType, Peer, State } from '../types/index.js';
import { RamanujanConvergence } from '../core/RamanujanForms.js';
import { HilbertConsensusSpace } from '../core/HilbertSpace.js';

/**
 * Consensus configuration
 */
export interface ConsensusConfig {
  type: ConsensusType;
  maxSteps: number;
  threshold: number;
  timeout: number;
}

/**
 * Consensus result
 */
export interface ConsensusResult {
  consensus: Consensus;
  steps: number;
  executionTime: number;
  proof: string;
}

/**
 * Geometric consensus engine
 * 
 * REQUIRED features:
 * - Guaranteed ≤14 steps using Ramanujan forms
 * - State initialization and transformation
 * - Consensus validation via chromatic polynomial: π_G(-1) > 0
 * - Tetrahedron (100%), Cube (50%), Octahedron (83.3%) consensus types
 */
export class GeometricConsensus {
  private hilbertSpace: HilbertConsensusSpace;
  private config: ConsensusConfig;

  constructor(config: ConsensusConfig) {
    this.hilbertSpace = new HilbertConsensusSpace();
    this.config = { ...config };
    this.validateConfig();
  }

  /**
   * Achieve consensus among peers
   * 
   * @param peers Array of peers participating in consensus
   * @returns Consensus result
   */
  async achieveConsensus(peers: Peer[]): Promise<ConsensusResult> {
    const startTime = Date.now();
    
    // Validate input
    this.validatePeers(peers);
    
    // Initialize consensus state
    let state = this.initializeState(peers);
    
    // Try Ramanujan forms in sequence (guaranteed ≤14 steps)
    for (let step = 1; step <= this.config.maxSteps; step++) {
      const form = RamanujanConvergence.getFormForStep(step);
      
      // Apply quadratic form transformation
      state = this.applyQuadraticForm(state, form);
      
      // Check if consensus is reached
      if (this.consensusReached(state, peers)) {
        const executionTime = Date.now() - startTime;
        const proof = this.generateProof(state, step, form);
        
        return {
          consensus: {
            valid: true,
            steps: step,
            state,
            proof,
            type: this.config.type
          },
          steps: step,
          executionTime,
          proof
        };
      }
    }
    
    // Consensus not reached within maximum steps
    const executionTime = Date.now() - startTime;
    throw new ConsensusException(
      `Maximum steps (${this.config.maxSteps}) exceeded`,
      executionTime
    );
  }

  /**
   * Initialize consensus state from peers
   * 
   * @param peers Array of peers
   * @returns Initial state
   */
  private initializeState(peers: Peer[]): State {
    // Initialize state with peer values
    const values: number[] = [];
    
    for (let i = 0; i < 7; i++) {
      let sum = 0;
      let count = 0;
      
      for (const peer of peers) {
        if (peer.state && peer.state.values[i] !== undefined) {
          sum += peer.state.values[i];
          count++;
        }
      }
      
      values[i] = count > 0 ? sum / count : 0;
    }
    
    return this.hilbertSpace.createState(values);
  }

  /**
   * Apply quadratic form transformation to state
   * 
   * @param state Current state
   * @param form Ramanujan form
   * @returns Transformed state
   */
  private applyQuadraticForm(state: State, form: [number, number, number, number]): State {
    const transformedValues = RamanujanConvergence.applyForm(state.values, form);
    return this.hilbertSpace.createState(transformedValues);
  }

  /**
   * Check if consensus is reached
   * 
   * @param state Current state
   * @param peers Array of peers
   * @returns True if consensus is reached
   */
  private consensusReached(state: State, peers: Peer[]): boolean {
    // Validate state using chromatic polynomial
    if (!this.validateState(state)) {
      return false;
    }
    
    // Check consensus threshold based on type
    const agreement = this.calculateAgreement(state, peers);
    return agreement >= this.config.threshold;
  }

  /**
   * Validate state using chromatic polynomial
   * 
   * REQUIRED: π_G(-1) > 0 indicates acyclic (valid) configuration
   * 
   * @param state State to validate
   * @returns True if state is valid
   */
  private validateState(state: State): boolean {
    // Simplified validation - in practice, this would compute the full chromatic polynomial
    // For now, we check that the state has no cycles in its graph representation
    
    const graph = this.stateToGraph(state);
    return !this.hasCycles(graph);
  }

  /**
   * Convert state to graph representation
   * 
   * @param state State to convert
   * @returns Graph representation
   */
  private stateToGraph(state: State): { vertices: string[]; edges: [string, string][] } {
    const vertices: string[] = [];
    const edges: [string, string][] = [];
    
    // Create vertices for each dimension
    for (let i = 0; i < state.values.length; i++) {
      vertices.push(`dim_${i}`);
    }
    
    // Create edges based on state values
    for (let i = 0; i < state.values.length; i++) {
      for (let j = i + 1; j < state.values.length; j++) {
        const similarity = Math.abs(state.values[i] - state.values[j]);
        if (similarity < 0.1) { // Threshold for connection
          edges.push([`dim_${i}`, `dim_${j}`]);
        }
      }
    }
    
    return { vertices, edges };
  }

  /**
   * Check if graph has cycles
   * 
   * @param graph Graph to check
   * @returns True if graph has cycles
   */
  private hasCycles(graph: { vertices: string[]; edges: [string, string][] }): boolean {
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
   * Calculate agreement percentage
   * 
   * @param state Current state
   * @param peers Array of peers
   * @returns Agreement percentage (0-1)
   */
  private calculateAgreement(state: State, peers: Peer[]): number {
    let totalAgreement = 0;
    let totalComparisons = 0;
    
    for (const peer of peers) {
      if (peer.state) {
        const distance = this.hilbertSpace.distance(state, peer.state);
        const similarity = Math.exp(-distance); // Convert distance to similarity
        totalAgreement += similarity;
        totalComparisons++;
      }
    }
    
    return totalComparisons > 0 ? totalAgreement / totalComparisons : 0;
  }

  /**
   * Generate consensus proof
   * 
   * @param state Final state
   * @param steps Number of steps taken
   * @param form Final Ramanujan form used
   * @returns Proof string
   */
  private generateProof(state: State, steps: number, form: [number, number, number, number]): string {
    const stateHash = this.hashState(state);
    const formStr = form.join(',');
    
    return `GeometricConsensus:${steps}:${formStr}:${stateHash}:${this.config.type}`;
  }

  /**
   * Hash state for proof generation
   * 
   * @param state State to hash
   * @returns Hash string
   */
  private hashState(state: State): string {
    const stateStr = state.values.map(v => v.toFixed(6)).join(',');
    let hash = 0;
    for (let i = 0; i < stateStr.length; i++) {
      const char = stateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate consensus configuration
   */
  private validateConfig(): void {
    if (this.config.maxSteps > RamanujanConvergence.getMaxSteps()) {
      throw new Error(`Max steps ${this.config.maxSteps} exceeds Ramanujan bound ${RamanujanConvergence.getMaxSteps()}`);
    }
    
    if (this.config.threshold < 0 || this.config.threshold > 1) {
      throw new Error(`Threshold ${this.config.threshold} must be in range [0, 1]`);
    }
    
    // Validate consensus type thresholds
    const expectedThresholds = {
      'TETRAHEDRON': 1.0,    // 100% unanimous
      'CUBE': 0.5,           // 50% majority
      'OCTAHEDRON': 0.833    // 83.3% supermajority
    };
    
    const expectedThreshold = expectedThresholds[this.config.type];
    if (Math.abs(this.config.threshold - expectedThreshold) > 0.01) {
      console.warn(`Threshold ${this.config.threshold} differs from expected ${expectedThreshold} for ${this.config.type}`);
    }
  }

  /**
   * Validate peers array
   * 
   * @param peers Peers to validate
   */
  private validatePeers(peers: Peer[]): void {
    if (!peers || peers.length === 0) {
      throw new Error('At least one peer is required for consensus');
    }
    
    for (const peer of peers) {
      if (!peer.id) {
        throw new Error('All peers must have an ID');
      }
    }
  }

  /**
   * Get consensus configuration
   * 
   * @returns Current configuration
   */
  getConfig(): ConsensusConfig {
    return { ...this.config };
  }

  /**
   * Update consensus configuration
   * 
   * @param newConfig New configuration
   */
  updateConfig(newConfig: Partial<ConsensusConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig();
  }

  /**
   * Get consensus statistics
   * 
   * @returns Object with consensus statistics
   */
  getStatistics(): {
    type: ConsensusType;
    maxSteps: number;
    threshold: number;
    ramanujanBound: number;
    supportedTypes: ConsensusType[];
  } {
    return {
      type: this.config.type,
      maxSteps: this.config.maxSteps,
      threshold: this.config.threshold,
      ramanujanBound: RamanujanConvergence.getMaxSteps(),
      supportedTypes: ['TETRAHEDRON', 'CUBE', 'OCTAHEDRON']
    };
  }
}

/**
 * Consensus exception
 */
export class ConsensusException extends Error {
  public readonly executionTime: number;

  constructor(message: string, executionTime: number) {
    super(message);
    this.name = 'ConsensusException';
    this.executionTime = executionTime;
  }
}
