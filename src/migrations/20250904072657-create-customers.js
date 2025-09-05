'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('customer_profiles', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      primary_nickname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_messages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      first_contact: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_contact: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      overall_satisfaction: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      common_issues: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: '{}',
      },
      behavior_pattern: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'new',
      },
      profile_embedding: {
        type: 'vector(1536)',
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });

    await queryInterface.addIndex('customer_profiles', ['customer_key']);
    await queryInterface.addIndex('customer_profiles', ['behavior_pattern']);
    
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_customer_profile_embedding 
      ON customer_profiles USING ivfflat (profile_embedding vector_cosine_ops) 
      WITH (lists = 100);
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('customer_profiles');
  },
};