/**
 * Unit Tests for Hilbert Space
 * 
 * Tests the 7-dimensional Hilbert space implementation with basis vectors
 * and inner product calculations as specified in RFC XXXX.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HilbertConsensusSpace } from '../../core/HilbertSpace.js';
import { TestVectors } from '../../utils/TestVectors.js';

describe('HilbertConsensusSpace', () => {
  let hilbertSpace: HilbertConsensusSpace;

  beforeEach(() => {
    hilbertSpace = new HilbertConsensusSpace();
  });

  describe('Basis Vectors', () => {
    it('should have exactly 7 basis vectors', () => {
      const basis = hilbertSpace.getBasis();
      const basisKeys = Object.keys(basis);
      expect(basisKeys).toHaveLength(7);
    });

    it('should have correct basis vector names', () => {
      const basis = hilbertSpace.getBasis();
      const expectedBasis = ['Node', 'Edge', 'Graph', 'Incidence', 'Hypergraph', 'Functor', 'Monad'];
      
      for (const expectedKey of expectedBasis) {
        expect(basis).toHaveProperty(expectedKey);
      }
    });
  });

  describe('State Creation', () => {
    it('should create state with 7 dimensions', () => {
      const values = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
      const state = hilbertSpace.createState(values);
      
      expect(state.values).toHaveLength(7);
      expect(state.values).toEqual(values);
      expect(state.basis).toBeDefined();
      expect(state.timestamp).toBeGreaterThan(0);
    });

    it('should reject state with wrong number of dimensions', () => {
      const values = [0.1, 0.2, 0.3]; // Only 3 dimensions
      
      expect(() => {
        hilbertSpace.createState(values);
      }).toThrow('State must have exactly 7 dimensions');
    });
  });

  describe('State Validation', () => {
    it('should validate correct state', () => {
      const values = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
      const state = hilbertSpace.createState(values);
      
      expect(hilbertSpace.validateState(state)).toBe(true);
    });

    it('should reject invalid state', () => {
      const invalidState = {
        values: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6], // Wrong length
        basis: hilbertSpace.getBasis(),
        timestamp: Date.now()
      };
      
      expect(hilbertSpace.validateState(invalidState)).toBe(false);
    });
  });

  describe('Inner Product', () => {
    it('should calculate inner product correctly', () => {
      const state1 = hilbertSpace.createState([1, 0, 0, 0, 0, 0, 0]);
      const state2 = hilbertSpace.createState([0, 1, 0, 0, 0, 0, 0]);
      
      const innerProduct = hilbertSpace.innerProduct(state1, state2);
      expect(typeof innerProduct).toBe('number');
      expect(innerProduct).toBeGreaterThanOrEqual(0);
    });

    it('should be symmetric', () => {
      const state1 = hilbertSpace.createState([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
      const state2 = hilbertSpace.createState([0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]);
      
      const innerProduct12 = hilbertSpace.innerProduct(state1, state2);
      const innerProduct21 = hilbertSpace.innerProduct(state2, state1);
      
      expect(Math.abs(innerProduct12 - innerProduct21)).toBeLessThan(1e-10);
    });

    it('should be positive definite', () => {
      const state = hilbertSpace.createState([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
      const innerProduct = hilbertSpace.innerProduct(state, state);
      
      expect(innerProduct).toBeGreaterThanOrEqual(0);
    });

    it('should reject states with different dimensions', () => {
      const state1 = hilbertSpace.createState([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
      const invalidState = {
        values: [0.1, 0.2, 0.3],
        basis: hilbertSpace.getBasis(),
        timestamp: Date.now()
      };
      
      expect(() => {
        hilbertSpace.innerProduct(state1, invalidState);
      }).toThrow('State vectors must have same dimension');
    });
  });

  describe('Norm and Distance', () => {
    it('should calculate norm correctly', () => {
      const state = hilbertSpace.createState([3, 4, 0, 0, 0, 0, 0]);
      const norm = hilbertSpace.norm(state);
      
      expect(norm).toBeCloseTo(5, 5); // sqrt(3² + 4²) = 5
    });

    it('should calculate distance correctly', () => {
      const state1 = hilbertSpace.createState([0, 0, 0, 0, 0, 0, 0]);
      const state2 = hilbertSpace.createState([3, 4, 0, 0, 0, 0, 0]);
      
      const distance = hilbertSpace.distance(state1, state2);
      expect(distance).toBeCloseTo(5, 5);
    });

    it('should have zero distance for identical states', () => {
      const state = hilbertSpace.createState([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
      const distance = hilbertSpace.distance(state, state);
      
      expect(distance).toBeCloseTo(0, 10);
    });
  });

  describe('Orthogonality', () => {
    it('should detect orthogonal states', () => {
      const state1 = hilbertSpace.createState([1, 0, 0, 0, 0, 0, 0]);
      const state2 = hilbertSpace.createState([0, 1, 0, 0, 0, 0, 0]);
      
      const isOrthogonal = hilbertSpace.isOrthogonal(state1, state2);
      expect(typeof isOrthogonal).toBe('boolean');
    });

    it('should not be orthogonal with itself', () => {
      const state = hilbertSpace.createState([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
      
      const isOrthogonal = hilbertSpace.isOrthogonal(state, state);
      expect(isOrthogonal).toBe(false);
    });
  });

  describe('Normalization', () => {
    it('should normalize state to unit length', () => {
      const state = hilbertSpace.createState([3, 4, 0, 0, 0, 0, 0]);
      const normalized = hilbertSpace.normalize(state);
      
      const norm = hilbertSpace.norm(normalized);
      expect(norm).toBeCloseTo(1, 10);
    });

    it('should reject normalization of zero vector', () => {
      const zeroState = hilbertSpace.createState([0, 0, 0, 0, 0, 0, 0]);
      
      expect(() => {
        hilbertSpace.normalize(zeroState);
      }).toThrow('Cannot normalize zero vector');
    });
  });

  describe('Linear Combination', () => {
    it('should compute linear combination correctly', () => {
      const state1 = hilbertSpace.createState([1, 0, 0, 0, 0, 0, 0]);
      const state2 = hilbertSpace.createState([0, 1, 0, 0, 0, 0, 0]);
      
      const combination = hilbertSpace.linearCombination(2, state1, 3, state2);
      
      expect(combination.values[0]).toBeCloseTo(2, 10);
      expect(combination.values[1]).toBeCloseTo(3, 10);
      expect(combination.values[2]).toBeCloseTo(0, 10);
    });

    it('should reject linear combination of different dimensions', () => {
      const state1 = hilbertSpace.createState([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
      const invalidState = {
        values: [0.1, 0.2, 0.3],
        basis: hilbertSpace.getBasis(),
        timestamp: Date.now()
      };
      
      expect(() => {
        hilbertSpace.linearCombination(1, state1, 1, invalidState);
      }).toThrow('States must have same dimension');
    });
  });

  describe('Completeness', () => {
    it('should be complete', () => {
      expect(hilbertSpace.isComplete).toBe(true);
    });
  });

  describe('Test Vectors', () => {
    it('should pass Hilbert space test vectors', () => {
      const testVector = TestVectors.Mathematical.HILBERT_SPACE_PROPERTIES;
      
      // Validate basis structure
      const basis = hilbertSpace.getBasis();
      const expectedBasis = testVector.input.basis;
      
      for (const expectedKey of expectedBasis) {
        expect(basis).toHaveProperty(expectedKey);
      }
      
      // Validate completeness
      expect(hilbertSpace.isComplete).toBe(true);
    });
  });
});
