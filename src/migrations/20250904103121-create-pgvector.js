'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');

    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    await queryInterface.sequelize.query(`
      ALTER TABLE analyses 
      ADD COLUMN IF NOT EXISTS summary_embedding vector(1536);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_embedding 
      ON analyses USING ivfflat (summary_embedding vector_cosine_ops) 
      WITH (lists = 100);
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_ai_embedding;');

    await queryInterface.sequelize.query('ALTER TABLE analyses DROP COLUMN IF EXISTS summary_embedding;');
  },
};