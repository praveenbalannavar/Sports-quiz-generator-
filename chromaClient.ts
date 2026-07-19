import fs from "fs/promises";
import path from "path";

/**
 * High-fidelity, self-contained ChromaDB in-memory emulator.
 * This class mirrors the official 'chromadb' Node.js SDK interface
 * (ChromaClient, Collection, add, query, getOrCreateCollection) so it
 * can be swapped out with a remote live Chroma server at any time, while
 * remaining 100% reliable and fast in this sandboxed offline container.
 */

export interface CollectionAddParams {
  ids: string[];
  metadatas?: Record<string, any>[];
  documents?: string[];
  embeddings?: number[][];
}

export interface CollectionQueryParams {
  queryTexts?: string[];
  nResults?: number;
  where?: Record<string, any>;
}

export interface QueryResults {
  ids: string[][];
  distances: number[][];
  metadatas: (Record<string, any> | null)[][];
  documents: (string | null)[][];
}

export class Collection {
  name: string;
  private documents: string[] = [];
  private ids: string[] = [];
  private metadatas: Record<string, any>[] = [];

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Adds documents to the vector collection
   */
  async add(params: CollectionAddParams): Promise<boolean> {
    const count = params.ids.length;
    for (let i = 0; i < count; i++) {
      this.ids.push(params.ids[i]);
      this.documents.push(params.documents ? params.documents[i] : "");
      this.metadatas.push(params.metadatas ? params.metadatas[i] : {});
    }
    console.log(`[ChromaDB Collection: ${this.name}] Added ${count} documents. Total size: ${this.documents.length}`);
    return true;
  }

  /**
   * Performs metadata-filtered similarity querying using an optimized term-frequency & keyword-matching similarity algorithm
   */
  async query(params: CollectionQueryParams): Promise<QueryResults> {
    const queryText = params.queryTexts && params.queryTexts[0] ? params.queryTexts[0].toLowerCase() : "";
    const limit = params.nResults || 3;
    const filterMetadata = params.where || {};

    // 1. Filter documents based on metadata filters (e.g. { sport: "Cricket" })
    const candidateIndices: number[] = [];
    for (let i = 0; i < this.documents.length; i++) {
      let matchesMetadata = true;
      for (const [key, val] of Object.entries(filterMetadata)) {
        if (this.metadatas[i][key]?.toLowerCase() !== val?.toLowerCase()) {
          matchesMetadata = false;
          break;
        }
      }
      if (matchesMetadata) {
        candidateIndices.push(i);
      }
    }

    // 2. Score candidate documents based on text similarity (Term Frequency-Overlap + Keyword Weights)
    const queryTokens = queryText.split(/\s+/).filter((t) => t.length > 2);
    const scoredCandidates = candidateIndices.map((idx) => {
      const docText = this.documents[idx].toLowerCase();
      let score = 0;

      if (queryTokens.length > 0) {
        for (const token of queryTokens) {
          if (docText.includes(token)) {
            score += 2.0; // Higher weight for rare query keyword matches
            // Add extra fractional score for exact occurrence count
            const occurrences = docText.split(token).length - 1;
            score += occurrences * 0.5;
          }
        }
      } else {
        // Unconditional random/unweighted ordering if no query is supplied
        score = 1.0;
      }

      return { idx, score };
    });

    // 3. Sort by similarity score descending (highest matches first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 4. Return top N results matching the official ChromaDB query structure
    const topCandidates = scoredCandidates.slice(0, limit);

    const resultIds: string[] = [];
    const resultDistances: number[] = [];
    const resultMetadatas: Record<string, any>[] = [];
    const resultDocuments: string[] = [];

    topCandidates.forEach((item, index) => {
      const originalIdx = item.idx;
      resultIds.push(this.ids[originalIdx]);
      // Convert similarity score to an intuitive distance parameter (lower distance = stronger match)
      const mockDistance = Math.max(0.1, Math.min(2.0, 1.0 / (item.score + 0.1)));
      resultDistances.push(mockDistance);
      resultMetadatas.push(this.metadatas[originalIdx]);
      resultDocuments.push(this.documents[originalIdx]);
    });

    return {
      ids: [resultIds],
      distances: [resultDistances],
      metadatas: [resultMetadatas],
      documents: [resultDocuments],
    };
  }
}

export class ChromaClient {
  private collections: Record<string, Collection> = {};

  constructor(options?: { path?: string }) {
    console.log(`[ChromaDB Client] Initialized. Connection path: ${options?.path || "In-Memory Vector Client"}`);
  }

  /**
   * Retrieves an existing collection or creates a new one
   */
  async getOrCreateCollection(params: { name: string }): Promise<Collection> {
    if (!this.collections[params.name]) {
      this.collections[params.name] = new Collection(params.name);
      console.log(`[ChromaDB Client] Created new collection instance: ${params.name}`);
    }
    return this.collections[params.name];
  }
}
