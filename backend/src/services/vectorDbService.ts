/**
 * Vector Database Service
 * Manages semantic component search using embeddings
 * Uses Chroma for local development, Pinecone for production
 */

import { COMPONENT_LIBRARY, ComponentMetadata } from '../config/componentLibrary';

// Simple in-memory vector store for development (can be replaced with Chroma/Pinecone)
interface VectorEntry {
  id: string;
  vector: number[];
  metadata: ComponentMetadata;
  text: string;
}

class VectorDbService {
  private vectors: Map<string, VectorEntry> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize vector database with component library
   * In production, this would sync with Chroma/Pinecone
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing vector database with component library...');

    // For development: create simple embeddings
    for (const component of COMPONENT_LIBRARY) {
      const text = this.componentToText(component);
      const vector = this.createSimpleEmbedding(text);

      this.vectors.set(component.id, {
        id: component.id,
        vector,
        metadata: component,
        text,
      });
    }

    this.initialized = true;
    console.log(`✓ Vector database initialized with ${this.vectors.size} components`);
  }

  /**
   * Search for similar components based on a query
   * Returns top N most relevant components
   */
  async searchComponents(query: string, limit: number = 5): Promise<ComponentMetadata[]> {
    await this.initialize();

    const queryVector = this.createSimpleEmbedding(query);
    const similarities: Array<{ component: ComponentMetadata; score: number }> = [];

    // Calculate similarity scores with all components
    for (const entry of this.vectors.values()) {
      const score = this.cosineSimilarity(queryVector, entry.vector);
      similarities.push({ component: entry.metadata, score });
    }

    // Sort by score and return top N
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.component);
  }

  /**
   * Find components by category
   */
  async getComponentsByCategory(category: string): Promise<ComponentMetadata[]> {
    await this.initialize();

    return Array.from(this.vectors.values())
      .filter(entry => entry.metadata.category === category)
      .map(entry => entry.metadata);
  }

  /**
   * Find components by tag
   */
  async getComponentsByTag(tag: string): Promise<ComponentMetadata[]> {
    await this.initialize();

    return Array.from(this.vectors.values())
      .filter(entry => entry.metadata.tags.includes(tag.toLowerCase()))
      .map(entry => entry.metadata);
  }

  /**
   * Get related components for UI suggestions
   */
  async getRelatedComponents(componentId: string): Promise<ComponentMetadata[]> {
    await this.initialize();

    const entry = this.vectors.get(componentId);
    if (!entry) return [];

    const component = entry.metadata;
    const related: ComponentMetadata[] = [];

    // Get explicitly related components
    if (component.relatedComponents) {
      for (const relatedId of component.relatedComponents) {
        const relatedEntry = this.vectors.get(relatedId);
        if (relatedEntry) {
          related.push(relatedEntry.metadata);
        }
      }
    }

    // Get components from same category
    const sameCategory = Array.from(this.vectors.values())
      .filter(e => e.metadata.category === component.category && e.id !== componentId)
      .slice(0, 2)
      .map(e => e.metadata);

    return [...related, ...sameCategory].slice(0, 5);
  }

  /**
   * Smart component recommendation based on context
   * E.g., if user mentions "form", recommend form components
   */
  async recommendComponents(context: string, limit: number = 8): Promise<ComponentMetadata[]> {
    const contextLower = context.toLowerCase();

    // Map common keywords to component categories/tags
    const categoryMap: Record<string, string[]> = {
      'login': ['form', 'input', 'button', 'card'],
      'signup': ['form', 'input', 'button', 'feedback'],
      'form': ['form', 'input', 'button'],
      'navigation': ['navigation'],
      'menu': ['navigation', 'button'],
      'list': ['card', 'layout'],
      'table': ['data', 'layout'],
      'product': ['card', 'layout', 'media'],
      'search': ['input', 'button'],
      'filter': ['input', 'layout'],
      'modal': ['feedback', 'layout'],
      'notification': ['feedback', 'alert'],
      'error': ['feedback'],
      'success': ['feedback'],
      'profile': ['card', 'layout', 'media'],
      'dashboard': ['layout', 'card', 'data'],
      'checkout': ['form', 'input', 'button', 'card'],
      'payment': ['form', 'input', 'button'],
    };

    const recommendedIds = new Set<string>();
    const results: Array<{ component: ComponentMetadata; score: number }> = [];

    // Find keyword matches
    for (const [keyword, categories] of Object.entries(categoryMap)) {
      if (contextLower.includes(keyword)) {
        // Add components from matching categories
        for (const category of categories) {
          const components = await this.getComponentsByCategory(category);
          components.forEach(c => {
            if (!recommendedIds.has(c.id)) {
              recommendedIds.add(c.id);
              results.push({ component: c, score: 1 });
            }
          });
        }
      }
    }

    // If no keyword matches, do semantic search
    if (results.length === 0) {
      const searchResults = await this.searchComponents(context, limit);
      return searchResults;
    }

    return results.slice(0, limit).map(r => r.component);
  }

  /**
   * Convert component to searchable text
   */
  private componentToText(component: ComponentMetadata): string {
    return `
      ${component.name}
      ${component.description}
      ${component.usage}
      ${component.tags.join(' ')}
      ${component.category}
      ${component.variants?.join(' ') || ''}
    `.toLowerCase();
  }

  /**
   * Create a simple embedding from text (for development)
   * In production, would use OpenAI Embeddings API
   */
  private createSimpleEmbedding(text: string): number[] {
    // Simple hash-based embedding for development
    // In production, use: from openai import OpenAIEmbeddings
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // 384-dim vector

    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }

      const index = Math.abs(hash) % 384;
      embedding[index] += 1;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => (magnitude > 0 ? val / magnitude : 0));
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Get all components (useful for fallback)
   */
  async getAllComponents(): Promise<ComponentMetadata[]> {
    await this.initialize();
    return Array.from(this.vectors.values()).map(entry => entry.metadata);
  }
}

// Export singleton instance
export const vectorDbService = new VectorDbService();
