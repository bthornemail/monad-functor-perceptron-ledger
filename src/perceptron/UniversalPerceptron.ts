/**
 * Universal Perceptron Implementation
 * 
 * Implements the universal perceptron with dual formulations as specified in RFC XXXX.
 * Provides both Monad view (quadratic form) and Functor view (fixed point).
 * 
 * @fileoverview Universal perceptron with duality support and negative discriminant rejection
 */

import type { State } from '../types/index.js';
import { BlockDesign } from '../core/BlockDesign.js';
import { FanoPlane } from '../core/FanoPlane.js';

/**
 * Perceptron configuration
 */
export interface PerceptronConfig {
  blockDesign: BlockDesign;
  fanoPlane: FanoPlane;
  geometricShift: number;
  maxIterations: number;
  tolerance: number;
}

/**
 * Perceptron execution result
 */
export interface PerceptronResult {
  success: boolean;
  finalState: State;
  iterations: number;
  convergence: boolean;
  discriminant: number;
  executionTime: number;
}

/**
 * Universal perceptron
 * 
 * REQUIRED features:
 * - Quadratic form: P² = (BD × FP) ± k·I (Monad view)
 * - Fixed point: P = f(BD, FP, P) ± k (Functor view)
 * - Duality support: both formulations as isomorphic representations
 * - Negative discriminant rejection for invalid states
 */
export class UniversalPerceptron {
  private config: PerceptronConfig;

  constructor(config: PerceptronConfig) {
    this.config = { ...config };
    this.validateConfig();
  }

  /**
   * Execute perceptron in Monad view (quadratic form)
   * 
   * REQUIRED: P² = (BD × FP) ± k·I
   * 
   * @param initialState Initial state
   * @returns Execution result
   */
  async executeMonadView(initialState: State): Promise<PerceptronResult> {
    const startTime = Date.now();
    let currentState = { ...initialState };
    let iterations = 0;
    
    for (let i = 0; i < this.config.maxIterations; i++) {
      iterations = i + 1;
      
      // Apply quadratic form transformation
      const newState = this.applyQuadraticForm(currentState);
      
      // Check for negative discriminant
      const discriminant = this.calculateDiscriminant(newState);
      if (discriminant < 0) {
        return {
          success: false,
          finalState: newState,
          iterations,
          convergence: false,
          discriminant,
          executionTime: Date.now() - startTime
        };
      }
      
      // Check convergence
      const change = this.calculateStateChange(currentState, newState);
      if (change < this.config.tolerance) {
        return {
          success: true,
          finalState: newState,
          iterations,
          convergence: true,
          discriminant,
          executionTime: Date.now() - startTime
        };
      }
      
      currentState = newState;
    }
    
    return {
      success: false,
      finalState: currentState,
      iterations,
      convergence: false,
      discriminant: this.calculateDiscriminant(currentState),
      executionTime: Date.now() - startTime
    };
  }

  /**
   * Execute perceptron in Functor view (fixed point)
   * 
   * REQUIRED: P = f(BD, FP, P) ± k
   * 
   * @param initialState Initial state
   * @returns Execution result
   */
  async executeFunctorView(initialState: State): Promise<PerceptronResult> {
    const startTime = Date.now();
    let currentState = { ...initialState };
    let iterations = 0;
    
    for (let i = 0; i < this.config.maxIterations; i++) {
      iterations = i + 1;
      
      // Apply fixed point transformation
      const newState = this.applyFixedPointTransformation(currentState);
      
      // Check for negative discriminant
      const discriminant = this.calculateDiscriminant(newState);
      if (discriminant < 0) {
        return {
          success: false,
          finalState: newState,
          iterations,
          convergence: false,
          discriminant,
          executionTime: Date.now() - startTime
        };
      }
      
      // Check convergence
      const change = this.calculateStateChange(currentState, newState);
      if (change < this.config.tolerance) {
        return {
          success: true,
          finalState: newState,
          iterations,
          convergence: true,
          discriminant,
          executionTime: Date.now() - startTime
        };
      }
      
      currentState = newState;
    }
    
    return {
      success: false,
      finalState: currentState,
      iterations,
      convergence: false,
      discriminant: this.calculateDiscriminant(currentState),
      executionTime: Date.now() - startTime
    };
  }

  /**
   * Apply quadratic form transformation
   * 
   * REQUIRED: P² = (BD × FP) ± k·I
   * 
   * @param state Current state
   * @returns Transformed state
   */
  private applyQuadraticForm(state: State): State {
    const newValues: number[] = [];
    
    for (let i = 0; i < state.values.length; i++) {
      // Apply quadratic form: P² = (BD × FP) ± k·I
      const blockDesignValue = this.getBlockDesignValue(i);
      const fanoPlaneValue = this.getFanoPlaneValue(i);
      const identityValue = state.values[i];
      
      const quadraticValue = blockDesignValue * fanoPlaneValue;
      const shiftedValue = quadraticValue + this.config.geometricShift * identityValue;
      
      newValues[i] = Math.max(0, Math.min(1, shiftedValue)); // Clamp to [0,1]
    }
    
    return {
      ...state,
      values: newValues,
      timestamp: Date.now()
    };
  }

  /**
   * Apply fixed point transformation
   * 
   * REQUIRED: P = f(BD, FP, P) ± k
   * 
   * @param state Current state
   * @returns Transformed state
   */
  private applyFixedPointTransformation(state: State): State {
    const newValues: number[] = [];
    
    for (let i = 0; i < state.values.length; i++) {
      // Apply fixed point: P = f(BD, FP, P) ± k
      const blockDesignValue = this.getBlockDesignValue(i);
      const fanoPlaneValue = this.getFanoPlaneValue(i);
      const currentValue = state.values[i];
      
      const functionValue = this.applyFunction(blockDesignValue, fanoPlaneValue, currentValue);
      const shiftedValue = functionValue + this.config.geometricShift;
      
      newValues[i] = Math.max(0, Math.min(1, shiftedValue)); // Clamp to [0,1]
    }
    
    return {
      ...state,
      values: newValues,
      timestamp: Date.now()
    };
  }

  /**
   * Apply function f(BD, FP, P)
   * 
   * @param bd Block design value
   * @param fp Fano plane value
   * @param p Current perceptron value
   * @returns Function result
   */
  private applyFunction(bd: number, fp: number, p: number): number {
    // Simple function: f(BD, FP, P) = BD * FP * P
    return bd * fp * p;
  }

  /**
   * Get block design value for dimension
   * 
   * @param dimension Dimension index
   * @returns Block design value
   */
  private getBlockDesignValue(dimension: number): number {
    const parameters = this.config.blockDesign.getParameters();
    const blocks = this.config.blockDesign.getBlocks();
    
    // Use block design parameters to generate values
    const value = (parameters.v + parameters.k + parameters.lambda) / 100.0;
    return Math.sin(value * dimension) * 0.5 + 0.5; // Normalize to [0,1]
  }

  /**
   * Get Fano plane value for dimension
   * 
   * @param dimension Dimension index
   * @returns Fano plane value
   */
  private getFanoPlaneValue(dimension: number): number {
    const points = this.config.fanoPlane.getPoints();
    const lines = this.config.fanoPlane.getLines();
    
    // Use Fano plane structure to generate values
    const pointIndex = dimension % points.length;
    const point = points[pointIndex];
    
    // Use point coordinates to generate value
    const value = point.coordinates.reduce((sum, coord) => sum + coord, 0) / 3.0;
    return Math.cos(value * dimension) * 0.5 + 0.5; // Normalize to [0,1]
  }

  /**
   * Calculate discriminant of state
   * 
   * @param state State to analyze
   * @returns Discriminant value
   */
  private calculateDiscriminant(state: State): number {
    // Calculate discriminant for quadratic form
    // For a quadratic form ax² + bx + c, discriminant = b² - 4ac
    
    let discriminant = 0;
    
    for (let i = 0; i < state.values.length; i++) {
      const a = this.getBlockDesignValue(i);
      const b = this.getFanoPlaneValue(i);
      const c = state.values[i];
      
      discriminant += b * b - 4 * a * c;
    }
    
    return discriminant / state.values.length; // Average discriminant
  }

  /**
   * Calculate state change between iterations
   * 
   * @param oldState Previous state
   * @param newState Current state
   * @returns Change magnitude
   */
  private calculateStateChange(oldState: State, newState: State): number {
    let totalChange = 0;
    
    for (let i = 0; i < oldState.values.length; i++) {
      const change = Math.abs(newState.values[i] - oldState.values[i]);
      totalChange += change;
    }
    
    return totalChange / oldState.values.length; // Average change
  }

  /**
   * Validate perceptron configuration
   */
  private validateConfig(): void {
    if (!this.config.blockDesign) {
      throw new Error('Block design is required');
    }
    
    if (!this.config.fanoPlane) {
      throw new Error('Fano plane is required');
    }
    
    if (this.config.geometricShift < 0 || this.config.geometricShift > 3) {
      throw new Error('Geometric shift must be in range [0, 3]');
    }
    
    if (this.config.maxIterations <= 0) {
      throw new Error('Max iterations must be positive');
    }
    
    if (this.config.tolerance <= 0) {
      throw new Error('Tolerance must be positive');
    }
  }

  /**
   * Check if two formulations are isomorphic
   * 
   * @param monadResult Monad view result
   * @param functorResult Functor view result
   * @returns True if results are isomorphic
   */
  areFormulationsIsomorphic(monadResult: PerceptronResult, functorResult: PerceptronResult): boolean {
    if (monadResult.success !== functorResult.success) {
      return false;
    }
    
    if (Math.abs(monadResult.discriminant - functorResult.discriminant) > 0.01) {
      return false;
    }
    
    // Check if final states are similar
    const stateDifference = this.calculateStateChange(monadResult.finalState, functorResult.finalState);
    return stateDifference < this.config.tolerance;
  }

  /**
   * Get perceptron statistics
   * 
   * @returns Object with perceptron statistics
   */
  getStatistics(): {
    maxIterations: number;
    tolerance: number;
    geometricShift: number;
    blockDesignParams: any;
    fanoPlaneStats: any;
  } {
    return {
      maxIterations: this.config.maxIterations,
      tolerance: this.config.tolerance,
      geometricShift: this.config.geometricShift,
      blockDesignParams: this.config.blockDesign.getParameters(),
      fanoPlaneStats: this.config.fanoPlane.getStatistics()
    };
  }
}
