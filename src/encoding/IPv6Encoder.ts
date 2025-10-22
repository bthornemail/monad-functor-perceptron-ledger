/**
 * IPv6 Encoder for Geometric Consensus Protocol
 * 
 * Encodes neural architecture and geometric parameters into IPv6 addresses
 * as specified in RFC XXXX. Segments 0-6 encode Fano plane, segment 7 encodes lottery+shift.
 * 
 * @fileoverview IPv6 encoding/decoding with geometric parameter extraction
 */

import type { NeuralArchitecture, IPv6Geometry } from '../types/index.js';
import { FanoPlane } from '../core/FanoPlane.js';

/**
 * IPv6 address structure
 * 
 * Format: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
 * Segments 0-6: Fano plane structure (7 points)
 * Segment 7: Geometric shift ±{0,1,2,3} and lottery result
 */
export interface IPv6Address {
  segments: string[];
  fanoPoints: number[];
  lotteryWinner: { pair: [number, number]; plane: string };
  geometricShift: { dimension: number; direction: '+' | '-' };
}

/**
 * IPv6 encoder/decoder for geometric consensus
 */
export class IPv6Encoder {
  private fanoPlane: FanoPlane;

  constructor() {
    this.fanoPlane = new FanoPlane();
  }

  /**
   * Encode neural architecture to IPv6 address
   * 
   * @param architecture Neural architecture parameters
   * @returns IPv6 address string
   */
  encode(architecture: NeuralArchitecture): string {
    // Validate input parameters
    this.validateArchitecture(architecture);

    // Encode to IPv6 segments
    const segments = this.encodeToSegments(architecture);
    
    // Format as IPv6 address
    return this.formatIPv6(segments);
  }

  /**
   * Decode IPv6 address to neural architecture
   * 
   * @param ipv6 IPv6 address string
   * @returns Neural architecture parameters
   */
  decode(ipv6: string): NeuralArchitecture {
    // Parse IPv6 address
    const segments = this.parseIPv6(ipv6);
    
    // Decode from segments
    return this.decodeFromSegments(segments);
  }

  /**
   * Encode neural architecture to IPv6 segments
   * 
   * @param architecture Neural architecture
   * @returns Array of 8 IPv6 segments
   */
  private encodeToSegments(architecture: NeuralArchitecture): string[] {
    const segments: string[] = [];

    // Segments 0-6: Encode Fano plane structure
    const fanoPoints = this.encodeFanoPlane(architecture);
    for (let i = 0; i < 7; i++) {
      segments.push(this.packSegment(fanoPoints[i]));
    }

    // Segment 7: Encode lottery winner and geometric shift
    const lotteryShift = this.encodeLotteryShift(architecture);
    segments.push(lotteryShift);

    return segments;
  }

  /**
   * Encode Fano plane structure in segments 0-6
   * 
   * @param architecture Neural architecture
   * @returns Array of 7 Fano point values
   */
  private encodeFanoPlane(architecture: NeuralArchitecture): number[] {
    // Map architecture parameters to Fano plane points
    // This is a simplified mapping - in practice, this would be more sophisticated
    const fanoPoints: number[] = [];
    
    fanoPoints[0] = architecture.modelFamily;
    fanoPoints[1] = Math.min(architecture.featureDim, 65535);
    fanoPoints[2] = Math.min(architecture.hiddenLayers, 65535);
    fanoPoints[3] = Math.min(architecture.outputDim, 65535);
    fanoPoints[4] = Math.min(architecture.contextLength, 65535);
    fanoPoints[5] = 0; // Reserved for cryptographic identity
    fanoPoints[6] = 0; // Reserved for cryptographic identity

    return fanoPoints;
  }

  /**
   * Encode lottery winner and geometric shift in segment 7
   * 
   * @param architecture Neural architecture
   * @returns Encoded segment 7 string
   */
  private encodeLotteryShift(architecture: NeuralArchitecture): string {
    // Lottery winner: 8 bits (0-255)
    const lotteryWinner = this.calculateLotteryWinner(architecture);
    
    // Geometric shift: 4 bits (0-15, representing k ∈ {0,1,2,3})
    const geometricShift = this.calculateGeometricShift(architecture);
    
    // Direction: 1 bit (0 = +, 1 = -)
    const direction = 0; // Default to positive
    
    // Reserved: 3 bits
    const reserved = 0;

    // Pack into 16-bit value
    const packed = (lotteryWinner << 8) | (geometricShift << 4) | (direction << 3) | reserved;
    
    return this.packSegment(packed);
  }

  /**
   * Calculate lottery winner from architecture
   * 
   * @param architecture Neural architecture
   * @returns Lottery winner value (0-255)
   */
  private calculateLotteryWinner(architecture: NeuralArchitecture): number {
    // Simple hash-based lottery calculation
    const hash = this.simpleHash(architecture);
    return hash % 256;
  }

  /**
   * Calculate geometric shift from architecture
   * 
   * @param architecture Neural architecture
   * @returns Geometric shift k ∈ {0,1,2,3}
   */
  private calculateGeometricShift(architecture: NeuralArchitecture): number {
    // Map architecture complexity to geometric shift
    const complexity = architecture.featureDim + architecture.hiddenLayers + architecture.outputDim;
    return complexity % 4;
  }

  /**
   * Simple hash function for lottery calculation
   * 
   * @param architecture Neural architecture
   * @returns Hash value
   */
  private simpleHash(architecture: NeuralArchitecture): number {
    let hash = 0;
    hash ^= architecture.modelFamily;
    hash ^= architecture.featureDim << 8;
    hash ^= architecture.hiddenLayers << 16;
    hash ^= architecture.outputDim << 24;
    hash ^= architecture.contextLength;
    return Math.abs(hash);
  }

  /**
   * Pack a 16-bit value into IPv6 segment format
   * 
   * @param value 16-bit value
   * @returns IPv6 segment string
   */
  private packSegment(value: number): string {
    if (value < 0 || value > 65535) {
      throw new Error(`Value ${value} is out of range [0, 65535]`);
    }
    
    return value.toString(16).padStart(4, '0');
  }

  /**
   * Unpack IPv6 segment to 16-bit value
   * 
   * @param segment IPv6 segment string
   * @returns 16-bit value
   */
  private unpackSegment(segment: string): number {
    if (!/^[0-9a-fA-F]{4}$/.test(segment)) {
      throw new Error(`Invalid IPv6 segment format: ${segment}`);
    }
    
    return parseInt(segment, 16);
  }

  /**
   * Format segments as IPv6 address
   * 
   * @param segments Array of 8 segments
   * @returns IPv6 address string
   */
  private formatIPv6(segments: string[]): string {
    if (segments.length !== 8) {
      throw new Error('IPv6 address must have exactly 8 segments');
    }
    
    return segments.join(':');
  }

  /**
   * Parse IPv6 address into segments
   * 
   * @param ipv6 IPv6 address string
   * @returns Array of 8 segments
   */
  private parseIPv6(ipv6: string): string[] {
    // Basic IPv6 validation
    if (!/^[0-9a-fA-F:]+$/.test(ipv6)) {
      throw new Error(`Invalid IPv6 address format: ${ipv6}`);
    }
    
    const segments = ipv6.split(':');
    if (segments.length !== 8) {
      throw new Error(`IPv6 address must have exactly 8 segments, got ${segments.length}`);
    }
    
    // Validate each segment
    for (const segment of segments) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(segment)) {
        throw new Error(`Invalid IPv6 segment format: ${segment}`);
      }
    }
    
    return segments;
  }

  /**
   * Decode IPv6 segments to neural architecture
   * 
   * @param segments Array of 8 IPv6 segments
   * @returns Neural architecture parameters
   */
  private decodeFromSegments(segments: string[]): NeuralArchitecture {
    // Decode Fano plane from segments 0-6
    const fanoPoints = this.decodeFanoPlane(segments.slice(0, 7));
    
    // Decode lottery and shift from segment 7
    const lotteryShift = this.decodeLotteryShift(segments[7]);
    
    // Reconstruct neural architecture
    return {
      modelFamily: fanoPoints[0],
      featureDim: fanoPoints[1],
      hiddenLayers: fanoPoints[2],
      outputDim: fanoPoints[3],
      contextLength: fanoPoints[4]
    };
  }

  /**
   * Decode Fano plane structure from segments 0-6
   * 
   * @param segments Array of 7 segments
   * @returns Array of 7 Fano point values
   */
  private decodeFanoPlane(segments: string[]): number[] {
    return segments.map(segment => this.unpackSegment(segment));
  }

  /**
   * Decode lottery winner and geometric shift from segment 7
   * 
   * @param segment Segment 7 string
   * @returns Decoded lottery and shift information
   */
  private decodeLotteryShift(segment: string): { lotteryWinner: number; geometricShift: number; direction: '+' | '-' } {
    const value = this.unpackSegment(segment);
    
    const lotteryWinner = (value >> 8) & 0xFF;
    const geometricShift = (value >> 4) & 0xF;
    const direction = (value >> 3) & 0x1 ? '-' : '+';
    
    return { lotteryWinner, geometricShift, direction };
  }

  /**
   * Validate neural architecture parameters
   * 
   * @param architecture Neural architecture to validate
   */
  private validateArchitecture(architecture: NeuralArchitecture): void {
    if (architecture.modelFamily < 0 || architecture.modelFamily > 15) {
      throw new Error(`Model family ${architecture.modelFamily} is out of range [0, 15]`);
    }
    
    if (architecture.featureDim < 1 || architecture.featureDim > 65535) {
      throw new Error(`Feature dimension ${architecture.featureDim} is out of range [1, 65535]`);
    }
    
    if (architecture.hiddenLayers < 0 || architecture.hiddenLayers > 15) {
      throw new Error(`Hidden layers ${architecture.hiddenLayers} is out of range [0, 15]`);
    }
    
    if (architecture.outputDim < 1 || architecture.outputDim > 65535) {
      throw new Error(`Output dimension ${architecture.outputDim} is out of range [1, 65535]`);
    }
    
    if (architecture.contextLength < 1 || architecture.contextLength > 65535) {
      throw new Error(`Context length ${architecture.contextLength} is out of range [1, 65535]`);
    }
  }

  /**
   * Extract geometric parameters from IPv6 address
   * 
   * @param ipv6 IPv6 address string
   * @returns Geometric parameters
   */
  extractGeometry(ipv6: string): IPv6Geometry {
    const segments = this.parseIPv6(ipv6);
    const fanoPoints = this.decodeFanoPlane(segments.slice(0, 7));
    const lotteryShift = this.decodeLotteryShift(segments[7]);
    
    return {
      fanoPoints,
      lotteryWinner: { 
        pair: [fanoPoints[0], fanoPoints[1]], 
        plane: 'A' 
      },
      geometricShift: { 
        dimension: lotteryShift.geometricShift, 
        direction: lotteryShift.direction 
      }
    };
  }

  /**
   * Validate IPv6 address format and structure
   * 
   * @param ipv6 IPv6 address string
   * @returns True if address is valid
   */
  validateIPv6(ipv6: string): boolean {
    try {
      this.parseIPv6(ipv6);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get IPv6 address statistics
   * 
   * @param ipv6 IPv6 address string
   * @returns Address statistics
   */
  getAddressStatistics(ipv6: string): {
    segments: string[];
    fanoPoints: number[];
    lotteryWinner: number;
    geometricShift: number;
    direction: string;
    isValid: boolean;
  } {
    try {
      const segments = this.parseIPv6(ipv6);
      const fanoPoints = this.decodeFanoPlane(segments.slice(0, 7));
      const lotteryShift = this.decodeLotteryShift(segments[7]);
      
      return {
        segments,
        fanoPoints,
        lotteryWinner: lotteryShift.lotteryWinner,
        geometricShift: lotteryShift.geometricShift,
        direction: lotteryShift.direction,
        isValid: true
      };
    } catch (error) {
      return {
        segments: [],
        fanoPoints: [],
        lotteryWinner: 0,
        geometricShift: 0,
        direction: '+',
        isValid: false
      };
    }
  }
}
