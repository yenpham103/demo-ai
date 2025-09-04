'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_nickname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      agent_nickname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      agent_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_resolved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      resolved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      messages: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      conversation_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_message_content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ai_analyzed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      ai_summary: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customer_sentiment: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      urgency_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_messages: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      first_message_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_message_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sessions');
  },
};
