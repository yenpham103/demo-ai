'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('analyses', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      openai_model: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_needs: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      pain_points: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      customer_mood: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      satisfaction_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      conversation_summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      main_topic: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      resolution_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mentioned_products: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      technical_issues: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      feature_requests: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      openai_response: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      summary_embedding: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });

    await queryInterface.addIndex('analyses', ['session_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('analyses');
  },
};