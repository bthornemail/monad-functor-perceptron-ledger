/**
 * Browser Model Implementation
 * 
 * Implements browser-native model execution as specified in RFC XXXX.
 * Loads models from IPv6 addresses with weight caching and forward pass execution.
 * 
 * @fileoverview Browser model with IPv6 loading and weight caching
 */

import type { BrowserModelConfig, ModelExecution, NeuralArchitecture } from '../types/index.js';
import { IPv6Encoder } from '../encoding/IPv6Encoder.js';

/**
 * Model weights structure
 */
export interface ModelWeights {
  layers: Float32Array[];
  biases: Float32Array[];
  metadata: {
    architecture: NeuralArchitecture;
    timestamp: number;
    version: string;
  };
}

/**
 * Browser model for geometric consensus
 * 
 * REQUIRED features:
 * - Load models from IPv6 addresses in browser
 * - Forward pass execution
 * - Weight caching in localStorage/IndexedDB
 * - No installation or specialized hardware required
 */
export class BrowserModel {
  private config: BrowserModelConfig;
  private weights: ModelWeights | null = null;
  private encoder: IPv6Encoder;

  constructor(config: BrowserModelConfig) {
    this.config = { ...config };
    this.encoder = new IPv6Encoder();
    this.validateConfig();
  }

  /**
   * Load model from IPv6 address
   * 
   * @param ipv6 IPv6 address containing model
   * @returns Promise resolving to loaded model
   */
  static async fromIPv6(ipv6: string): Promise<BrowserModel> {
    const config: BrowserModelConfig = {
      ipv6,
      cache: true
    };
    
    const model = new BrowserModel(config);
    await model.loadFromIPv6();
    return model;
  }

  /**
   * Load model from IPv6 address
   * 
   * @returns Promise resolving when model is loaded
   */
  async loadFromIPv6(): Promise<void> {
    try {
      // Decode IPv6 to get architecture
      const architecture = this.encoder.decode(this.config.ipv6);
      
      // Try to load from cache first
      if (this.config.cache) {
        const cachedWeights = await this.loadFromCache();
        if (cachedWeights) {
          this.weights = cachedWeights;
          return;
        }
      }
      
      // Generate weights based on architecture
      this.weights = await this.generateWeights(architecture);
      
      // Cache weights if enabled
      if (this.config.cache) {
        await this.cacheWeights();
      }
    } catch (error) {
      throw new Error(`Failed to load model from IPv6 ${this.config.ipv6}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute forward pass
   * 
   * @param input Input data
   * @returns Promise resolving to execution result
   */
  async forward(input: Float32Array): Promise<ModelExecution> {
    if (!this.weights) {
      throw new Error('Model not loaded. Call loadFromIPv6() first.');
    }
    
    const startTime = Date.now();
    
    try {
      // Execute forward pass through all layers
      let currentInput = input;
      
      for (let i = 0; i < this.weights.layers.length; i++) {
        currentInput = this.executeLayer(currentInput, this.weights.layers[i], this.weights.biases[i]);
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        input,
        output: currentInput,
        executionTime
      };
    } catch (error) {
      throw new Error(`Forward pass failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a single layer
   * 
   * @param input Layer input
   * @param weights Layer weights
   * @param biases Layer biases
   * @returns Layer output
   */
  private executeLayer(input: Float32Array, weights: Float32Array, biases: Float32Array): Float32Array {
    const inputSize = input.length;
    const outputSize = biases.length;
    
    // Reshape weights matrix
    const weightMatrix: number[][] = [];
    for (let i = 0; i < outputSize; i++) {
      weightMatrix[i] = [];
      for (let j = 0; j < inputSize; j++) {
        weightMatrix[i][j] = weights[i * inputSize + j];
      }
    }
    
    // Compute output: output = weights * input + biases
    const output = new Float32Array(outputSize);
    
    for (let i = 0; i < outputSize; i++) {
      let sum = biases[i];
      for (let j = 0; j < inputSize; j++) {
        sum += weightMatrix[i][j] * input[j];
      }
      output[i] = this.activationFunction(sum);
    }
    
    return output;
  }

  /**
   * Activation function (ReLU)
   * 
   * @param x Input value
   * @returns Activated value
   */
  private activationFunction(x: number): number {
    return Math.max(0, x); // ReLU activation
  }

  /**
   * Generate model weights from architecture
   * 
   * @param architecture Neural architecture
   * @returns Generated model weights
   */
  private async generateWeights(architecture: NeuralArchitecture): Promise<ModelWeights> {
    const layers: Float32Array[] = [];
    const biases: Float32Array[] = [];
    
    // Generate weights for each layer
    let inputSize = architecture.featureDim;
    
    for (let i = 0; i < architecture.hiddenLayers; i++) {
      const outputSize = Math.max(architecture.featureDim, architecture.outputDim);
      
      // Generate layer weights
      const layerWeights = new Float32Array(inputSize * outputSize);
      for (let j = 0; j < layerWeights.length; j++) {
        layerWeights[j] = this.generateWeight(architecture, i, j);
      }
      
      // Generate layer biases
      const layerBiases = new Float32Array(outputSize);
      for (let j = 0; j < layerBiases.length; j++) {
        layerBiases[j] = this.generateBias(architecture, i, j);
      }
      
      layers.push(layerWeights);
      biases.push(layerBiases);
      
      inputSize = outputSize;
    }
    
    // Output layer
    const outputWeights = new Float32Array(inputSize * architecture.outputDim);
    for (let j = 0; j < outputWeights.length; j++) {
      outputWeights[j] = this.generateWeight(architecture, architecture.hiddenLayers, j);
    }
    
    const outputBiases = new Float32Array(architecture.outputDim);
    for (let j = 0; j < outputBiases.length; j++) {
      outputBiases[j] = this.generateBias(architecture, architecture.hiddenLayers, j);
    }
    
    layers.push(outputWeights);
    biases.push(outputBiases);
    
    return {
      layers,
      biases,
      metadata: {
        architecture,
        timestamp: Date.now(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Generate weight value
   * 
   * @param architecture Neural architecture
   * @param layerIndex Layer index
   * @param weightIndex Weight index
   * @returns Generated weight value
   */
  private generateWeight(architecture: NeuralArchitecture, layerIndex: number, weightIndex: number): number {
    // Use architecture parameters to generate deterministic weights
    const seed = architecture.modelFamily * 1000 + 
                 architecture.featureDim * 100 + 
                 architecture.hiddenLayers * 10 + 
                 layerIndex * 1000 + 
                 weightIndex;
    
    return this.pseudoRandom(seed) * 0.1 - 0.05; // Small random weights
  }

  /**
   * Generate bias value
   * 
   * @param architecture Neural architecture
   * @param layerIndex Layer index
   * @param biasIndex Bias index
   * @returns Generated bias value
   */
  private generateBias(architecture: NeuralArchitecture, layerIndex: number, biasIndex: number): number {
    // Use architecture parameters to generate deterministic biases
    const seed = architecture.modelFamily * 1000 + 
                 architecture.outputDim * 100 + 
                 architecture.contextLength * 10 + 
                 layerIndex * 1000 + 
                 biasIndex;
    
    return this.pseudoRandom(seed) * 0.1 - 0.05; // Small random biases
  }

  /**
   * Pseudo-random number generator
   * 
   * @param seed Seed value
   * @returns Pseudo-random number in [-1, 1]
   */
  private pseudoRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Load weights from cache
   * 
   * @returns Cached weights or null
   */
  private async loadFromCache(): Promise<ModelWeights | null> {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(`model_${this.config.ipv6}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          return this.deserializeWeights(parsed);
        }
      }
      
      if (typeof indexedDB !== 'undefined') {
        return await this.loadFromIndexedDB();
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error);
    }
    
    return null;
  }

  /**
   * Cache weights
   * 
   * @returns Promise resolving when weights are cached
   */
  async cacheWeights(): Promise<void> {
    if (!this.weights) {
      throw new Error('No weights to cache');
    }
    
    try {
      if (typeof localStorage !== 'undefined') {
        const serialized = this.serializeWeights(this.weights);
        localStorage.setItem(`model_${this.config.ipv6}`, JSON.stringify(serialized));
      }
      
      if (typeof indexedDB !== 'undefined') {
        await this.saveToIndexedDB();
      }
    } catch (error) {
      console.warn('Failed to cache weights:', error);
    }
  }

  /**
   * Load from IndexedDB
   * 
   * @returns Cached weights or null
   */
  private async loadFromIndexedDB(): Promise<ModelWeights | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('GeometricConsensusModels', 1);
      
      request.onerror = () => resolve(null);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['models'], 'readonly');
        const store = transaction.objectStore('models');
        const getRequest = store.get(this.config.ipv6);
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            resolve(this.deserializeWeights(getRequest.result));
          } else {
            resolve(null);
          }
        };
        
        getRequest.onerror = () => resolve(null);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'ipv6' });
        }
      };
    });
  }

  /**
   * Save to IndexedDB
   * 
   * @returns Promise resolving when saved
   */
  private async saveToIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GeometricConsensusModels', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['models'], 'readwrite');
        const store = transaction.objectStore('models');
        const serialized = this.serializeWeights(this.weights!);
        
        const putRequest = store.put({
          ipv6: this.config.ipv6,
          weights: serialized,
          timestamp: Date.now()
        });
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'ipv6' });
        }
      };
    });
  }

  /**
   * Serialize weights for storage
   * 
   * @param weights Weights to serialize
   * @returns Serialized weights
   */
  private serializeWeights(weights: ModelWeights): any {
    return {
      layers: weights.layers.map(layer => Array.from(layer)),
      biases: weights.biases.map(bias => Array.from(bias)),
      metadata: weights.metadata
    };
  }

  /**
   * Deserialize weights from storage
   * 
   * @param serialized Serialized weights
   * @returns Deserialized weights
   */
  private deserializeWeights(serialized: any): ModelWeights {
    return {
      layers: serialized.layers.map((layer: number[]) => new Float32Array(layer)),
      biases: serialized.biases.map((bias: number[]) => new Float32Array(bias)),
      metadata: serialized.metadata
    };
  }

  /**
   * Validate browser model configuration
   */
  private validateConfig(): void {
    if (!this.config.ipv6) {
      throw new Error('IPv6 address is required');
    }
    
    if (!this.encoder.validateIPv6(this.config.ipv6)) {
      throw new Error('Invalid IPv6 address format');
    }
  }

  /**
   * Get model information
   * 
   * @returns Model information
   */
  getModelInfo(): {
    ipv6: string;
    loaded: boolean;
    architecture?: NeuralArchitecture;
    layerCount?: number;
    totalParameters?: number;
  } {
    const info: any = {
      ipv6: this.config.ipv6,
      loaded: this.weights !== null
    };
    
    if (this.weights) {
      info.architecture = this.weights.metadata.architecture;
      info.layerCount = this.weights.layers.length;
      info.totalParameters = this.weights.layers.reduce((sum, layer) => sum + layer.length, 0) +
                            this.weights.biases.reduce((sum, bias) => sum + bias.length, 0);
    }
    
    return info;
  }

  /**
   * Clear cached weights
   * 
   * @returns Promise resolving when cache is cleared
   */
  async clearCache(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`model_${this.config.ipv6}`);
      }
      
      if (typeof indexedDB !== 'undefined') {
        const request = indexedDB.open('GeometricConsensusModels', 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['models'], 'readwrite');
          const store = transaction.objectStore('models');
          store.delete(this.config.ipv6);
        };
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}
