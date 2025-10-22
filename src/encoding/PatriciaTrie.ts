/**
 * Patricia Trie RPC Implementation
 * 
 * Implements signature-based storage with universal binary data access
 * as specified in RFC XXXX. Stores signatures separately from data.
 * 
 * @fileoverview Patricia trie for universal RPC calls and signature storage
 */

/**
 * Patricia trie node
 */
interface PatriciaNode {
  key: string;
  value?: Uint8Array;
  signature?: string;
  children: Map<string, PatriciaNode>;
  isLeaf: boolean;
}

/**
 * RPC call structure
 */
export interface RPCCall {
  method: string;
  params: any[];
  signature: string;
  timestamp: number;
}

/**
 * Patricia Trie for universal RPC calls
 * 
 * REQUIRED properties:
 * - Signature-based storage with universal binary data access
 * - Signatures stored separately from data
 * - Support for universal RPC calls
 */
export class PatriciaTrie {
  private root: PatriciaNode;
  private signatures: Map<string, string>; // Separate signature storage

  constructor() {
    this.root = {
      key: '',
      children: new Map(),
      isLeaf: false
    };
    this.signatures = new Map();
  }

  /**
   * Insert data with signature
   * 
   * @param key Data key
   * @param data Binary data
   * @param signature Cryptographic signature
   */
  insert(key: string, data: Uint8Array, signature: string): void {
    if (!key || !signature) {
      throw new Error('Key and signature are required');
    }

    // Store signature separately
    this.signatures.set(key, signature);

    // Insert data into trie
    this.insertNode(this.root, key, data, 0);
  }

  /**
   * Retrieve data and signature
   * 
   * @param key Data key
   * @returns Object with data and signature, or null if not found
   */
  get(key: string): { data: Uint8Array; signature: string } | null {
    const node = this.findNode(this.root, key, 0);
    if (!node || !node.isLeaf || !node.value) {
      return null;
    }

    const signature = this.signatures.get(key);
    if (!signature) {
      throw new Error(`Signature not found for key: ${key}`);
    }

    return {
      data: node.value,
      signature
    };
  }

  /**
   * Check if key exists
   * 
   * @param key Data key
   * @returns True if key exists
   */
  has(key: string): boolean {
    const node = this.findNode(this.root, key, 0);
    return node !== null && node.isLeaf && node.value !== undefined;
  }

  /**
   * Delete data and signature
   * 
   * @param key Data key
   * @returns True if deletion was successful
   */
  delete(key: string): boolean {
    const deleted = this.deleteNode(this.root, key, 0);
    if (deleted) {
      this.signatures.delete(key);
    }
    return deleted;
  }

  /**
   * Get all keys with a given prefix
   * 
   * @param prefix Key prefix
   * @returns Array of keys with the prefix
   */
  getKeysWithPrefix(prefix: string): string[] {
    const keys: string[] = [];
    this.collectKeysWithPrefix(this.root, prefix, '', keys);
    return keys;
  }

  /**
   * Get trie statistics
   * 
   * @returns Object with trie statistics
   */
  getStatistics(): {
    totalNodes: number;
    totalLeaves: number;
    totalSignatures: number;
    maxDepth: number;
  } {
    const stats = {
      totalNodes: 0,
      totalLeaves: 0,
      totalSignatures: this.signatures.size,
      maxDepth: 0
    };

    this.collectStatistics(this.root, 0, stats);
    return stats;
  }

  /**
   * Insert node into trie
   * 
   * @param node Current node
   * @param key Full key
   * @param data Binary data
   * @param depth Current depth
   */
  private insertNode(node: PatriciaNode, key: string, data: Uint8Array, depth: number): void {
    if (depth === key.length) {
      node.value = data;
      node.isLeaf = true;
      return;
    }

    const char = key[depth];
    let child = node.children.get(char);

    if (!child) {
      child = {
        key: char,
        children: new Map(),
        isLeaf: false
      };
      node.children.set(char, child);
    }

    this.insertNode(child, key, data, depth + 1);
  }

  /**
   * Find node by key
   * 
   * @param node Current node
   * @param key Full key
   * @param depth Current depth
   * @returns Found node or null
   */
  private findNode(node: PatriciaNode, key: string, depth: number): PatriciaNode | null {
    if (depth === key.length) {
      return node;
    }

    const char = key[depth];
    const child = node.children.get(char);

    if (!child) {
      return null;
    }

    return this.findNode(child, key, depth + 1);
  }

  /**
   * Delete node by key
   * 
   * @param node Current node
   * @param key Full key
   * @param depth Current depth
   * @returns True if deletion was successful
   */
  private deleteNode(node: PatriciaNode, key: string, depth: number): boolean {
    if (depth === key.length) {
      if (node.isLeaf) {
        node.value = undefined;
        node.isLeaf = false;
        return true;
      }
      return false;
    }

    const char = key[depth];
    const child = node.children.get(char);

    if (!child) {
      return false;
    }

    const deleted = this.deleteNode(child, key, depth + 1);

    // Clean up empty nodes
    if (deleted && !child.isLeaf && child.children.size === 0) {
      node.children.delete(char);
    }

    return deleted;
  }

  /**
   * Collect keys with prefix
   * 
   * @param node Current node
   * @param prefix Target prefix
   * @param currentKey Current key being built
   * @param keys Array to collect keys
   */
  private collectKeysWithPrefix(node: PatriciaNode, prefix: string, currentKey: string, keys: string[]): void {
    if (node.isLeaf && currentKey.startsWith(prefix)) {
      keys.push(currentKey);
    }

    for (const [char, child] of node.children) {
      this.collectKeysWithPrefix(child, prefix, currentKey + char, keys);
    }
  }

  /**
   * Collect trie statistics
   * 
   * @param node Current node
   * @param depth Current depth
   * @param stats Statistics object to update
   */
  private collectStatistics(node: PatriciaNode, depth: number, stats: any): void {
    stats.totalNodes++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (node.isLeaf) {
      stats.totalLeaves++;
    }

    for (const child of node.children.values()) {
      this.collectStatistics(child, depth + 1, stats);
    }
  }

  /**
   * Store RPC call
   * 
   * @param call RPC call structure
   * @param signature Call signature
   */
  storeRPCCall(call: RPCCall, signature: string): void {
    const key = this.generateRPCKey(call);
    const data = this.serializeRPCCall(call);
    this.insert(key, data, signature);
  }

  /**
   * Retrieve RPC call
   * 
   * @param method RPC method name
   * @param params RPC parameters
   * @param timestamp Call timestamp
   * @returns RPC call with signature, or null if not found
   */
  getRPCCall(method: string, params: any[], timestamp: number): { call: RPCCall; signature: string } | null {
    const call: RPCCall = { method, params, signature: '', timestamp };
    const key = this.generateRPCKey(call);
    const result = this.get(key);

    if (!result) {
      return null;
    }

    const deserializedCall = this.deserializeRPCCall(result.data);
    return {
      call: deserializedCall,
      signature: result.signature
    };
  }

  /**
   * Generate RPC key
   * 
   * @param call RPC call
   * @returns Unique key for the call
   */
  private generateRPCKey(call: RPCCall): string {
    const paramsHash = this.hashParams(call.params);
    return `${call.method}:${paramsHash}:${call.timestamp}`;
  }

  /**
   * Hash parameters for key generation
   * 
   * @param params RPC parameters
   * @returns Hash string
   */
  private hashParams(params: any[]): string {
    const str = JSON.stringify(params);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Serialize RPC call to binary data
   * 
   * @param call RPC call
   * @returns Binary data
   */
  private serializeRPCCall(call: RPCCall): Uint8Array {
    const json = JSON.stringify(call);
    return new TextEncoder().encode(json);
  }

  /**
   * Deserialize binary data to RPC call
   * 
   * @param data Binary data
   * @returns RPC call
   */
  private deserializeRPCCall(data: Uint8Array): RPCCall {
    const json = new TextDecoder().decode(data);
    return JSON.parse(json);
  }

  /**
   * Get all RPC calls for a method
   * 
   * @param method RPC method name
   * @returns Array of RPC calls with signatures
   */
  getRPCCallsForMethod(method: string): Array<{ call: RPCCall; signature: string }> {
    const prefix = `${method}:`;
    const keys = this.getKeysWithPrefix(prefix);
    const calls: Array<{ call: RPCCall; signature: string }> = [];

    for (const key of keys) {
      const result = this.get(key);
      if (result) {
        const call = this.deserializeRPCCall(result.data);
        calls.push({ call, signature: result.signature });
      }
    }

    return calls;
  }

  /**
   * Clear all data and signatures
   */
  clear(): void {
    this.root = {
      key: '',
      children: new Map(),
      isLeaf: false
    };
    this.signatures.clear();
  }

  /**
   * Export trie data
   * 
   * @returns Serializable trie data
   */
  export(): { data: Record<string, string>; signatures: Record<string, string> } {
    const data: Record<string, string> = {};
    const signatures: Record<string, string> = {};

    this.exportNode(this.root, '', data);

    for (const [key, signature] of this.signatures) {
      signatures[key] = signature;
    }

    return { data, signatures };
  }

  /**
   * Import trie data
   * 
   * @param exported Exported trie data
   */
  import(exported: { data: Record<string, string>; signatures: Record<string, string> }): void {
    this.clear();

    for (const [key, dataStr] of Object.entries(exported.data)) {
      const data = new TextEncoder().encode(dataStr);
      const signature = exported.signatures[key];
      if (signature) {
        this.insert(key, data, signature);
      }
    }
  }

  /**
   * Export node data
   * 
   * @param node Current node
   * @param currentKey Current key being built
   * @param data Data object to populate
   */
  private exportNode(node: PatriciaNode, currentKey: string, data: Record<string, string>): void {
    if (node.isLeaf && node.value) {
      data[currentKey] = new TextDecoder().decode(node.value);
    }

    for (const [char, child] of node.children) {
      this.exportNode(child, currentKey + char, data);
    }
  }
}
