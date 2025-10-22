/**
 * Unit Tests for Geometric Consensus
 * 
 * Tests the geometric consensus implementation with 14-step convergence
 * and Ramanujan forms as specified in RFC XXXX.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GeometricConsensus } from '../../consensus/GeometricConsensus.js';
import { TestVectors } from '../../utils/TestVectors.js';

describe('GeometricConsensus', () => {
  let consensus: GeometricConsensus;

  beforeEach(() => {
    consensus = new GeometricConsensus();
  });

  describe('Consensus Types', () => {
    it('should have correct tetrahedron consensus threshold', () => {
      const threshold = consensus.getConsensusThreshold('TETRAHEDRON');
      expect(threshold).toBe(1.0);
    });

    it('should have correct cube consensus threshold', () => {
      const threshold = consensus.getConsensusThreshold('CUBE');
      expect(threshold).toBe(0.5);
    });

    it('should have correct octahedron consensus threshold', () => {
      const threshold = consensus.getConsensusThreshold('OCTAHEDRON');
      expect(threshold).toBeCloseTo(0.833, 3);
    });

    it('should reject invalid consensus type', () => {
      expect(() => {
        consensus.getConsensusThreshold('INVALID' as any);
      }).toThrow('Invalid consensus type');
    });
  });

  describe('Ramanujan Forms', () => {
    it('should have 14 universal forms', () => {
      const forms = consensus.getUniversalForms();
      expect(forms).toHaveLength(14);
    });

    it('should validate universal forms', () => {
      const forms = consensus.getUniversalForms();
      
      for (const form of forms) {
        expect(consensus.validateRamanujanForm(form)).toBe(true);
      }
    });

    it('should reject exceptional form', () => {
      const exceptionalForm = [1, 2, 5, 5];
      expect(consensus.validateRamanujanForm(exceptionalForm)).toBe(false);
    });

    it('should reject forms with coefficient > 14', () => {
      const invalidForm = [1, 1, 2, 15];
      expect(consensus.validateRamanujanForm(invalidForm)).toBe(false);
    });
  });

  describe('Consensus Execution', () => {
    it('should achieve consensus within 14 steps', async () => {
      const peers = [
        { id: 'peer1', agrees: true, state: { value: 0.5 } },
        { id: 'peer2', agrees: true, state: { value: 0.5 } },
        { id: 'peer3', agrees: true, state: { value: 0.5 } },
        { id: 'peer4', agrees: true, state: { value: 0.5 } }
      ];

      const result = await consensus.achieveConsensus(peers);
      
      expect(result.valid).toBe(true);
      expect(result.steps).toBeLessThanOrEqual(14);
      expect(result.proof).toBeDefined();
    });

    it('should reject consensus requiring more than 14 steps', async () => {
      const peers = [
        { id: 'peer1', agrees: false, state: { value: 0.1 } },
        { id: 'peer2', agrees: false, state: { value: 0.2 } },
        { id: 'peer3', agrees: false, state: { value: 0.3 } },
        { id: 'peer4', agrees: false, state: { value: 0.4 } }
      ];

      await expect(consensus.achieveConsensus(peers)).rejects.toThrow('Maximum steps exceeded');
    });

    it('should handle empty peer list', async () => {
      const peers: any[] = [];
      
      await expect(consensus.achieveConsensus(peers)).rejects.toThrow('No peers provided');
    });
  });

  describe('State Validation', () => {
    it('should validate acyclic state', () => {
      const acyclicGraph = {
        vertices: ['A', 'B', 'C'],
        edges: [['A', 'B'], ['B', 'C']]
      };
      
      expect(consensus.validateState(acyclicGraph)).toBe(true);
    });

    it('should reject cyclic state', () => {
      const cyclicGraph = {
        vertices: ['A', 'B', 'C'],
        edges: [['A', 'B'], ['B', 'C'], ['C', 'A']]
      };
      
      expect(consensus.validateState(cyclicGraph)).toBe(false);
    });
  });

  describe('Test Vectors', () => {
    it('should pass Ramanujan convergence test vector', async () => {
      const testVector = TestVectors.Consensus.RAMANUJAN_CONVERGENCE;
      const { initialState, ramanujanForm, expectedSteps } = testVector.input;
      
      // Validate form
      expect(consensus.validateRamanujanForm(ramanujanForm)).toBe(true);
      
      // Test convergence
      const peers = initialState.map((value, index) => ({
        id: `peer${index}`,
        agrees: true,
        state: { value }
      }));
      
      const result = await consensus.achieveConsensus(peers);
      expect(result.steps).toBeLessThanOrEqual(expectedSteps);
    });

    it('should pass infinite loop prevention test vector', () => {
      const testVector = TestVectors.Consensus.INFINITE_LOOP_PREVENTION;
      const { ramanujanForm } = testVector.input;
      
      expect(consensus.validateRamanujanForm(ramanujanForm)).toBe(false);
    });

    it('should pass geometric consensus types test vector', () => {
      const testVector = TestVectors.Consensus.GEOMETRIC_CONSENSUS_TYPES;
      const { tetrahedron, cube, octahedron } = testVector.input;
      
      expect(consensus.getConsensusThreshold('TETRAHEDRON')).toBe(tetrahedron.threshold);
      expect(consensus.getConsensusThreshold('CUBE')).toBe(cube.threshold);
      expect(consensus.getConsensusThreshold('OCTAHEDRON')).toBeCloseTo(octahedron.threshold, 3);
    });
  });

  describe('Performance', () => {
    it('should complete consensus in reasonable time', async () => {
      const peers = Array.from({ length: 7 }, (_, i) => ({
        id: `peer${i}`,
        agrees: true,
        state: { value: 0.5 }
      }));

      const startTime = Date.now();
      const result = await consensus.achieveConsensus(peers);
      const endTime = Date.now();
      
      expect(result.valid).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });
  });
});
