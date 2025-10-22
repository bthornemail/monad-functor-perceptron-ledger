/**
 * Type definitions for the Geometric Consensus Protocol
 * 
 * @fileoverview Core type definitions used throughout the protocol
 */

// Basic mathematical types
export type ScalarValue = number | string | boolean;
export type BinaryRelation = [string, string];
export type NetworkStructure = { nodes: string[]; edges: BinaryRelation[] };
export type PointLineRelation = { point: string; line: string[] };
export type MultiwayRelation = string[];
export type Transformation = (input: any) => any;
export type SelfReference = (f: Function) => Function;

// Hilbert space basis vectors
export type HilbertBasis = {
  Node: ScalarValue;
  Edge: BinaryRelation;
  Graph: NetworkStructure;
  Incidence: PointLineRelation;
  Hypergraph: MultiwayRelation;
  Functor: Transformation;
  Monad: SelfReference;
};

// State representation
export interface State {
  values: number[];
  basis: HilbertBasis;
  timestamp: number;
}

// Consensus types
export type ConsensusType = 'TETRAHEDRON' | 'CUBE' | 'OCTAHEDRON';

export interface Consensus {
  valid: boolean;
  steps: number;
  state: State;
  proof?: string;
  type: ConsensusType;
}

// Peer representation
export interface Peer {
  id: string;
  agrees: boolean;
  state?: State;
  ipv6?: string;
}

// Network topology
export interface Network {
  peers: Peer[];
  topology: NetworkStructure;
  partitions?: PartitionInfo[];
}

export interface PartitionInfo {
  isPartitioned: boolean;
  partitionCount: number;
  components: string[][];
}

// Betti numbers
export interface BettiNumbers {
  beta0: number; // Connected components
  beta1: number; // Cycles
  beta2: number; // Voids
}

// Graph structures
export interface Graph {
  vertices: string[];
  edges: BinaryRelation[];
}

export interface GraphComplement {
  original: Graph;
  complement: Graph;
  isSelfComplementary: boolean;
}

// IPv6 encoding
export interface NeuralArchitecture {
  modelFamily: number;
  featureDim: number;
  hiddenLayers: number;
  outputDim: number;
  contextLength: number;
}

export interface IPv6Geometry {
  fanoPoints: number[];
  lotteryWinner: { pair: [number, number]; plane: string };
  geometricShift: { dimension: number; direction: '+' | '-' };
}

// Ramanujan forms
export type RamanujanForm = [number, number, number, number];

export interface FormValidation {
  isValid: boolean;
  reason?: string;
  canRepresent: number[];
  cannotRepresent: number[];
}

// Cryptographic types
export interface CryptographicSignature {
  publicKey: string;
  signature: string;
  algorithm: string;
}

export interface GeometricProof {
  structure: string;
  properties: Record<string, any>;
  verification: boolean;
}

export interface SovereigntyProof {
  signature: CryptographicSignature;
  geometricProof: GeometricProof;
}

// Performance metrics
export interface PerformanceMetrics {
  consensusSteps: number;
  timeComplexity: string;
  spaceComplexity: string;
  networkSize: number;
  executionTime: number;
}

// Test vectors
export interface TestVector {
  input: any;
  expectedOutput: any;
  validation: string;
}

// Browser model types
export interface BrowserModelConfig {
  ipv6: string;
  weights?: Float32Array;
  cache?: boolean;
}

export interface ModelExecution {
  input: Float32Array;
  output: Float32Array;
  executionTime: number;
}

// Federated learning
export interface FederatedUpdate {
  modelId: string;
  updates: Float32Array;
  timestamp: number;
  signature: string;
}

export interface LearningSession {
  sessionId: string;
  participants: string[];
  rounds: number;
  convergence: boolean;
}

// P2P type synchronization
export interface TypeAgreementAtom {
  type: string;
  agreement: boolean;
  confidence: number;
  participants: string[];
}

export interface TypeSynchronization {
  localTypes: string[];
  remoteTypes: string[];
  agreements: TypeAgreementAtom[];
  matching: number; // 2-of-3 guarantee
}
