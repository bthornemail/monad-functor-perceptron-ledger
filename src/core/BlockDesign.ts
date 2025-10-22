/**
 * Balanced Incomplete Block Design (BIBD) Implementation
 * 
 * Implements BIBD with parameters (v,k,λ,r,b) as specified in RFC XXXX.
 * Used for type structure encoding in IPv6 segments 0-4.
 * 
 * @fileoverview BIBD implementation with validation and operations
 */

/**
 * BIBD parameters interface
 */
export interface BIBDParameters {
  v: number; // Number of points
  k: number; // Number of points per block
  lambda: number; // Number of blocks containing any two distinct points
  r: number; // Number of blocks containing any given point
  b: number; // Total number of blocks
}

/**
 * Block in the design
 */
export interface Block {
  id: number;
  points: number[];
}

/**
 * Balanced Incomplete Block Design implementation
 * 
 * A BIBD is a set system (V, B) where:
 * - V is a set of v points
 * - B is a collection of b blocks (subsets of V)
 * - Each block contains exactly k points
 * - Each point appears in exactly r blocks
 * - Every pair of distinct points appears in exactly λ blocks
 * 
 * Required conditions:
 * - vr = bk
 * - λ(v-1) = r(k-1)
 */
export class BlockDesign {
  private parameters: BIBDParameters;
  private blocks: Block[];
  private pointToBlocks: Map<number, number[]>;

  constructor(parameters: BIBDParameters) {
    this.parameters = { ...parameters };
    this.blocks = [];
    this.pointToBlocks = new Map();
    
    this.validateParameters();
    this.generateBlocks();
  }

  /**
   * Validate BIBD parameters
   * 
   * REQUIRED conditions:
   * - vr = bk
   * - λ(v-1) = r(k-1)
   */
  private validateParameters(): void {
    const { v, k, lambda, r, b } = this.parameters;

    // Check basic constraints
    if (v <= 0 || k <= 0 || lambda <= 0 || r <= 0 || b <= 0) {
      throw new Error('All BIBD parameters must be positive');
    }

    if (k > v) {
      throw new Error('Block size k cannot exceed number of points v');
    }

    // REQUIRED: vr = bk
    if (v * r !== b * k) {
      throw new Error(`BIBD condition violated: vr = ${v * r} ≠ bk = ${b * k}`);
    }

    // REQUIRED: λ(v-1) = r(k-1)
    if (lambda * (v - 1) !== r * (k - 1)) {
      throw new Error(`BIBD condition violated: λ(v-1) = ${lambda * (v - 1)} ≠ r(k-1) = ${r * (k - 1)}`);
    }

    // Additional constraints
    if (lambda >= r) {
      throw new Error('λ must be less than r for non-trivial BIBD');
    }
  }

  /**
   * Generate blocks for the BIBD
   * 
   * This is a simplified implementation. In practice, generating
   * BIBDs is a complex combinatorial problem.
   */
  private generateBlocks(): void {
    const { v, k, b } = this.parameters;
    
    // Initialize point-to-blocks mapping
    for (let i = 0; i < v; i++) {
      this.pointToBlocks.set(i, []);
    }

    // Simple block generation (this is a placeholder)
    // Real BIBD generation requires sophisticated algorithms
    for (let blockId = 0; blockId < b; blockId++) {
      const points: number[] = [];
      
      // Generate k points for this block
      for (let i = 0; i < k; i++) {
        const point = (blockId + i) % v;
        points.push(point);
        this.pointToBlocks.get(point)!.push(blockId);
      }

      this.blocks.push({
        id: blockId,
        points: points.sort((a, b) => a - b)
      });
    }

    this.validateDesign();
  }

  /**
   * Validate the generated design
   */
  private validateDesign(): void {
    const { v, k, lambda, r } = this.parameters;

    // Check each point appears in exactly r blocks
    for (let point = 0; point < v; point++) {
      const blockCount = this.pointToBlocks.get(point)!.length;
      if (blockCount !== r) {
        throw new Error(`Point ${point} appears in ${blockCount} blocks, expected ${r}`);
      }
    }

    // Check each block has exactly k points
    for (const block of this.blocks) {
      if (block.points.length !== k) {
        throw new Error(`Block ${block.id} has ${block.points.length} points, expected ${k}`);
      }
    }

    // Check every pair of points appears in exactly λ blocks
    for (let i = 0; i < v; i++) {
      for (let j = i + 1; j < v; j++) {
        const commonBlocks = this.getCommonBlocks(i, j);
        if (commonBlocks.length !== lambda) {
          throw new Error(`Points ${i} and ${j} appear in ${commonBlocks.length} common blocks, expected ${lambda}`);
        }
      }
    }
  }

  /**
   * Get blocks containing both given points
   * 
   * @param point1 First point
   * @param point2 Second point
   * @returns Array of block IDs containing both points
   */
  private getCommonBlocks(point1: number, point2: number): number[] {
    const blocks1 = this.pointToBlocks.get(point1) || [];
    const blocks2 = this.pointToBlocks.get(point2) || [];
    
    return blocks1.filter(blockId => blocks2.includes(blockId));
  }

  /**
   * Get BIBD parameters
   * 
   * @returns Copy of BIBD parameters
   */
  getParameters(): BIBDParameters {
    return { ...this.parameters };
  }

  /**
   * Get all blocks
   * 
   * @returns Array of all blocks
   */
  getBlocks(): Block[] {
    return [...this.blocks];
  }

  /**
   * Get blocks containing a specific point
   * 
   * @param point Point ID
   * @returns Array of block IDs containing the point
   */
  getBlocksContainingPoint(point: number): number[] {
    if (point < 0 || point >= this.parameters.v) {
      throw new Error(`Point ${point} is out of range [0, ${this.parameters.v - 1}]`);
    }
    
    return [...(this.pointToBlocks.get(point) || [])];
  }

  /**
   * Get points in a specific block
   * 
   * @param blockId Block ID
   * @returns Array of point IDs in the block
   */
  getPointsInBlock(blockId: number): number[] {
    if (blockId < 0 || blockId >= this.parameters.b) {
      throw new Error(`Block ${blockId} is out of range [0, ${this.parameters.b - 1}]`);
    }
    
    return [...this.blocks[blockId].points];
  }

  /**
   * Check if two points are in the same block
   * 
   * @param point1 First point
   * @param point2 Second point
   * @returns True if points share at least one block
   */
  arePointsConnected(point1: number, point2: number): boolean {
    const commonBlocks = this.getCommonBlocks(point1, point2);
    return commonBlocks.length > 0;
  }

  /**
   * Get the incidence matrix of the BIBD
   * 
   * @returns v×b matrix where entry (i,j) is 1 if point i is in block j, 0 otherwise
   */
  getIncidenceMatrix(): number[][] {
    const { v, b } = this.parameters;
    const matrix: number[][] = [];

    for (let i = 0; i < v; i++) {
      const row: number[] = [];
      for (let j = 0; j < b; j++) {
        const isInBlock = this.blocks[j].points.includes(i) ? 1 : 0;
        row.push(isInBlock);
      }
      matrix.push(row);
    }

    return matrix;
  }

  /**
   * Calculate the complement design
   * 
   * @returns New BlockDesign representing the complement
   */
  complement(): BlockDesign {
    const { v, k, lambda, r, b } = this.parameters;
    
    // Complement parameters
    const complementParams: BIBDParameters = {
      v: v,
      k: v - k,
      lambda: b - 2 * r + lambda,
      r: b - r,
      b: b
    };

    return new BlockDesign(complementParams);
  }

  /**
   * Check if this BIBD is symmetric (v = b, r = k)
   * 
   * @returns True if the BIBD is symmetric
   */
  isSymmetric(): boolean {
    const { v, k, r, b } = this.parameters;
    return v === b && r === k;
  }

  /**
   * Get design statistics
   * 
   * @returns Object with design statistics
   */
  getStatistics(): {
    totalPoints: number;
    totalBlocks: number;
    pointsPerBlock: number;
    blocksPerPoint: number;
    pairsPerBlock: number;
    isSymmetric: boolean;
  } {
    const { v, k, r, b } = this.parameters;
    
    return {
      totalPoints: v,
      totalBlocks: b,
      pointsPerBlock: k,
      blocksPerPoint: r,
      pairsPerBlock: this.parameters.lambda,
      isSymmetric: this.isSymmetric()
    };
  }
}
