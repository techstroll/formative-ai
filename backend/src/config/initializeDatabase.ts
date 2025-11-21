/**
 * Database Initialization & Migration Script
 *
 * This script initializes the database schema and runs migrations
 * to ensure all required tables and columns exist.
 */

import { query } from './database';

/**
 * Initialize all database tables and schema
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');

    // Create wireframe_artifacts table with all columns
    await query(`
      CREATE TABLE IF NOT EXISTS wireframe_artifacts (
        id VARCHAR(36) PRIMARY KEY,
        project_id VARCHAR(36),
        research_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        design_type VARCHAR(50),
        svg_content TEXT,
        layout_json JSONB,
        screens JSONB,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1
      )
    `);

    // Add missing columns if they don't exist
    await addColumnIfNotExists('wireframe_artifacts', 'suggested_components', 'JSONB');
    await addColumnIfNotExists('wireframe_artifacts', 'design_suggestions', 'JSONB');

    // Create feature_plans table
    await query(`
      CREATE TABLE IF NOT EXISTS feature_plans (
        id VARCHAR(36) PRIMARY KEY,
        research_id VARCHAR(36) NOT NULL,
        project_id VARCHAR(36),
        product_type VARCHAR(50) DEFAULT 'website',
        features JSONB,
        screen_mappings JSONB,
        screen_count INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'draft',
        locked BOOLEAN DEFAULT FALSE,
        wireframe_id VARCHAR(36),
        reasoning TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1
      )
    `);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

/**
 * Add a column to a table if it doesn't already exist
 */
async function addColumnIfNotExists(
  tableName: string,
  columnName: string,
  columnType: string
): Promise<void> {
  try {
    // Check if column exists
    const result = await query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2
      )`,
      [tableName, columnName]
    );

    if (!result.rows[0].exists) {
      // Column doesn't exist, add it
      await query(
        `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`,
      );
      console.log(`✓ Added column ${columnName} to ${tableName}`);
    }
  } catch (error) {
    console.warn(`Warning: Could not check/add column ${columnName}:`, error);
    // Don't throw - continue with initialization
  }
}

export default initializeDatabase;
