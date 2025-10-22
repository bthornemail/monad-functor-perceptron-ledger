/**
 * Unit Tests for IPv6 Encoder
 * 
 * Tests IPv6 encoding and decoding with Fano plane structure
 * as specified in RFC XXXX.
 */

import { describe, it, expect } from 'vitest';
import { IPv6Encoder } from '../../encoding/IPv6Encoder.js';
import { TestVectors } from '../../utils/TestVectors.js';

describe('IPv6Encoder', () => {
  describe('Basic Encoding', () => {
    it('should encode neural architecture to IPv6', () => {
      const testVector = TestVectors.IPv6.BASIC_ENCODING;
      const { input, expectedOutput } = testVector;
      
      const result = IPv6Encoder.encode(input);
      expect(result).toBe(expectedOutput);
    });

    it('should decode IPv6 to neural architecture', () => {
      const testVector = TestVectors.IPv6.BASIC_ENCODING;
      const { input, expectedOutput } = testVector;
      
      const decoded = IPv6Encoder.decode(expectedOutput);
      expect(decoded).toEqual(input);
    });

    it('should handle maximum values', () => {
      const testVector = TestVectors.IPv6.MAXIMUM_VALUES;
      const { input, expectedOutput } = testVector;
      
      const result = IPv6Encoder.encode(input);
      expect(result).toBe(expectedOutput);
      
      const decoded = IPv6Encoder.decode(expectedOutput);
      expect(decoded).toEqual(input);
    });
  });

  describe('Fano Plane Encoding', () => {
    it('should encode Fano plane structure', () => {
      const testVector = TestVectors.IPv6.FANO_PLANE_ENCODING;
      const { input, expectedOutput } = testVector;
      
      const result = IPv6Encoder.encodeFanoPlane(input);
      expect(result).toBe(expectedOutput);
    });

    it('should decode Fano plane structure', () => {
      const testVector = TestVectors.IPv6.FANO_PLANE_ENCODING;
      const { input, expectedOutput } = testVector;
      
      const decoded = IPv6Encoder.decodeFanoPlane(expectedOutput);
      expect(decoded).toEqual(input);
    });

    it('should validate Fano plane encoding', () => {
      const testVector = TestVectors.IPv6.FANO_PLANE_ENCODING;
      const { input } = testVector;
      
      expect(input.fanoPoints).toHaveLength(7);
      expect(input.lotteryWinner.pair).toHaveLength(2);
      expect(['+', '-']).toContain(input.geometricShift.direction);
    });
  });

  describe('Validation', () => {
    it('should validate IPv6 format', () => {
      const validIPv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      expect(IPv6Encoder.validateIPv6(validIPv6)).toBe(true);
    });

    it('should reject invalid IPv6 format', () => {
      const invalidIPv6 = '2001:0db8:85a3:0000:0000:8a2e:0370';
      expect(IPv6Encoder.validateIPv6(invalidIPv6)).toBe(false);
    });

    it('should reject invalid neural architecture', () => {
      const invalidArch = {
        modelFamily: -1, // Invalid
        featureDim: 64,
        hiddenLayers: 2,
        outputDim: 10,
        contextLength: 512
      };
      
      expect(() => {
        IPv6Encoder.encode(invalidArch);
      }).toThrow('Invalid neural architecture');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const arch = {
        modelFamily: 0,
        featureDim: 0,
        hiddenLayers: 0,
        outputDim: 0,
        contextLength: 0
      };
      
      const encoded = IPv6Encoder.encode(arch);
      const decoded = IPv6Encoder.decode(encoded);
      
      expect(decoded).toEqual(arch);
    });

    it('should handle single values', () => {
      const arch = {
        modelFamily: 1,
        featureDim: 1,
        hiddenLayers: 1,
        outputDim: 1,
        contextLength: 1
      };
      
      const encoded = IPv6Encoder.encode(arch);
      const decoded = IPv6Encoder.decode(encoded);
      
      expect(decoded).toEqual(arch);
    });
  });

  describe('Test Vectors', () => {
    it('should pass all IPv6 test vectors', () => {
      const testVectors = [
        TestVectors.IPv6.BASIC_ENCODING,
        TestVectors.IPv6.MAXIMUM_VALUES,
        TestVectors.IPv6.FANO_PLANE_ENCODING
      ];
      
      for (const testVector of testVectors) {
        if ('modelFamily' in testVector.input) {
          // Neural architecture test
          const encoded = IPv6Encoder.encode(testVector.input);
          expect(encoded).toBe(testVector.expectedOutput);
          
          const decoded = IPv6Encoder.decode(encoded);
          expect(decoded).toEqual(testVector.input);
        } else {
          // Fano plane test
          const encoded = IPv6Encoder.encodeFanoPlane(testVector.input);
          expect(encoded).toBe(testVector.expectedOutput);
          
          const decoded = IPv6Encoder.decodeFanoPlane(encoded);
          expect(decoded).toEqual(testVector.input);
        }
      }
    });
  });
});
