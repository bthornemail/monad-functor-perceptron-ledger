/**
 * Geometric Consensus Protocol - RFC XXXX Implementation
 * 
 * This module exports the complete implementation of the Geometric Consensus Protocol
 * using Universal Quadratic Forms as specified in RFC XXXX.
 * 
 * @fileoverview Main entry point for the Geometric Consensus Protocol
 * @version 1.0.0
 * @author Geometric Consensus Protocol Team
 */

// Core mathematical structures
export * from './core/HilbertSpace.js';
export * from './core/BlockDesign.js';
export * from './core/FanoPlane.js';
export * from './core/RamanujanForms.js';

// IPv6 encoding system
export * from './encoding/IPv6Encoder.js';
export * from './encoding/PatriciaTrie.js';
export * from './encoding/CryptographicIdentity.js';

// Consensus engine
export * from './consensus/GeometricConsensus.js';
export * from './consensus/BettiCalculator.js';
export * from './consensus/PartitionDetector.js';
export * from './consensus/ChromaticPolynomial.js';

// Graph theory components
export * from './graph/Graph.js';
export * from './graph/CycleDetector.js';
export * from './graph/TuttePolynomial.js';
export * from './graph/GenusClassifier.js';

// Perceptron system
export * from './perceptron/UniversalPerceptron.js';
export * from './perceptron/BrowserModel.js';
export * from './perceptron/FederatedLearning.js';
export * from './perceptron/P2PTypeSynchronizer.js';

// Utilities
export * from './utils/TestVectors.js';
export * from './utils/Validators.js';
export * from './utils/Performance.js';

// Type definitions
export * from './types/index.js';
